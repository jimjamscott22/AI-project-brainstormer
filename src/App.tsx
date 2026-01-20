import { useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import BrainstormForm from './components/BrainstormForm';
import IdeaDashboard from './components/IdeaDashboard';
import type { BrainstormContext, BrainstormResult } from './services/brainstormService';
import { generateIdeas } from './services/brainstormService';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BrainstormResult | null>(null);

  const handleBrainstorm = async (context: BrainstormContext) => {
    setIsLoading(true);
    try {
      const data = await generateIdeas(context);
      setResult(data);
    } catch (error) {
      console.error('Brainstorming failed:', error);
      // Fallback if API fails
      setResult({
        understanding: "I had trouble connecting to the local LLM, but here are some general ideas based on common best practices.",
        ideas: [
          { id: 'f1', title: 'Agile Workflow Optimization', description: 'Streamline team sprints and feedback loops.', priority: 'High', effort: 'Medium', impact: 'High' },
          { id: 'f2', title: 'Customer Feedback Loop', description: 'Implement a direct channel for user insights.', priority: 'Medium', effort: 'Low', impact: 'High' }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-brand-primary/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            AI-Powered Planning
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Project <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">Brainstormer</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Generate contextual, high-impact ideas for your team's next big move using local LLM intelligence.
          </p>
        </header>

        {!result ? (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrainstormForm onSubmit={handleBrainstorm} isLoading={isLoading} />
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Brain, title: "Context Aware", desc: "No generic templates. Every idea is tailored to your product." },
                { icon: Sparkles, title: "Local Inference", desc: "Fast, private brainstorming powered by local LLM logic." },
                { icon: Sparkles, title: "Actionable", desc: "Priority, effort, and impact metrics for every suggestion." }
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
            onReset={() => setResult(null)} 
          />
        )}
      </main>

      <footer className="relative z-10 border-t border-slate-800 py-8 mt-12 text-center text-slate-500 text-sm">
        <p>© 2026 AI Project Brainstormer • Private & Local</p>
      </footer>
    </div>
  );
}

export default App;
