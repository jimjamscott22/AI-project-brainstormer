export type ProviderType = 'ollama' | 'lmstudio';

export interface LLMModel {
  id: string;
  name: string;
  size?: string;
  quantization?: string;
  modified?: string;
}

export interface LLMProvider {
  type: ProviderType;
  name: string;
  baseUrl: string;
  isOnline: boolean;
  models: LLMModel[];
}

export interface LLMConfig {
  provider: ProviderType | null;
  model: string | null;
  temperature: number;
  maxTokens: number;
}

// Default endpoints for local LLM providers
// During development, we proxy these through the Vite dev server to bypass CORS
// In production, use environment variables or fallback to localhost
const getProviderEndpoints = (): Record<ProviderType, string> => {
  if (import.meta.env.DEV) {
    // Development mode: use dev server proxy
    return {
      ollama: 'http://localhost:5173/api/ollama',
      lmstudio: 'http://localhost:5173/api/llm-studio',
    };
  }
  
  // Production mode: use environment variables or defaults
  return {
    ollama: import.meta.env.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434',
    lmstudio: import.meta.env.VITE_LMSTUDIO_ENDPOINT || 'http://localhost:1234',
  };
};

const PROVIDER_ENDPOINTS = getProviderEndpoints();

/**
 * Check if Ollama is running and fetch available models
 */
export async function fetchOllamaModels(): Promise<LLMProvider> {
  const baseUrl = PROVIDER_ENDPOINTS.ollama;
  
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    
    if (!response.ok) {
      throw new Error('Ollama not responding');
    }
    
    const data = await response.json();
    const models: LLMModel[] = (data.models || []).map((m: any) => ({
      id: m.name,
      name: m.name.split(':')[0],
      size: formatBytes(m.size),
      quantization: m.name.includes(':') ? m.name.split(':')[1] : 'latest',
      modified: m.modified_at,
    }));
    
    return {
      type: 'ollama',
      name: 'Ollama',
      baseUrl,
      isOnline: true,
      models,
    };
  } catch {
    return {
      type: 'ollama',
      name: 'Ollama',
      baseUrl,
      isOnline: false,
      models: [],
    };
  }
}

/**
 * Check if LM Studio is running and fetch available models
 */
export async function fetchLMStudioModels(): Promise<LLMProvider> {
  const baseUrl = PROVIDER_ENDPOINTS.lmstudio;
  
  try {
    const response = await fetch(`${baseUrl}/v1/models`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    
    if (!response.ok) {
      throw new Error('LM Studio not responding');
    }
    
    const data = await response.json();
    const models: LLMModel[] = (data.data || []).map((m: any) => ({
      id: m.id,
      name: m.id.split('/').pop() || m.id,
      size: undefined,
      quantization: undefined,
    }));
    
    return {
      type: 'lmstudio',
      name: 'LM Studio',
      baseUrl,
      isOnline: true,
      models,
    };
  } catch {
    return {
      type: 'lmstudio',
      name: 'LM Studio',
      baseUrl,
      isOnline: false,
      models: [],
    };
  }
}

// Cache configuration
const CACHE_KEY = 'llm_providers_cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  timestamp: number;
  providers: LLMProvider[];
}

/**
 * Get cached provider data if still valid
 */
function getCachedProviders(): LLMProvider[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - data.timestamp < CACHE_DURATION_MS) {
      return data.providers;
    }
    
    // Cache expired
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    return null;
  }
}

/**
 * Cache provider data
 */
function cacheProviders(providers: LLMProvider[]): void {
  try {
    const data: CachedData = {
      timestamp: Date.now(),
      providers,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache providers:', error);
  }
}

/**
 * Fetch all providers and their models
 * Uses cached data if available and fresh
 */
export async function fetchAllProviders(forceRefresh = false): Promise<LLMProvider[]> {
  // Try to use cached data unless force refresh
  if (!forceRefresh) {
    const cached = getCachedProviders();
    if (cached) {
      return cached;
    }
  }
  
  // Fetch fresh data
  const [ollama, lmstudio] = await Promise.all([
    fetchOllamaModels(),
    fetchLMStudioModels(),
  ]);
  
  const providers = [ollama, lmstudio];
  
  // Cache the results
  cacheProviders(providers);
  
  return providers;
}

/**
 * Generate chat completion using selected provider
 */
export async function generateCompletion(
  config: LLMConfig,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (!config.provider || !config.model) {
    throw new Error('No LLM provider configured');
  }
  
  const baseUrl = PROVIDER_ENDPOINTS[config.provider];
  
  if (config.provider === 'ollama') {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        stream: false,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens,
        },
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama generation failed: ${errorText}`);
    }
    
    const data = await response.json();
    return data.response;
  }
  
  if (config.provider === 'lmstudio') {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LM Studio generation failed: ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
  
  throw new Error('Unknown provider');
}

function formatBytes(bytes: number): string {
  if (!bytes) return '';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}
