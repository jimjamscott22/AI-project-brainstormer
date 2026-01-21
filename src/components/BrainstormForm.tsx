import React from 'react';
import type { BrainstormContext } from '../services/brainstormService';
import { Heart, Wrench, Clock, Flag, Layout } from 'lucide-react';

interface BrainstormFormProps {
  onSubmit: (context: BrainstormContext) => void;
  isLoading: boolean;
}

const BrainstormForm: React.FC<BrainstormFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = React.useState<BrainstormContext>({
    interests: '',
    skills: '',
    timeBudget: 'Weekend',
    goal: 'learn',
    constraints: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all";
  const labelClasses = "flex items-center gap-2 text-sm font-medium text-slate-400 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}><Heart size={16} /> Interests</label>
          <input 
            required
            className={inputClasses}
            placeholder="e.g. music tech, fitness, indie games"
            value={formData.interests}
            onChange={e => setFormData({...formData, interests: e.target.value})}
          />
        </div>
        <div>
          <label className={labelClasses}><Wrench size={16} /> Skills / Stack</label>
          <input 
            required
            className={inputClasses}
            placeholder="e.g. React, Python, Figma"
            value={formData.skills}
            onChange={e => setFormData({...formData, skills: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}><Clock size={16} /> Time Budget</label>
          <select 
            className={inputClasses}
            value={formData.timeBudget}
            onChange={e => setFormData({...formData, timeBudget: e.target.value})}
          >
            <option value="Weekend">Weekend</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="1 month">1 month</option>
            <option value="Longer-term">Longer-term</option>
          </select>
        </div>
        <div>
          <label className={labelClasses}><Layout size={16} /> Project Goal</label>
          <select 
            className={inputClasses}
            value={formData.goal}
            onChange={e => setFormData({...formData, goal: e.target.value as BrainstormContext['goal']})}
          >
            <option value="learn">Learn a new skill</option>
            <option value="portfolio">Portfolio piece</option>
            <option value="automation">Automate my life</option>
            <option value="income">Side income</option>
            <option value="community">Community impact</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClasses}><Flag size={16} /> Constraints</label>
        <textarea 
          required
          rows={3}
          className={inputClasses}
          placeholder="e.g. no backend, free tools only, 2-3 hours/week"
          value={formData.constraints}
          onChange={e => setFormData({...formData, constraints: e.target.value})}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Shaping Ideas...
          </span>
        ) : "Generate Project Ideas"}
      </button>
    </form>
  );
};

export default BrainstormForm;
