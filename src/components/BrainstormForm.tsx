import React from 'react';
import type {
  BackendPreference,
  BrainstormContext,
  DataLayer,
  ExperienceLevel,
  ProjectPlatform,
  TechPreferences,
} from '../services/brainstormService';
import { DEFAULT_BRAINSTORM_CONTEXT } from '../services/brainstormService';
import { Cpu, Database, Flag, Heart, Layers3, Layout, Rocket, Server, TimerReset } from 'lucide-react';

interface BrainstormFormProps {
  onSubmit: (context: BrainstormContext) => void;
  isLoading: boolean;
}

const BrainstormForm: React.FC<BrainstormFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = React.useState<BrainstormContext>(DEFAULT_BRAINSTORM_CONTEXT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all";
  const labelClasses = "flex items-center gap-2 text-sm font-medium text-slate-400 mb-1.5";
  const chipClasses = "px-3 py-2 rounded-xl border text-sm transition-all";

  const updateTechPreferences = <K extends keyof TechPreferences>(key: K, value: TechPreferences[K]) => {
    setFormData((current) => ({
      ...current,
      techPreferences: {
        ...current.techPreferences,
        [key]: value,
      },
    }));
  };

  const toggleSelection = (key: 'preferredLanguages' | 'preferredFrameworks', value: string) => {
    const currentValues = formData.techPreferences?.[key] ?? [];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    updateTechPreferences(key, nextValues);
  };

  const fieldLabel = (id: string, icon: React.ReactNode, text: string) => (
    <label htmlFor={id} className={labelClasses}>
      {icon}
      {text}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {fieldLabel('interests', <Heart size={16} />, 'Interests')}
          <input
            id="interests"
            required
            className={inputClasses}
            placeholder="e.g. music tech, fitness, indie games"
            value={formData.interests}
            onChange={e => setFormData({...formData, interests: e.target.value})}
          />
        </div>
        <div>
          {fieldLabel('goal', <Layout size={16} />, 'Project Goal')}
          <select
            id="goal"
            className={inputClasses}
            value={formData.goal}
            onChange={e => setFormData({...formData, goal: e.target.value as BrainstormContext['goal']})}
          >
            <option value="learn">Learn a new skill</option>
            <option value="portfolio">Portfolio piece</option>
            <option value="automation">Automate my life</option>
            <option value="income">Side income</option>
            <option value="community">Community impact</option>
            <option value="fun">Just for fun</option>
            <option value="productivity">Boost productivity</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {fieldLabel('timeBudget', <TimerReset size={16} />, 'Time Budget')}
          <select
            id="timeBudget"
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
          {fieldLabel('platform', <Rocket size={16} />, 'Platform')}
          <select
            id="platform"
            className={inputClasses}
            value={formData.techPreferences?.platform}
            onChange={e => updateTechPreferences('platform', e.target.value as ProjectPlatform)}
          >
            <option value="web">Web app</option>
            <option value="mobile">Mobile app</option>
            <option value="desktop">Desktop app</option>
            <option value="cli">CLI tool</option>
            <option value="api">API service</option>
            <option value="game">Game prototype</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {fieldLabel('experienceLevel', <Cpu size={16} />, 'Experience Level')}
          <select
            id="experienceLevel"
            className={inputClasses}
            value={formData.techPreferences?.experienceLevel}
            onChange={e => updateTechPreferences('experienceLevel', e.target.value as ExperienceLevel)}
          >
            <option value="use-what-i-know">Use what I already know</option>
            <option value="mix-known-and-new">Mix familiar tools with one stretch area</option>
            <option value="learn-new-stack">Learn a new stack on purpose</option>
          </select>
        </div>
        <div>
          {fieldLabel('backendPreference', <Server size={16} />, 'Backend Preference')}
          <select
            id="backendPreference"
            className={inputClasses}
            value={formData.techPreferences?.backendPreference}
            onChange={e => updateTechPreferences('backendPreference', e.target.value as BackendPreference)}
          >
            <option value="none">No backend</option>
            <option value="frontend-only">Frontend-only</option>
            <option value="optional">Backend optional</option>
            <option value="required">Backend required</option>
          </select>
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
        <div>
          <p className={labelClasses}><Layers3 size={16} /> Preferred Languages</p>
          <div className="flex flex-wrap gap-2">
            {['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Swift', 'Kotlin', 'C#'].map((language) => {
              const active = (formData.techPreferences?.preferredLanguages ?? []).includes(language);
              return (
                <button
                  key={language}
                  type="button"
                  onClick={() => toggleSelection('preferredLanguages', language)}
                  className={`${chipClasses} ${active ? 'border-brand-primary/60 bg-brand-primary/15 text-brand-primary' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'}`}
                  aria-pressed={active}
                >
                  {language}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className={labelClasses}><Cpu size={16} /> Preferred Frameworks</p>
          <div className="flex flex-wrap gap-2">
            {['React', 'Next.js', 'Vue', 'Svelte', 'Node.js', 'Express', 'FastAPI', 'Supabase', 'Electron', 'Tauri', 'React Native', 'Flutter', 'Phaser'].map((framework) => {
              const active = (formData.techPreferences?.preferredFrameworks ?? []).includes(framework);
              return (
                <button
                  key={framework}
                  type="button"
                  onClick={() => toggleSelection('preferredFrameworks', framework)}
                  className={`${chipClasses} ${active ? 'border-brand-secondary/60 bg-brand-secondary/15 text-brand-secondary' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'}`}
                  aria-pressed={active}
                >
                  {framework}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {fieldLabel('dataLayer', <Database size={16} />, 'Data Layer')}
          <select
            id="dataLayer"
            className={inputClasses}
            value={formData.techPreferences?.dataLayer}
            onChange={e => updateTechPreferences('dataLayer', e.target.value as DataLayer)}
          >
            <option value="none">No persisted data</option>
            <option value="local-only">Local-only storage</option>
            <option value="supabase">Supabase</option>
            <option value="sql">SQL database</option>
            <option value="nosql">NoSQL database</option>
            <option value="unsure">Unsure</option>
          </select>
        </div>
        <div>
          {fieldLabel('stackNotes', <Cpu size={16} />, 'Additional Stack Notes')}
          <input
            id="stackNotes"
            className={inputClasses}
            placeholder="e.g. deploy it simply, avoid paid APIs"
            value={formData.techPreferences?.stackNotes}
            onChange={e => updateTechPreferences('stackNotes', e.target.value)}
          />
        </div>
      </div>

      <div>
        {fieldLabel('constraints', <Flag size={16} />, 'Constraints')}
        <textarea
          id="constraints"
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
