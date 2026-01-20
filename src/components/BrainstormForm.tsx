import React from 'react';
import type { BrainstormContext } from '../services/brainstormService';
import { Target, Rocket, Clock, Flag, Layout } from 'lucide-react';

interface BrainstormFormProps {
  onSubmit: (context: BrainstormContext) => void;
  isLoading: boolean;
}

const BrainstormForm: React.FC<BrainstormFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = React.useState<BrainstormContext>({
    companyName: '',
    productName: '',
    timeline: '',
    teamGoals: '',
    sessionType: 'product'
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
          <label className={labelClasses}><Target size={16} /> Company Name</label>
          <input 
            required
            className={inputClasses}
            placeholder="e.g. Acme Corp"
            value={formData.companyName}
            onChange={e => setFormData({...formData, companyName: e.target.value})}
          />
        </div>
        <div>
          <label className={labelClasses}><Rocket size={16} /> Product Name</label>
          <input 
            required
            className={inputClasses}
            placeholder="e.g. SaaS Dashboard"
            value={formData.productName}
            onChange={e => setFormData({...formData, productName: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}><Clock size={16} /> Timeline</label>
          <input 
            required
            className={inputClasses}
            placeholder="e.g. Q3 2026"
            value={formData.timeline}
            onChange={e => setFormData({...formData, timeline: e.target.value})}
          />
        </div>
        <div>
          <label className={labelClasses}><Layout size={16} /> Session Type</label>
          <select 
            className={inputClasses}
            value={formData.sessionType}
            onChange={e => setFormData({...formData, sessionType: e.target.value as any})}
          >
            <option value="product">Product Development</option>
            <option value="marketing">Marketing Growth</option>
            <option value="strategy">Strategic Planning</option>
            <option value="operations">Operational Excellence</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClasses}><Flag size={16} /> Team Goals</label>
        <textarea 
          required
          rows={3}
          className={inputClasses}
          placeholder="What are you trying to achieve?"
          value={formData.teamGoals}
          onChange={e => setFormData({...formData, teamGoals: e.target.value})}
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
            Analyzing Context...
          </span>
        ) : "Generate Brainstorming Ideas"}
      </button>
    </form>
  );
};

export default BrainstormForm;
