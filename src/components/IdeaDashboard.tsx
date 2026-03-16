import React from 'react';
import { motion } from 'framer-motion';
import type { Idea, IdeaElaboration, PlanningAnswers, ProjectPlan } from '../services/brainstormService';
import { Zap, TrendingUp, ShieldCheck, Lightbulb, Download, FileText, Database, Map, Bot, Layers3 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IdeaCardProps {
  idea: Idea;
  index: number;
  isSelected: boolean;
  onSelect: (idea: Idea) => void;
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

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, index, isSelected, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onSelect(idea)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(idea);
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        "bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 hover:border-brand-primary/30 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/40",
        isSelected && "border-brand-primary/60 ring-1 ring-brand-primary/30"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary group-hover:scale-110 transition-transform">
          <Lightbulb size={20} />
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Badge level={idea.priority}>Priority</Badge>
          {isSelected ? (
            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-primary">Selected</span>
          ) : null}
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
  selectedIdea: Idea | null;
  elaboration: IdeaElaboration | null;
  planningAnswers: PlanningAnswers;
  projectPlan: ProjectPlan | null;
  isElaborating: boolean;
  isPlanning: boolean;
  planSource: 'llm' | 'template' | null;
  onSelectIdea: (idea: Idea) => void;
  onPlanningAnswersChange: (answers: PlanningAnswers) => void;
  onGeneratePlan: () => void;
  onReset: () => void;
  onExportJSON?: () => void;
  onExportMarkdown?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  isStorageConfigured?: boolean;
  storageLabel?: string;
}

const IdeaDashboard: React.FC<IdeaDashboardProps> = ({
  understanding,
  ideas,
  selectedIdea,
  elaboration,
  planningAnswers,
  projectPlan,
  isElaborating,
  isPlanning,
  planSource,
  onSelectIdea,
  onPlanningAnswersChange,
  onGeneratePlan,
  onReset,
  onExportJSON,
  onExportMarkdown,
  onSave,
  isSaving = false,
  isStorageConfigured = false,
  storageLabel = 'Database',
}) => {
  const inputClasses = "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all";
  const selectLabelClasses = "block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2";

  const updatePlanningAnswer = <K extends keyof PlanningAnswers>(key: K, value: PlanningAnswers[K]) => {
    onPlanningAnswersChange({
      ...planningAnswers,
      [key]: value,
    });
  };

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
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              Project Ideas
              <span className="text-sm font-normal text-slate-500 bg-slate-800 px-3 py-1 rounded-full">6 Buildable Concepts</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2">Click any card to generate a structured build outline.</p>
          </div>
          <button
            onClick={onReset}
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            ← Generate New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea, idx) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              index={idx}
              isSelected={selectedIdea?.id === idea.id}
              onSelect={onSelectIdea}
            />
          ))}
        </div>

        <div className="mt-10 bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-100">
              {selectedIdea ? `Project Structure: ${selectedIdea.title}` : 'Project Structure'}
            </h3>
            {isElaborating ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 border-2 border-slate-500/40 border-t-brand-primary rounded-full animate-spin" />
                Drafting structure...
              </div>
            ) : null}
          </div>

          {!selectedIdea ? (
            <p className="text-sm text-slate-400">Select a project card to generate a build outline.</p>
          ) : isElaborating ? (
            <p className="text-sm text-slate-400">Working on a concise plan tailored to your context.</p>
          ) : elaboration ? (
            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <p className="text-slate-200 font-semibold mb-1">Overview</p>
                <p>{elaboration.overview}</p>
              </div>
              <div>
                <p className="text-slate-200 font-semibold mb-1">Core Features</p>
                <ul className="list-disc list-inside space-y-1">
                  {(elaboration.coreFeatures.length ? elaboration.coreFeatures : ['Add 3-4 core features for the MVP.']).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-slate-200 font-semibold mb-1">Data Flow</p>
                <p>{elaboration.dataFlow || 'Describe how data moves through the product and what is stored.'}</p>
              </div>
              <div>
                <p className="text-slate-200 font-semibold mb-1">Milestones</p>
                <ul className="list-disc list-inside space-y-1">
                  {(elaboration.milestones.length ? elaboration.milestones : ['Define MVP', 'Build core flow', 'Polish and demo']).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-slate-200 font-semibold mb-1">Risks</p>
                <ul className="list-disc list-inside space-y-1">
                  {(elaboration.risks.length ? elaboration.risks : ['Scope creep', 'Time budget mismatch']).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-slate-200 font-semibold mb-1">Stretch Goals</p>
                <ul className="list-disc list-inside space-y-1">
                  {(elaboration.stretchGoals.length ? elaboration.stretchGoals : ['Nice-to-have polish', 'Optional sharing or export']).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Export and Save Actions */}
              <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-slate-700/50">
                <button
                  onClick={onExportJSON}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg transition-colors"
                >
                  <Download size={16} />
                  Export JSON
                </button>
                <button
                  onClick={onExportMarkdown}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg transition-colors"
                >
                  <FileText size={16} />
                  Export Markdown
                </button>
                {isStorageConfigured && (
                  <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-primary/80 hover:bg-brand-primary border border-brand-primary/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Database size={16} />
                        Save to {storageLabel}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Click the selected project again to fetch a structured outline.</p>
          )}
        </div>

        <div className="mt-8 bg-slate-950/60 border border-slate-700/60 rounded-2xl p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Map size={18} className="text-brand-secondary" />
                Planning Mode
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Answer a few implementation questions, then generate a stack-specific build plan for the selected idea.
              </p>
            </div>
            {planSource ? (
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em]",
                planSource === 'llm'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
              )}>
                <Bot size={14} />
                {planSource === 'llm' ? 'Local LLM Plan' : 'Template Plan'}
              </div>
            ) : null}
          </div>

          {!selectedIdea ? (
            <p className="text-sm text-slate-400">Select an idea first, then use planning mode to turn it into a concrete build plan.</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <div>
                  <label htmlFor="deploymentTarget" className={selectLabelClasses}>Deployment Target</label>
                  <select
                    id="deploymentTarget"
                    className={inputClasses}
                    value={planningAnswers.deploymentTarget}
                    onChange={(event) => updatePlanningAnswer('deploymentTarget', event.target.value as PlanningAnswers['deploymentTarget'])}
                  >
                    <option value="local-first">Local-first</option>
                    <option value="simple-web-deploy">Simple web deploy</option>
                    <option value="desktop-distribution">Desktop distribution</option>
                    <option value="mobile-app-store">Mobile app store</option>
                    <option value="unsure">Unsure</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="authRequirement" className={selectLabelClasses}>Auth Need</label>
                  <select
                    id="authRequirement"
                    className={inputClasses}
                    value={planningAnswers.authRequirement}
                    onChange={(event) => updatePlanningAnswer('authRequirement', event.target.value as PlanningAnswers['authRequirement'])}
                  >
                    <option value="none">No auth</option>
                    <option value="optional">Optional auth</option>
                    <option value="required">Required auth</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="collaborationMode" className={selectLabelClasses}>Audience</label>
                  <select
                    id="collaborationMode"
                    className={inputClasses}
                    value={planningAnswers.collaborationMode}
                    onChange={(event) => updatePlanningAnswer('collaborationMode', event.target.value as PlanningAnswers['collaborationMode'])}
                  >
                    <option value="solo-only">Solo only</option>
                    <option value="small-group">Small group</option>
                    <option value="public-users">Public users</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="deliveryBias" className={selectLabelClasses}>Delivery Bias</label>
                  <select
                    id="deliveryBias"
                    className={inputClasses}
                    value={planningAnswers.deliveryBias}
                    onChange={(event) => updatePlanningAnswer('deliveryBias', event.target.value as PlanningAnswers['deliveryBias'])}
                  >
                    <option value="fastest-mvp">Fastest MVP</option>
                    <option value="balanced">Balanced</option>
                    <option value="portfolio-polish">Portfolio polish</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="integrationNeeds" className={selectLabelClasses}>Integration Needs</label>
                  <select
                    id="integrationNeeds"
                    className={inputClasses}
                    value={planningAnswers.integrationNeeds}
                    onChange={(event) => updatePlanningAnswer('integrationNeeds', event.target.value as PlanningAnswers['integrationNeeds'])}
                  >
                    <option value="none">None</option>
                    <option value="light-integrations">Light integrations</option>
                    <option value="api-heavy">API-heavy</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3">
                <p className="text-sm text-slate-400">
                  Planning for <span className="text-slate-200 font-semibold">{selectedIdea.title}</span>.
                </p>
                <button
                  type="button"
                  onClick={onGeneratePlan}
                  disabled={isPlanning}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Planning...
                    </>
                  ) : (
                    <>
                      <Map size={16} />
                      Generate Build Plan
                    </>
                  )}
                </button>
              </div>

              {projectPlan ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-sm text-slate-300">
                  <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
                    <div>
                      <p className="text-slate-100 font-semibold mb-1 flex items-center gap-2">
                        <Layers3 size={16} className="text-brand-primary" />
                        Recommended Stack
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {projectPlan.recommendedStack.map((item) => (
                          <span key={item} className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-100 font-semibold mb-1">Why This Stack Fits</p>
                      <p>{projectPlan.stackRationale}</p>
                    </div>
                    <div>
                      <p className="text-slate-100 font-semibold mb-1">Architecture Summary</p>
                      <p>{projectPlan.architectureSummary}</p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
                    <div>
                      <p className="text-slate-100 font-semibold mb-1">Feature Phases</p>
                      <ul className="list-disc list-inside space-y-1">
                        {projectPlan.featurePhases.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-slate-100 font-semibold mb-1">Data Model</p>
                      <ul className="list-disc list-inside space-y-1">
                        {projectPlan.dataModel.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-slate-100 font-semibold mb-1">API Needs</p>
                      <ul className="list-disc list-inside space-y-1">
                        {projectPlan.apiNeeds.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-slate-100 font-semibold mb-1">Delivery Milestones</p>
                      <ul className="list-disc list-inside space-y-1">
                        {projectPlan.deliveryMilestones.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-slate-100 font-semibold mb-1">Risks</p>
                      <ul className="list-disc list-inside space-y-1">
                        {projectPlan.risks.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-slate-100 font-semibold mb-1">De-scope First If Needed</p>
                      <ul className="list-disc list-inside space-y-1">
                        {projectPlan.descopingOptions.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Use the planning questions above to generate a concrete stack, architecture, and milestone plan.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaDashboard;
