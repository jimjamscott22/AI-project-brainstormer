import type { Idea, IdeaElaboration, BrainstormContext } from './brainstormService';
import { saveIdeaToMariaDB, getSavedIdeasFromMariaDB, deleteIdeaFromMariaDB } from './mariadbPersistenceService';

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

export function isStorageConfigured(): boolean {
  // MariaDB is considered configured if the backend is set to mariadb
  // (actual connectivity is checked at request time)
  return true;
}

export function getStorageLabel(): string {
  return 'Database';
}

export async function saveIdea(
  idea: Idea,
  elaboration: IdeaElaboration,
  context?: BrainstormContext
): Promise<SaveIdeaResult> {
  return saveIdeaToMariaDB(idea, elaboration, context);
}

export async function getSavedIdeas(): Promise<GetIdeasResult> {
  return getSavedIdeasFromMariaDB();
}

export async function deleteIdea(id: string): Promise<SaveIdeaResult> {
  return deleteIdeaFromMariaDB(id);
}
