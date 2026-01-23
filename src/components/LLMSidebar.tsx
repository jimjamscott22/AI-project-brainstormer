import React, { useEffect, useState, useCallback } from 'react';
import { 
  Server, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Check,
  AlertCircle,
  Cpu,
  Zap,
  Settings
} from 'lucide-react';
import type { LLMProvider, LLMConfig, ProviderType } from '../services/llmProviderService';
import { fetchAllProviders } from '../services/llmProviderService';

interface LLMSidebarProps {
  config: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const LLMSidebar: React.FC<LLMSidebarProps> = ({ config, onConfigChange, isExpanded, onToggleExpanded }) => {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refreshProviders = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const data = await fetchAllProviders(forceRefresh);
      setProviders(data);
      setLastRefresh(new Date());
      
      // Auto-select first available model if none selected
      if (!config.model) {
        const onlineProvider = data.find(p => p.isOnline && p.models.length > 0);
        if (onlineProvider) {
          onConfigChange({
            ...config,
            provider: onlineProvider.type,
            model: onlineProvider.models[0].id,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [config, onConfigChange]);

  useEffect(() => {
    refreshProviders(false); // Use cache on mount
    // Refresh every 30 seconds (will use cache if still valid)
    const interval = setInterval(() => refreshProviders(false), 30000);
    return () => clearInterval(interval);
  }, [refreshProviders]);

  const handleSelectModel = (providerType: ProviderType, modelId: string) => {
    onConfigChange({ provider: providerType, model: modelId });
  };

  const onlineCount = providers.filter(p => p.isOnline).length;
  const totalModels = providers.reduce((acc, p) => acc + p.models.length, 0);

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-50 transition-all duration-300 flex flex-col ${
        isExpanded ? 'w-72' : 'w-14'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {isExpanded && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
              <Cpu size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Local LLMs</h2>
              <p className="text-[10px] text-slate-500">
                {onlineCount} provider{onlineCount !== 1 ? 's' : ''} • {totalModels} model{totalModels !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleExpanded}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Refresh Button */}
          <button
            onClick={() => refreshProviders(true)} // Force refresh on manual click
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all text-xs font-medium disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Scanning...' : 'Refresh Providers'}
          </button>

          {/* Providers List */}
          {providers.map((provider) => (
            <div key={provider.type} className="space-y-2">
              {/* Provider Header */}
              <div className="flex items-center gap-2 py-2">
                <Server size={14} className={provider.isOnline ? 'text-emerald-400' : 'text-slate-600'} />
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  provider.isOnline ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {provider.name}
                </span>
                <div className={`ml-auto flex items-center gap-1 text-[10px] font-medium ${
                  provider.isOnline ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    provider.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`} />
                  {provider.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>

              {/* Models or Empty State */}
              {provider.isOnline ? (
                provider.models.length > 0 ? (
                  <div className="space-y-1">
                    {provider.models.map((model) => {
                      const isSelected = config.provider === provider.type && config.model === model.id;
                      return (
                        <button
                          key={model.id}
                          onClick={() => handleSelectModel(provider.type, model.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-brand-primary/10 border-brand-primary/50 shadow-lg shadow-brand-primary/10'
                              : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold truncate ${
                                  isSelected ? 'text-brand-primary' : 'text-slate-200'
                                }`}>
                                  {model.name}
                                </span>
                                {isSelected && (
                                  <Check size={14} className="text-brand-primary flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {model.quantization && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 font-mono">
                                    {model.quantization}
                                  </span>
                                )}
                                {model.size && (
                                  <span className="text-[10px] text-slate-500">
                                    {model.size}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-800/20 border border-slate-700/30 text-center">
                    <AlertCircle size={16} className="text-amber-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">No models loaded</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Pull a model in {provider.name}
                    </p>
                  </div>
                )
              ) : (
                <div className="p-3 rounded-lg bg-slate-800/20 border border-slate-700/30 text-center">
                  <AlertCircle size={16} className="text-slate-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Not running</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Start {provider.name} to see models
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Current Selection */}
          {config.model && (
            <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/20">
              <div className="flex items-center gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-2">
                <Zap size={12} />
                Active Model
              </div>
              <p className="text-sm font-semibold text-white truncate">{config.model}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                via {providers.find(p => p.type === config.provider)?.name || config.provider}
              </p>
            </div>
          )}

          {/* Model Parameters */}
          {config.model && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Settings size={12} />
                Parameters
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">Temperature</label>
                  <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    {config.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => onConfigChange({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <p className="text-[10px] text-slate-600">
                  Lower = focused, Higher = creative
                </p>
              </div>

              {/* Max Tokens Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">Max Tokens</label>
                  <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    {config.maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="4000"
                  step="100"
                  value={config.maxTokens}
                  onChange={(e) => onConfigChange({ ...config, maxTokens: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <p className="text-[10px] text-slate-600">
                  Max response length
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed State Indicator */}
      {!isExpanded && (
        <div className="flex-1 flex flex-col items-center pt-4 gap-3">
          {providers.map((provider) => (
            <div
              key={provider.type}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                provider.isOnline 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-slate-800 text-slate-600'
              }`}
              title={`${provider.name}: ${provider.isOnline ? 'Online' : 'Offline'}`}
            >
              <Server size={16} />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {isExpanded && lastRefresh && (
        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-600">
            Last checked: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      )}
    </aside>
  );
};

export default LLMSidebar;
