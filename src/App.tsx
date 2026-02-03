import { useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import BrainstormForm from './components/BrainstormForm';
import IdeaDashboard from './components/IdeaDashboard';
import LLMSidebar from './components/LLMSidebar';
import ToastContainer, { type Toast } from './components/Toast';
import type { BrainstormContext, BrainstormResult, Idea, IdeaElaboration } from './services/brainstormService';
import type { LLMConfig } from './services/llmProviderService';
import { generateIdeas, generateIdeaElaboration } from './services/brainstormService';
import { exportToJSON, exportToMarkdown } from './services/exportService';
import { saveIdeaToCloud } from './services/ideaPersistenceService';
import { isSupabaseConfigured } from './services/supabaseClient';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BrainstormResult | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [elaboration, setElaboration] = useState<IdeaElaboration | null>(null);
  const [isElaborating, setIsElaborating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastContext, setLastContext] = useState<BrainstormContext | null>(null);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: null,
    model: null,
    temperature: 0.7,
    maxTokens: 2000,
  });
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string, duration?: number) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleBrainstorm = async (context: BrainstormContext) => {
    setIsLoading(true);
    setSelectedIdea(null);
    setElaboration(null);
    setLastContext(context);
    try {
      const data = await generateIdeas(context, llmConfig);
      setResult(data);
      addToast('success', 'Project ideas generated successfully!', 3000);
    } catch (error) {
      console.error('Brainstorming failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Show error toast
      addToast('error', `LLM generation failed: ${errorMessage}. Using template fallback.`, 7000);
      
      // Fallback if API fails
      setResult({
        understanding: "I had trouble connecting to the local LLM, but here are some solo-friendly ideas based on common best practices.",
        ideas: [
          { id: 'f1', title: 'Personal Habit Tracker', description: 'Build a minimal tracker that fits a weekend scope and highlights one core habit.', priority: 'High', effort: 'Medium', impact: 'High' },
          { id: 'f2', title: 'Single-Feature Demo', description: 'Create one polished feature around an interest area to practice your stack.', priority: 'Medium', effort: 'Low', impact: 'High' }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIdea = async (idea: Idea) => {
    if (!lastContext) {
      addToast('error', 'Please generate ideas first so I can use your context.', 4000);
      return;
    }

    setSelectedIdea(idea);
    setIsElaborating(true);
    setElaboration(null);

    if (!llmConfig.provider || !llmConfig.model) {
      addToast('info', 'No LLM selected — using template elaboration.', 4000);
    }

    try {
      const result = await generateIdeaElaboration(lastContext, idea, llmConfig);
      setElaboration(result.elaboration);
      if (result.source === 'llm') {
        addToast('success', 'Generated a structured project outline.', 3000);
      } else {
        addToast('info', 'Generated a template outline. Select an LLM for richer detail.', 5000);
      }
    } catch (error) {
      console.error('Elaboration failed:', error);
      addToast('error', 'Failed to elaborate on this idea. Please try again.', 5000);
    } finally {
      setIsElaborating(false);
    }
  };

  const handleExportJSON = () => {
    if (!selectedIdea || !elaboration) {
      addToast('error', 'Please select an idea and wait for elaboration first.', 4000);
      return;
    }
    try {
      exportToJSON(selectedIdea, elaboration, lastContext ?? undefined);
      addToast('success', 'Exported idea as JSON file.', 3000);
    } catch (error) {
      console.error('Export failed:', error);
      addToast('error', 'Failed to export idea.', 4000);
    }
  };

  const handleExportMarkdown = () => {
    if (!selectedIdea || !elaboration) {
      addToast('error', 'Please select an idea and wait for elaboration first.', 4000);
      return;
    }
    try {
      exportToMarkdown(selectedIdea, elaboration, lastContext ?? undefined);
      addToast('success', 'Exported idea as Markdown file.', 3000);
    } catch (error) {
      console.error('Export failed:', error);
      addToast('error', 'Failed to export idea.', 4000);
    }
  };

  const handleSaveToCloud = async () => {
    if (!selectedIdea || !elaboration) {
      addToast('error', 'Please select an idea and wait for elaboration first.', 4000);
      return;
    }
    if (!isSupabaseConfigured()) {
      addToast('error', 'Supabase is not configured. Check your environment variables.', 5000);
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveIdeaToCloud(selectedIdea, elaboration, lastContext ?? undefined);
      if (result.success) {
        addToast('success', 'Idea saved to cloud successfully!', 3000);
      } else {
        addToast('error', result.error || 'Failed to save idea to cloud.', 5000);
      }
    } catch (error) {
      console.error('Save to cloud failed:', error);
      addToast('error', 'An unexpected error occurred while saving.', 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-brand-primary/30">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* LLM Provider Sidebar */}
      <LLMSidebar 
        config={llmConfig} 
        onConfigChange={setLlmConfig}
        isExpanded={sidebarExpanded}
        onToggleExpanded={() => setSidebarExpanded(!sidebarExpanded)}
      />

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Main content with left margin for sidebar */}
      <main className={`relative z-10 transition-all duration-300 ${sidebarExpanded ? 'pl-72' : 'pl-14'}`}>
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <header className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">
              <Sparkles size={14} />
              Personal Idea Generator
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Personal <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">Project Ideas</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Turn your interests, skills, and time budget into buildable project ideas with local LLM guidance.
            </p>
            
            {/* LLM Status Indicator */}
            {llmConfig.model ? (
              <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Using {llmConfig.model}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                No LLM selected — using template fallback
              </div>
            )}
          </header>

          {!result ? (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <BrainstormForm onSubmit={handleBrainstorm} isLoading={isLoading} />
              
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  { icon: Brain, title: "Solo-Sized Scope", desc: "Ideas sized to your time and energy, not a whole team." },
                  { icon: Sparkles, title: "Skill-Aligned", desc: "Mixes what you know with what you want to learn next." },
                  { icon: Sparkles, title: "Constraint Smart", desc: "Respects your tools, budget, and personal schedule." }
                ].map((feature, i) => (
                  <div key={i} className="text-center p-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand-primary border border-slate-700">
                      <feature.icon size={24} />
                    </div>
                    <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <IdeaDashboard 
              understanding={result.understanding} 
              ideas={result.ideas} 
              selectedIdea={selectedIdea}
              elaboration={elaboration}
              isElaborating={isElaborating}
              onSelectIdea={handleSelectIdea}
              onExportJSON={handleExportJSON}
              onExportMarkdown={handleExportMarkdown}
              onSaveToCloud={handleSaveToCloud}
              isSaving={isSaving}
              isSupabaseConfigured={isSupabaseConfigured()}
              onReset={() => {
                setResult(null);
                setSelectedIdea(null);
                setElaboration(null);
              }}
            />
          )}
        </div>
      </main>

      <footer className={`relative z-10 border-t border-slate-800 py-8 mt-12 text-center text-slate-500 text-sm transition-all duration-300 ${sidebarExpanded ? 'pl-72' : 'pl-14'}`}>
        <p>© 2026 Personal Project Idea Generator • Private & Local</p>
      </footer>
    </div>
  );
}

export default App;
