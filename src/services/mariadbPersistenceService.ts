import type { Idea, IdeaElaboration, BrainstormContext } from './brainstormService';
import type { ProjectIdeaRow, SaveIdeaResult, GetIdeasResult } from './ideaPersistenceService';

const API_BASE = import.meta.env.VITE_MARIADB_API_URL || '/api';

/**
 * Save an idea to MariaDB via the Express API
 */
export async function saveIdeaToMariaDB(
  idea: Idea,
  elaboration: IdeaElaboration,
  context?: BrainstormContext
): Promise<SaveIdeaResult> {
  try {
    const res = await fetch(`${API_BASE}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: idea.title,
        description: idea.description,
        priority: idea.priority,
        effort: idea.effort,
        impact: idea.impact,
        elaboration,
        context: context ?? null,
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to save idea.' };
    }

    return { success: true, data: json.data as ProjectIdeaRow };
  } catch (err) {
    console.error('MariaDB save error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error while saving idea.',
    };
  }
}

/**
 * Get all saved ideas from MariaDB via the Express API
 */
export async function getSavedIdeasFromMariaDB(): Promise<GetIdeasResult> {
  try {
    const res = await fetch(`${API_BASE}/ideas`);
    const json = await res.json();

    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to fetch ideas.' };
    }

    return { success: true, data: json.data as ProjectIdeaRow[] };
  } catch (err) {
    console.error('MariaDB fetch error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error while fetching ideas.',
    };
  }
}

/**
 * Delete an idea from MariaDB via the Express API
 */
export async function deleteIdeaFromMariaDB(id: string): Promise<SaveIdeaResult> {
  try {
    const res = await fetch(`${API_BASE}/ideas/${id}`, { method: 'DELETE' });
    const json = await res.json();

    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to delete idea.' };
    }

    return { success: true };
  } catch (err) {
    console.error('MariaDB delete error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error while deleting idea.',
    };
  }
}
