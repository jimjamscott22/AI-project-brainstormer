import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Idea, IdeaElaboration, BrainstormContext } from './brainstormService';

export interface ProjectIdeaRow {
  id: string;
  title: string;
  description: string | null;
  priority: 'High' | 'Medium' | 'Low' | null;
  effort: 'High' | 'Medium' | 'Low' | null;
  impact: 'High' | 'Medium' | 'Low' | null;
  elaboration: IdeaElaboration | null;
  context: BrainstormContext | null;
  created_at: string;
  updated_at: string;
}

export interface SaveIdeaResult {
  success: boolean;
  data?: ProjectIdeaRow;
  error?: string;
}

export interface GetIdeasResult {
  success: boolean;
  data?: ProjectIdeaRow[];
  error?: string;
}

/**
 * Save an idea with its elaboration to Supabase
 */
export async function saveIdeaToCloud(
  idea: Idea,
  elaboration: IdeaElaboration,
  context?: BrainstormContext
): Promise<SaveIdeaResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const insertData = {
    title: idea.title,
    description: idea.description,
    priority: idea.priority,
    effort: idea.effort,
    impact: idea.impact,
    elaboration: elaboration as unknown,
    context: (context ?? null) as unknown,
  };

  try {
    const { data, error } = await supabase
      .from('project_ideas')
      .insert(insertData as Record<string, unknown>)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save idea to cloud.',
      };
    }

    return {
      success: true,
      data: data as ProjectIdeaRow,
    };
  } catch (err) {
    console.error('Unexpected error saving idea:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

/**
 * Get all saved ideas from Supabase
 */
export async function getSavedIdeas(): Promise<GetIdeasResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('project_ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch saved ideas.',
      };
    }

    return {
      success: true,
      data: data as ProjectIdeaRow[],
    };
  } catch (err) {
    console.error('Unexpected error fetching ideas:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

/**
 * Delete a saved idea from Supabase
 */
export async function deleteIdeaFromCloud(id: string): Promise<SaveIdeaResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured.',
    };
  }

  try {
    const { error } = await supabase
      .from('project_ideas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete idea.',
      };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error deleting idea:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}
