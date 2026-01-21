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
            Personal Idea Generator
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Personal <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">Project Ideas</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Turn your interests, skills, and time budget into buildable project ideas with local LLM guidance.
          </p>
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
            onReset={() => setResult(null)} 
          />
        )}
      </main>

      <footer className="relative z-10 border-t border-slate-800 py-8 mt-12 text-center text-slate-500 text-sm">
        <p>© 2026 Personal Project Idea Generator • Private & Local</p>
      </footer>
    </div>
  );
}

export default App;
