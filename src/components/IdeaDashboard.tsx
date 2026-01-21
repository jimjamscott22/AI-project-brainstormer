import React from 'react';
import { motion } from 'framer-motion';
import type { Idea } from '../services/brainstormService';
import { Zap, TrendingUp, ShieldCheck, Lightbulb } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IdeaCardProps {
  idea: Idea;
  index: number;
}

const Badge = ({ children, level }: { children: React.ReactNode, level: 'High' | 'Medium' | 'Low' }) => {
  const colors = {
    High: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    Medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  };

  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider", colors[level])}>
      {children}: {level}
    </span>
  );
};

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 hover:border-brand-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary group-hover:scale-110 transition-transform">
          <Lightbulb size={20} />
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Badge level={idea.priority}>Priority</Badge>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-brand-primary transition-colors">
        {idea.title}
      </h3>
      
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        {idea.description}
      </p>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
          <Zap size={12} className="text-amber-500" /> Effort: <span className="text-slate-300">{idea.effort}</span>
        </div>
        <div className="w-1 h-1 bg-slate-700 rounded-full my-auto" />
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
          <TrendingUp size={12} className="text-emerald-500" /> Impact: <span className="text-slate-300">{idea.impact}</span>
        </div>
      </div>
    </motion.div>
  );
};

interface IdeaDashboardProps {
  understanding: string;
  ideas: Idea[];
  onReset: () => void;
}

const IdeaDashboard: React.FC<IdeaDashboardProps> = ({ understanding, ideas, onReset }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 p-8 rounded-3xl backdrop-blur-md"
      >
        <div className="flex items-center gap-3 mb-4 text-brand-primary font-bold tracking-tight">
          <ShieldCheck size={24} />
          <span>YOUR BRIEF, REFLECTED</span>
        </div>
        <p className="text-xl text-slate-200 font-medium leading-relaxed italic">
          "{understanding}"
        </p>
      </motion.div>

      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            Project Ideas 
            <span className="text-sm font-normal text-slate-500 bg-slate-800 px-3 py-1 rounded-full">6 Buildable Concepts</span>
          </h2>
          <button 
            onClick={onReset}
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            ← Generate New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea, idx) => (
            <IdeaCard key={idea.id} idea={idea} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdeaDashboard;
