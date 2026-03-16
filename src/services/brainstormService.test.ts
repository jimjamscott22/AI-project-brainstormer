import { describe, expect, it } from 'vitest';
import * as brainstormService from './brainstormService';

describe('generateIdeas template fallback', () => {
  it('uses structured tech preferences to produce six stack-specific ideas', async () => {
    const result = await brainstormService.generateIdeas({
      interests: 'fitness analytics',
      timeBudget: 'Weekend',
      goal: 'portfolio',
      constraints: 'free tools only',
      techPreferences: {
        platform: 'web',
        experienceLevel: 'mix-known-and-new',
        preferredLanguages: ['TypeScript'],
        preferredFrameworks: ['React', 'Supabase'],
        backendPreference: 'required',
        dataLayer: 'supabase',
        stackNotes: 'keep deployment simple',
      },
    } as never);

    expect(result.ideas).toHaveLength(6);
    expect(
      result.ideas.some((idea) => /typescript|react|supabase/i.test(`${idea.title} ${idea.description}`))
    ).toBe(true);
    expect(result.understanding).toMatch(/typescript|react|supabase/i);
  });
});

describe('generateProjectPlan template fallback', () => {
  it('returns a stack-aware build plan when no local model is selected', async () => {
    const planner = (brainstormService as Record<string, unknown>).generateProjectPlan;

    expect(planner).toBeTypeOf('function');

    const result = await (planner as (
      ...args: unknown[]
    ) => Promise<{
      source: string;
      plan: {
        recommendedStack: string[];
        architectureSummary: string;
        deliveryMilestones: string[];
        descopingOptions: string[];
      };
    }>)(
      {
        interests: 'fitness analytics',
        timeBudget: 'Weekend',
        goal: 'portfolio',
        constraints: 'free tools only',
        techPreferences: {
          platform: 'web',
          experienceLevel: 'mix-known-and-new',
          preferredLanguages: ['TypeScript'],
          preferredFrameworks: ['React'],
          backendPreference: 'required',
          dataLayer: 'supabase',
          stackNotes: 'keep deployment simple',
        },
      },
      {
        id: 'idea-1',
        title: 'React Coach Dashboard',
        description: 'A dashboard for tracking client workouts and trends.',
        priority: 'High',
        effort: 'Medium',
        impact: 'High',
      },
      {
        deploymentTarget: 'simple-web-deploy',
        authRequirement: 'required',
        collaborationMode: 'solo-only',
        deliveryBias: 'balanced',
        integrationNeeds: 'light-integrations',
      }
    );

    expect(result.source).toBe('template');
    expect(result.plan.recommendedStack.join(' ')).toMatch(/typescript|react|supabase/i);
    expect(result.plan.architectureSummary).toMatch(/dashboard|react|supabase/i);
    expect(result.plan.deliveryMilestones).toHaveLength(3);
    expect(result.plan.descopingOptions.length).toBeGreaterThan(0);
  });
});
