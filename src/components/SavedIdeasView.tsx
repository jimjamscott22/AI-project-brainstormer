import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Zap, TrendingUp, Trash2, ChevronDown, ChevronUp, RefreshCw, Database, Calendar, Download, FileText } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ProjectIdeaRow } from '../services/persistenceService';
import type { Idea, IdeaElaboration } from '../services/brainstormService';
import { getSavedIdeas, deleteIdea } from '../services/persistenceService';
import { exportToJSON, exportToMarkdown } from '../services/exportService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Badge = ({ children, level }: { children: React.ReactNode; level: 'High' | 'Medium' | 'Low' }) => {
  const colors = {
    High: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider', colors[level])}>
      {children}: {level}
    </span>
  );
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '\u2014';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '\u2014';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function projectIdeaRowToIdea(row: ProjectIdeaRow): Idea {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    priority: row.priority ?? 'Medium',
    effort: row.effort ?? 'Medium',
    impact: row.impact ?? 'Medium',
  };
}

interface SavedIdeasViewProps {
  onToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, duration?: number) => void;
}

const SavedIdeasView: React.FC<SavedIdeasViewProps> = ({ onToast }) => {
  const [ideas, setIdeas] = useState<ProjectIdeaRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchIdeas = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getSavedIdeas();
    if (result.success) {
      setIdeas(result.data ?? []);
    } else {
      setError(result.error || 'Failed to load saved ideas.');
      onToast('error', result.error || 'Failed to load saved ideas.', 5000);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteIdea(id);
    if (result.success) {
      setIdeas((prev) => prev.filter((i) => i.id !== id));
      setConfirmDeleteId(null);
      if (expandedId === id) setExpandedId(null);
      onToast('success', 'Idea deleted.', 3000);
    } else {
      onToast('error', result.error || 'Failed to delete idea.', 5000);
      setConfirmDeleteId(null);
    }
    setDeletingId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setConfirmDeleteId(null);
  };

  const handleExportJSON = (row: ProjectIdeaRow) => {
    if (!row.elaboration) {
      onToast('error', 'This saved idea does not have enough detail to export.', 4000);
      return;
    }
    try {
      exportToJSON(projectIdeaRowToIdea(row), row.elaboration, row.context ?? undefined);
      onToast('success', 'Exported idea as JSON file.', 3000);
    } catch (err) {
      console.error(err);
      onToast('error', 'Failed to export idea.', 4000);
    }
  };

  const handleExportMarkdown = (row: ProjectIdeaRow) => {
    if (!row.elaboration) {
      onToast('error', 'This saved idea does not have enough detail to export.', 4000);
      return;
    }
    try {
      exportToMarkdown(projectIdeaRowToIdea(row), row.elaboration, row.context ?? undefined);
      onToast('success', 'Exported idea as Markdown file.', 3000);
    } catch (err) {
      console.error(err);
      onToast('error', 'Failed to export idea.', 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-8 h-8 border-2 border-slate-500/40 border-t-brand-primary rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading saved ideas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-rose-400 text-sm">{error}</p>
        <button
          onClick={fetchIdeas}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Database size={40} className="text-slate-600" />
        <p className="text-slate-400 text-sm">No saved ideas yet. Generate and save some first!</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            Saved Ideas
            <span className="text-sm font-normal text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
              {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'}
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-2">Click any card to view the full project outline.</p>
        </div>
        <button
          onClick={fetchIdeas}
          className="text-slate-400 hover:text-white text-sm font-medium transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden"
            >
              {/* Card header — always visible */}
              <button
                onClick={() => toggleExpand(idea.id)}
                aria-expanded={expandedId === idea.id}
                aria-controls={`idea-detail-${idea.id}`}
                className="w-full text-left p-6 hover:bg-slate-800/60 transition-colors group focus:outline-none focus:ring-2 focus:ring-brand-primary/40 rounded-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary group-hover:scale-110 transition-transform flex-shrink-0">
                      <Lightbulb size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-brand-primary transition-colors truncate">
                        {idea.title}
                      </h3>
                      {idea.description && (
                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{idea.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {idea.priority && <Badge level={idea.priority}>Priority</Badge>}
                        {idea.effort && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                            <Zap size={12} className="text-amber-500" /> Effort:{' '}
                            <span className="text-slate-300">{idea.effort}</span>
                          </span>
                        )}
                        {idea.impact && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                            <TrendingUp size={12} className="text-emerald-500" /> Impact:{' '}
                            <span className="text-slate-300">{idea.impact}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Calendar size={10} /> {formatDate(idea.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {expandedId === idea.id ? (
                      <ChevronUp size={18} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence initial={false}>
                {expandedId === idea.id && (
                  <motion.div
                    id={`idea-detail-${idea.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-slate-700/50">
                      {idea.elaboration ? (
                        <ElaborationDetail elaboration={idea.elaboration} />
                      ) : (
                        <p className="text-sm text-slate-500 pt-4">No elaboration saved for this idea.</p>
                      )}

                      {/* Export + delete */}
                      <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-4">
                        <div className="flex flex-wrap gap-3">
                          {(() => {
                            const exportDisabled = !idea.elaboration;
                            const disabledTitle = exportDisabled
                              ? 'This saved idea does not have enough detail to export.'
                              : undefined;

                            return (
                              <>
                          <button
                            type="button"
                            disabled={exportDisabled}
                            title={disabledTitle}
                            aria-disabled={exportDisabled}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportJSON(idea);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-700/50"
                          >
                            <Download size={16} />
                            Export JSON
                          </button>
                          <button
                            type="button"
                            disabled={exportDisabled}
                            title={disabledTitle}
                            aria-disabled={exportDisabled}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportMarkdown(idea);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-700/50"
                          >
                            <FileText size={16} />
                            Export Markdown
                          </button>
                              </>
                            );
                          })()}
                        </div>
                        {confirmDeleteId === idea.id ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400">Delete this idea?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(idea.id)}
                              disabled={deletingId === idea.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deletingId === idea.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              Yes, delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(idea.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ElaborationDetail: React.FC<{ elaboration: IdeaElaboration }> = ({ elaboration }) => (
  <div className="space-y-4 text-sm text-slate-300 pt-4">
    <div>
      <p className="text-slate-200 font-semibold mb-1">Overview</p>
      <p>{elaboration.overview}</p>
    </div>
    {elaboration.coreFeatures.length > 0 && (
      <div>
        <p className="text-slate-200 font-semibold mb-1">Core Features</p>
        <ul className="list-disc list-inside space-y-1">
          {elaboration.coreFeatures.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )}
    {elaboration.dataFlow && (
      <div>
        <p className="text-slate-200 font-semibold mb-1">Data Flow</p>
        <p>{elaboration.dataFlow}</p>
      </div>
    )}
    {elaboration.milestones.length > 0 && (
      <div>
        <p className="text-slate-200 font-semibold mb-1">Milestones</p>
        <ul className="list-disc list-inside space-y-1">
          {elaboration.milestones.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )}
    {elaboration.risks.length > 0 && (
      <div>
        <p className="text-slate-200 font-semibold mb-1">Risks</p>
        <ul className="list-disc list-inside space-y-1">
          {elaboration.risks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )}
    {elaboration.stretchGoals.length > 0 && (
      <div>
        <p className="text-slate-200 font-semibold mb-1">Stretch Goals</p>
        <ul className="list-disc list-inside space-y-1">
          {elaboration.stretchGoals.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default SavedIdeasView;
