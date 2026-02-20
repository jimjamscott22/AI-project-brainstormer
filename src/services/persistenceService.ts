import type { Idea, IdeaElaboration, BrainstormContext } from './brainstormService';
import type { SaveIdeaResult, GetIdeasResult } from './ideaPersistenceService';
import { saveIdeaToCloud, getSavedIdeas as getSupabaseIdeas, deleteIdeaFromCloud } from './ideaPersistenceService';
import { isSupabaseConfigured } from './supabaseClient';
import { saveIdeaToMariaDB, getSavedIdeasFromMariaDB, deleteIdeaFromMariaDB } from './mariadbPersistenceService';

type StorageBackend = 'mariadb' | 'supabase';

function getBackend(): StorageBackend {
  const env = import.meta.env.VITE_STORAGE_BACKEND;
  if (env === 'mariadb' || env === 'supabase') return env;
  // Default: use mariadb if configured, otherwise supabase
  return 'mariadb';
}

export function isStorageConfigured(): boolean {
  const backend = getBackend();
  if (backend === 'supabase') return isSupabaseConfigured();
  // MariaDB is considered configured if the backend is set to mariadb
  // (actual connectivity is checked at request time)
  return true;
}

export function getStorageLabel(): string {
  return getBackend() === 'supabase' ? 'Cloud' : 'Database';
}

export async function saveIdea(
  idea: Idea,
  elaboration: IdeaElaboration,
  context?: BrainstormContext
): Promise<SaveIdeaResult> {
  const backend = getBackend();
  if (backend === 'supabase') return saveIdeaToCloud(idea, elaboration, context);
  return saveIdeaToMariaDB(idea, elaboration, context);
}

export async function getSavedIdeas(): Promise<GetIdeasResult> {
  const backend = getBackend();
  if (backend === 'supabase') return getSupabaseIdeas();
  return getSavedIdeasFromMariaDB();
}

export async function deleteIdea(id: string): Promise<SaveIdeaResult> {
  const backend = getBackend();
  if (backend === 'supabase') return deleteIdeaFromCloud(id);
  return deleteIdeaFromMariaDB(id);
}
