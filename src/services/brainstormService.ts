import type { LLMConfig } from './llmProviderService';
import { generateCompletion } from './llmProviderService';

export type ProjectGoal =
  | 'learn'
  | 'portfolio'
  | 'automation'
  | 'income'
  | 'community'
  | 'fun'
  | 'productivity';

export type ProjectPlatform = 'web' | 'mobile' | 'desktop' | 'cli' | 'api' | 'game';
export type ExperienceLevel = 'use-what-i-know' | 'mix-known-and-new' | 'learn-new-stack';
export type BackendPreference = 'none' | 'frontend-only' | 'optional' | 'required';
export type DataLayer = 'none' | 'local-only' | 'supabase' | 'sql' | 'nosql' | 'unsure';

export interface TechPreferences {
  platform: ProjectPlatform;
  experienceLevel: ExperienceLevel;
  preferredLanguages: string[];
  preferredFrameworks: string[];
  backendPreference: BackendPreference;
  dataLayer: DataLayer;
  stackNotes: string;
}

export interface BrainstormContext {
  interests: string;
  skills?: string;
  timeBudget: string;
  goal: ProjectGoal;
  constraints: string;
  techPreferences?: Partial<TechPreferences>;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
}

export interface IdeaElaboration {
  overview: string;
  coreFeatures: string[];
  dataFlow: string;
  milestones: string[];
  risks: string[];
  stretchGoals: string[];
}

export interface IdeaElaborationResult {
  elaboration: IdeaElaboration;
  source: 'llm' | 'template';
}

export interface BrainstormResult {
  understanding: string;
  ideas: Idea[];
}

export type DeploymentTarget = 'local-first' | 'simple-web-deploy' | 'desktop-distribution' | 'mobile-app-store' | 'unsure';
export type AuthRequirement = 'none' | 'optional' | 'required';
export type CollaborationMode = 'solo-only' | 'small-group' | 'public-users';
export type DeliveryBias = 'fastest-mvp' | 'balanced' | 'portfolio-polish';
export type IntegrationNeeds = 'none' | 'light-integrations' | 'api-heavy';

export interface PlanningAnswers {
  deploymentTarget: DeploymentTarget;
  authRequirement: AuthRequirement;
  collaborationMode: CollaborationMode;
  deliveryBias: DeliveryBias;
  integrationNeeds: IntegrationNeeds;
}

export interface ProjectPlan {
  recommendedStack: string[];
  stackRationale: string;
  architectureSummary: string;
  featurePhases: string[];
  dataModel: string[];
  apiNeeds: string[];
  deliveryMilestones: string[];
  risks: string[];
  descopingOptions: string[];
}

export interface ProjectPlanResult {
  plan: ProjectPlan;
  source: 'llm' | 'template';
}

export const DEFAULT_TECH_PREFERENCES: TechPreferences = {
  platform: 'web',
  experienceLevel: 'mix-known-and-new',
  preferredLanguages: ['TypeScript'],
  preferredFrameworks: ['React'],
  backendPreference: 'optional',
  dataLayer: 'local-only',
  stackNotes: '',
};

export const DEFAULT_BRAINSTORM_CONTEXT: BrainstormContext = {
  interests: '',
  timeBudget: 'Weekend',
  goal: 'learn',
  constraints: '',
  techPreferences: DEFAULT_TECH_PREFERENCES,
};

export const DEFAULT_PLANNING_ANSWERS: PlanningAnswers = {
  deploymentTarget: 'simple-web-deploy',
  authRequirement: 'optional',
  collaborationMode: 'solo-only',
  deliveryBias: 'balanced',
  integrationNeeds: 'light-integrations',
};

const SYSTEM_PROMPT = `You are a creative project brainstorming assistant. Generate solo-friendly project ideas tailored to the user's interests, skills, time budget, and constraints.

Your response must be valid JSON with this exact structure:
{
  "understanding": "A brief sentence restating what the user wants",
  "ideas": [
    {
      "id": "1",
      "title": "Project Title",
      "description": "2-3 sentence description of the project",
      "priority": "High" | "Medium" | "Low",
      "effort": "High" | "Medium" | "Low",
      "impact": "High" | "Medium" | "Low"
    }
  ]
}

Generate exactly 6 project ideas. Make them specific, actionable, and scoped to fit the user's time budget.
Use the requested platform, language, framework, backend preference, and data layer explicitly in the ideas when provided.
Vary the priority, effort, and impact levels across ideas.`;

const ELABORATION_SYSTEM_PROMPT = `You are a senior product architect. Elaborate a solo-friendly project into a concise build structure.

Return valid JSON only with this exact structure:
{
  "overview": "2-3 sentences describing the project scope and target user",
  "coreFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "dataFlow": "Short description of data inputs/outputs and how they move",
  "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
  "risks": ["Risk 1", "Risk 2"],
  "stretchGoals": ["Stretch 1", "Stretch 2"]
}

Keep everything compact and actionable for a solo builder. Do not include markdown or extra text.`;

const PLANNING_SYSTEM_PROMPT = `You are a senior technical planner for solo builders. Turn the selected project idea into a realistic implementation plan.

Return valid JSON only with this exact structure:
{
  "recommendedStack": ["Item 1", "Item 2", "Item 3"],
  "stackRationale": "2-3 sentences explaining why this stack fits",
  "architectureSummary": "2-4 sentences describing the shape of the system",
  "featurePhases": ["Phase 1", "Phase 2", "Phase 3"],
  "dataModel": ["Entity 1", "Entity 2", "Entity 3"],
  "apiNeeds": ["Endpoint or integration 1", "Endpoint or integration 2"],
  "deliveryMilestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
  "risks": ["Risk 1", "Risk 2", "Risk 3"],
  "descopingOptions": ["Scope cut 1", "Scope cut 2", "Scope cut 3"]
}

Be specific about language, framework, deployment, backend, and data choices. Keep the plan achievable for one developer.`;

export const generateIdeas = async (
  context: BrainstormContext,
  llmConfig?: LLMConfig
): Promise<BrainstormResult> => {
  const normalizedContext = normalizeBrainstormContext(context);

  // If LLM is configured, try to use it
  if (llmConfig?.provider && llmConfig?.model) {
    try {
      const userPrompt = `Generate project ideas for someone who:
- Wants to: ${goalLabels[normalizedContext.goal]}
- Interests: ${normalizedContext.interests}
- Platform: ${platformLabels[normalizedContext.techPreferences.platform]}
- Experience level: ${experienceLabels[normalizedContext.techPreferences.experienceLevel]}
- Preferred languages: ${normalizedContext.techPreferences.preferredLanguages.join(', ') || 'Not specified'}
- Preferred frameworks: ${normalizedContext.techPreferences.preferredFrameworks.join(', ') || 'Not specified'}
- Backend preference: ${backendLabels[normalizedContext.techPreferences.backendPreference]}
- Data layer: ${dataLayerLabels[normalizedContext.techPreferences.dataLayer]}
- Stack notes: ${normalizedContext.techPreferences.stackNotes || 'None'}
- Legacy skills/stack notes: ${normalizedContext.skills || 'None'}
- Time Budget: ${normalizedContext.timeBudget}
- Constraints: ${normalizedContext.constraints}

Respond with valid JSON only, no markdown or extra text.`;

      const response = await generateCompletion(llmConfig, userPrompt, SYSTEM_PROMPT);
      
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed: unknown = JSON.parse(jsonMatch[0]);

        // Validate and normalize the response
        if (isBrainstormPayload(parsed)) {
          return {
            understanding: parsed.understanding,
            ideas: parsed.ideas.map((idea, index) => ({
              id: idea.id || index.toString(),
              title: idea.title || 'Untitled Idea',
              description: idea.description || '',
              priority: validateLevel(idea.priority),
              effort: validateLevel(idea.effort),
              impact: validateLevel(idea.impact),
            })),
          };
        }
      }
      
      throw new Error('Invalid response format from LLM');
    } catch (error) {
      console.warn('LLM generation failed, falling back to templates:', error);
      // Fall through to template generator
    }
  }

  // Template-based fallback (or default when no LLM is configured)
  return generateTemplateIdeas(normalizedContext);
};

export const generateIdeaElaboration = async (
  context: BrainstormContext,
  idea: Idea,
  llmConfig?: LLMConfig
): Promise<IdeaElaborationResult> => {
  const normalizedContext = normalizeBrainstormContext(context);

  if (llmConfig?.provider && llmConfig?.model) {
    try {
      const userPrompt = `Elaborate the following project for a solo builder.

Project Title: ${idea.title}
Short Description: ${idea.description}
Priority: ${idea.priority}
Effort: ${idea.effort}
Impact: ${idea.impact}

User context:
- Interests: ${normalizedContext.interests}
- Recommended stack direction: ${buildStackLabel(normalizedContext)}
- Platform: ${platformLabels[normalizedContext.techPreferences.platform]}
- Experience level: ${experienceLabels[normalizedContext.techPreferences.experienceLevel]}
- Backend preference: ${backendLabels[normalizedContext.techPreferences.backendPreference]}
- Data layer: ${dataLayerLabels[normalizedContext.techPreferences.dataLayer]}
- Time Budget: ${normalizedContext.timeBudget}
- Goal: ${goalLabels[normalizedContext.goal]}
- Constraints: ${normalizedContext.constraints}

Return valid JSON only.`;

      const response = await generateCompletion(llmConfig, userPrompt, ELABORATION_SYSTEM_PROMPT);
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed: unknown = JSON.parse(jsonMatch[0]);
        const normalized = normalizeElaboration(parsed);
        if (normalized) {
          return { elaboration: normalized, source: 'llm' };
        }
      }

      throw new Error('Invalid elaboration response format from LLM');
    } catch (error) {
      console.warn('LLM elaboration failed, falling back to templates:', error);
    }
  }

  return {
    elaboration: createTemplateElaboration(normalizedContext, idea),
    source: 'template'
  };
};

export const generateProjectPlan = async (
  context: BrainstormContext,
  idea: Idea,
  answers: Partial<PlanningAnswers>,
  llmConfig?: LLMConfig
): Promise<ProjectPlanResult> => {
  const normalizedContext = normalizeBrainstormContext(context);
  const normalizedAnswers = normalizePlanningAnswers(answers);

  if (llmConfig?.provider && llmConfig?.model) {
    try {
      const userPrompt = `Plan the following project for a solo builder.

Project:
- Title: ${idea.title}
- Description: ${idea.description}
- Priority: ${idea.priority}
- Effort: ${idea.effort}
- Impact: ${idea.impact}

Builder context:
- Interests: ${normalizedContext.interests}
- Goal: ${goalLabels[normalizedContext.goal]}
- Platform: ${platformLabels[normalizedContext.techPreferences.platform]}
- Preferred stack: ${buildStackLabel(normalizedContext)}
- Backend preference: ${backendLabels[normalizedContext.techPreferences.backendPreference]}
- Data layer: ${dataLayerLabels[normalizedContext.techPreferences.dataLayer]}
- Time budget: ${normalizedContext.timeBudget}
- Constraints: ${normalizedContext.constraints}

Planning choices:
- Deployment target: ${deploymentLabels[normalizedAnswers.deploymentTarget]}
- Auth requirement: ${authLabels[normalizedAnswers.authRequirement]}
- Collaboration mode: ${collaborationLabels[normalizedAnswers.collaborationMode]}
- Delivery bias: ${deliveryBiasLabels[normalizedAnswers.deliveryBias]}
- Integration needs: ${integrationLabels[normalizedAnswers.integrationNeeds]}

Return valid JSON only.`;

      const response = await generateCompletion(llmConfig, userPrompt, PLANNING_SYSTEM_PROMPT);
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed: unknown = JSON.parse(jsonMatch[0]);
        const normalized = normalizeProjectPlan(parsed);
        if (normalized) {
          return { plan: normalized, source: 'llm' };
        }
      }

      throw new Error('Invalid project plan response format from LLM');
    } catch (error) {
      console.warn('LLM planning failed, falling back to templates:', error);
    }
  }

  return {
    plan: createTemplatePlan(normalizedContext, idea, normalizedAnswers),
    source: 'template',
  };
};

export function normalizeBrainstormContext(context: BrainstormContext): BrainstormContext & { techPreferences: TechPreferences } {
  const legacyPreferences = parseLegacySkills(context.skills);
  const mergedPreferences: TechPreferences = {
    ...DEFAULT_TECH_PREFERENCES,
    ...legacyPreferences,
    ...context.techPreferences,
    preferredLanguages: normalizeList(
      context.techPreferences?.preferredLanguages ?? legacyPreferences.preferredLanguages ?? DEFAULT_TECH_PREFERENCES.preferredLanguages,
      DEFAULT_TECH_PREFERENCES.preferredLanguages
    ),
    preferredFrameworks: normalizeList(
      context.techPreferences?.preferredFrameworks ?? legacyPreferences.preferredFrameworks ?? DEFAULT_TECH_PREFERENCES.preferredFrameworks,
      DEFAULT_TECH_PREFERENCES.preferredFrameworks
    ),
    stackNotes: context.techPreferences?.stackNotes?.trim() ?? DEFAULT_TECH_PREFERENCES.stackNotes,
  };

  return {
    interests: context.interests.trim(),
    skills: context.skills?.trim(),
    timeBudget: context.timeBudget,
    goal: context.goal,
    constraints: context.constraints.trim(),
    techPreferences: mergedPreferences,
  };
}

export function normalizePlanningAnswers(answers: Partial<PlanningAnswers>): PlanningAnswers {
  return {
    deploymentTarget: answers.deploymentTarget ?? DEFAULT_PLANNING_ANSWERS.deploymentTarget,
    authRequirement: answers.authRequirement ?? DEFAULT_PLANNING_ANSWERS.authRequirement,
    collaborationMode: answers.collaborationMode ?? DEFAULT_PLANNING_ANSWERS.collaborationMode,
    deliveryBias: answers.deliveryBias ?? DEFAULT_PLANNING_ANSWERS.deliveryBias,
    integrationNeeds: answers.integrationNeeds ?? DEFAULT_PLANNING_ANSWERS.integrationNeeds,
  };
}

function normalizeElaboration(value: unknown): IdeaElaboration | null {
  if (!value || typeof value !== 'object') return null;

  const payload = value as {
    overview?: unknown;
    coreFeatures?: unknown;
    dataFlow?: unknown;
    milestones?: unknown;
    risks?: unknown;
    stretchGoals?: unknown;
  };

  return {
    overview: typeof payload.overview === 'string' ? payload.overview : '',
    coreFeatures: normalizeStringArray(payload.coreFeatures, 4),
    dataFlow: typeof payload.dataFlow === 'string' ? payload.dataFlow : '',
    milestones: normalizeStringArray(payload.milestones, 3),
    risks: normalizeStringArray(payload.risks, 2),
    stretchGoals: normalizeStringArray(payload.stretchGoals, 2)
  };
}

function normalizeStringArray(value: unknown, minItems: number): string[] {
  if (Array.isArray(value)) {
    const filtered = value.filter((item: unknown) => typeof item === 'string' && item.trim().length > 0);
    if (filtered.length >= minItems) return filtered;
  }
  return [];
}

function normalizeProjectPlan(value: unknown): ProjectPlan | null {
  if (!value || typeof value !== 'object') return null;

  const payload = value as {
    recommendedStack?: unknown;
    stackRationale?: unknown;
    architectureSummary?: unknown;
    featurePhases?: unknown;
    dataModel?: unknown;
    apiNeeds?: unknown;
    deliveryMilestones?: unknown;
    risks?: unknown;
    descopingOptions?: unknown;
  };

  return {
    recommendedStack: normalizeStringArray(payload.recommendedStack, 3),
    stackRationale: typeof payload.stackRationale === 'string' ? payload.stackRationale : '',
    architectureSummary: typeof payload.architectureSummary === 'string' ? payload.architectureSummary : '',
    featurePhases: normalizeStringArray(payload.featurePhases, 3),
    dataModel: normalizeStringArray(payload.dataModel, 3),
    apiNeeds: normalizeStringArray(payload.apiNeeds, 2),
    deliveryMilestones: normalizeStringArray(payload.deliveryMilestones, 3),
    risks: normalizeStringArray(payload.risks, 2),
    descopingOptions: normalizeStringArray(payload.descopingOptions, 2),
  };
}

function isBrainstormPayload(value: unknown): value is { understanding: string; ideas: LlmIdea[] } {
  if (!value || typeof value !== 'object') return false;
  const payload = value as { understanding?: unknown; ideas?: unknown };
  return typeof payload.understanding === 'string' && Array.isArray(payload.ideas);
}

interface LlmIdea {
  id?: string;
  title?: string;
  description?: string;
  priority?: unknown;
  effort?: unknown;
  impact?: unknown;
}

function createTemplateElaboration(context: BrainstormContext, idea: Idea): IdeaElaboration {
  const normalizedContext = normalizeBrainstormContext(context);
  const stackLabel = buildStackLabel(normalizedContext);
  const persistenceCopy = describePersistence(normalizedContext.techPreferences.dataLayer);
  const authCopy =
    normalizedContext.techPreferences.backendPreference === 'required'
      ? 'Add authentication and protect the primary workflow early.'
      : 'Start without auth unless the workflow clearly needs accounts.';

  return {
    overview: `${idea.title} is a ${platformLabels[normalizedContext.techPreferences.platform]} project scoped to ${normalizedContext.timeBudget}. Build it with ${stackLabel} so the result feels aligned with ${normalizedContext.interests} while still matching the goal to ${goalLabels[normalizedContext.goal]}.`,
    coreFeatures: [
      `Fast setup flow tuned for ${stackLabel}`,
      'Primary user journey that reaches the main value in 2-3 steps',
      persistenceCopy,
      authCopy
    ],
    dataFlow: `Capture user input in the ${platformLabels[normalizedContext.techPreferences.platform]} client, validate it immediately, and persist only the state required for the main workflow. ${persistenceCopy} Keep outputs compact so the next action is obvious after every step.`,
    milestones: [
      `Sketch the core ${platformLabels[normalizedContext.techPreferences.platform]} flow and lock the ${stackLabel} setup`,
      'Implement the MVP flow end-to-end with only one polished path',
      'Add validation, edge states, and a short demo-ready narrative'
    ],
    risks: [
      `Scope creep beyond ${normalizedContext.timeBudget}`,
      'Adding backend complexity before the main workflow feels valuable'
    ],
    stretchGoals: [
      'Add lightweight personalization or analytics',
      'Ship a shareable demo, landing page, or walkthrough'
    ]
  };
}

function createTemplatePlan(
  context: BrainstormContext & { techPreferences: TechPreferences },
  idea: Idea,
  answers: PlanningAnswers
): ProjectPlan {
  const stack = [
    context.techPreferences.preferredLanguages[0],
    context.techPreferences.preferredFrameworks[0],
    context.techPreferences.backendPreference === 'required' ? 'Auth-ready backend' : undefined,
    describePersistence(context.techPreferences.dataLayer, true),
    deploymentLabels[answers.deploymentTarget],
  ].filter(Boolean) as string[];

  return {
    recommendedStack: stack,
    stackRationale: `${buildStackLabel(context)} fits ${idea.title} because it matches the requested ${platformLabels[context.techPreferences.platform]} direction, keeps setup aligned with ${answers.deliveryBias.replace('-', ' ')}, and stays practical for ${context.timeBudget}. ${describePersistence(context.techPreferences.dataLayer)} ${context.techPreferences.stackNotes ? `Honor the extra preference to ${context.techPreferences.stackNotes}.` : ''}`,
    architectureSummary: `${idea.title} should use a thin ${platformLabels[context.techPreferences.platform]} client for the primary workflow, plus the smallest backend surface that supports ${authLabels[answers.authRequirement]} and ${integrationLabels[answers.integrationNeeds]}. For this ${context.interests} concept, keep the architecture centered on one main dashboard or workflow rather than a broad feature set.`,
    featurePhases: [
      `Phase 1: stand up the ${buildStackLabel(context)} baseline and ship the primary ${idea.title.toLowerCase()} flow`,
      `Phase 2: add ${answers.authRequirement === 'required' ? 'authentication, protected routes, and role-safe data access' : 'persistence, analytics, and a cleaner information layout'}`,
      `Phase 3: add portfolio polish, deployment hardening, and one integration path that supports ${context.interests}`,
    ],
    dataModel: [
      `${idea.title} workspace`,
      answers.authRequirement === 'required' ? 'User profile and auth metadata' : 'Session or preference state',
      context.techPreferences.dataLayer === 'supabase' ? 'Supabase tables for the core workflow records' : 'Core workflow records',
    ],
    apiNeeds: [
      answers.integrationNeeds === 'none' ? 'No external APIs in v1; keep the logic internal' : 'One light integration for the main value proposition',
      answers.authRequirement === 'required' ? 'Auth/session endpoints or provider callbacks' : 'A single persistence endpoint or sync path',
    ],
    deliveryMilestones: [
      'Lock the stack, create the app shell, and prove the MVP workflow end-to-end',
      'Add persistence, validation, and the smallest useful reporting or history view',
      'Deploy the project, tighten onboarding, and document the architecture decisions',
    ],
    risks: [
      `Over-building the backend for a ${context.timeBudget} project`,
      `Letting ${answers.integrationNeeds === 'api-heavy' ? 'external API complexity' : 'secondary features'} distract from the core workflow`,
      'Adding too many entities before the first user path feels reliable',
    ],
    descopingOptions: [
      'Ship one polished workflow instead of multiple dashboards or user roles',
      'Start with local or single-tenant data before adding collaboration',
      'Replace real integrations with seeded demo data for the first release',
    ],
  };
}

function validateLevel(value: unknown): 'High' | 'Medium' | 'Low' {
  if (value === 'High' || value === 'Medium' || value === 'Low') {
    return value;
  }
  return 'Medium';
}

interface IdeaTemplate {
  title: (context: BrainstormContext & { techPreferences: TechPreferences }) => string;
  desc: (context: BrainstormContext & { techPreferences: TechPreferences }) => string;
  priority: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
}

async function generateTemplateIdeas(context: BrainstormContext): Promise<BrainstormResult> {
  const normalizedContext = normalizeBrainstormContext(context);
  const understanding = `You want to ${goalLabels[normalizedContext.goal]} around ${normalizedContext.interests} using ${buildStackLabel(normalizedContext)} on ${platformLabels[normalizedContext.techPreferences.platform]}, scoped to ${normalizedContext.timeBudget}. Constraints to respect: ${normalizedContext.constraints || 'keep things practical and solo-friendly'}.`;

  const ideaTemplates: Record<BrainstormContext['goal'], IdeaTemplate[]> = {
    learn: [
      {
        title: (current) => `${buildTitlePrefix(current)} Skill Sprint Lab`,
        desc: (current) => `Build a focused ${platformLabels[current.techPreferences.platform]} practice environment around ${current.interests} with ${buildStackLabel(current)}. Structure it as a series of small challenges you can finish within ${current.timeBudget}.`,
        priority: 'High', effort: 'Low', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} One-Feature Clone`,
        desc: (current) => `Pick one compelling ${current.interests} workflow and rebuild it from scratch using ${buildStackLabel(current)}. Focus on one sharp feature so you can understand the stack deeply without bloating scope.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} API Explorer`,
        desc: (current) => `Find a public data source related to ${current.interests} and build a narrow ${platformLabels[current.techPreferences.platform]} interface around it with ${buildStackLabel(current)}. Limit scope to one workflow so it fits ${current.timeBudget}.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Insight Visualizer`,
        desc: (current) => `Collect a small real-world dataset about ${current.interests}, clean it, and visualize it in ${buildStackLabel(current)}. Respect ${current.constraints || 'a simple solo scope'} and optimize for insight over polish.`,
        priority: 'Medium', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Workflow Micro-Tool`,
        desc: (current) => `Identify one friction point you hit regularly in ${current.interests} and solve it with a tiny ${platformLabels[current.techPreferences.platform]} utility built in ${buildStackLabel(current)}. Aim for something you would actually use yourself.`,
        priority: 'Low', effort: 'Low', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Concept Visualizer`,
        desc: (current) => `Pick a concept in ${current.interests} that is hard to explain and build an interactive demo with ${buildStackLabel(current)} that makes it click. The goal is to learn by teaching through a concrete artifact.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
    ],
    portfolio: [
      {
        title: (current) => `${buildTitlePrefix(current)} Case Study App`,
        desc: (current) => `Build a deployable ${platformLabels[current.techPreferences.platform]} product in ${current.interests} with ${buildStackLabel(current)}. Include a live demo and a case study that explains your stack and scope decisions.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Design-to-Code Sprint`,
        desc: (current) => `Design a sharp UI for a ${current.interests} use case, then implement it in ${buildStackLabel(current)} within ${current.timeBudget}. Strong visual execution plus coherent stack choices stand out in a portfolio.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Starter Kit`,
        desc: (current) => `Ship a reusable starter kit for ${current.interests} that reflects your architectural opinions in ${buildStackLabel(current)}. A clean starter repo signals systems thinking and taste.`,
        priority: 'Medium', effort: 'High', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Before-and-After Refactor`,
        desc: (current) => `Take a messy ${current.interests} workflow and rebuild it cleanly in ${buildStackLabel(current)}. Document the before state, the technical decisions, and the resulting trade-offs.`,
        priority: 'Medium', effort: 'Medium', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Interactive Demo`,
        desc: (current) => `Build a live, clickable product demo around ${current.interests} that a recruiter or client can try quickly. Keep it inside ${current.timeBudget}, use ${buildStackLabel(current)}, and make every feature earn its place.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Feature Build`,
        desc: (current) => `Pick one meaty end-to-end feature in ${current.interests} and build it with ${buildStackLabel(current)}. Scope it to ${current.timeBudget} and explain why the chosen backend and data layer fit the problem.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
    ],
    automation: [
      {
        title: (current) => `${buildTitlePrefix(current)} Ops Dashboard`,
        desc: (current) => `Aggregate the statuses that matter most in your ${current.interests} routine into a single ${platformLabels[current.techPreferences.platform]} dashboard built with ${buildStackLabel(current)}. Replace tab-switching with one clear view.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Triage Helper`,
        desc: (current) => `Automate the sorting, tagging, or routing of a ${current.interests}-related inbox using ${buildStackLabel(current)}. Even a 5-minute daily win compounds into hours saved each month.`,
        priority: 'High', effort: 'Low', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Report Generator`,
        desc: (current) => `Script a recurring report from your ${current.interests} data in ${buildStackLabel(current)}. Turn a manual half-hour task into one dependable command or one predictable UI action.`,
        priority: 'Medium', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Routine Scheduler`,
        desc: (current) => `Build a lightweight scheduler for recurring ${current.interests} tasks using ${buildStackLabel(current)}. Keep it within ${current.constraints || 'a minimal scope'} so it stays maintainable.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Adaptive Checklist`,
        desc: (current) => `Create a checklist tool for ${current.interests} that helps you shortcut the steps you repeat most often. Build it in ${buildStackLabel(current)} and scope it tightly enough for ${current.timeBudget}.`,
        priority: 'Low', effort: 'Low', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Workflow Orchestrator`,
        desc: (current) => `Chain together several manual ${current.interests} steps into a single automated pipeline using ${buildStackLabel(current)}. Respect ${current.constraints || 'a lean footprint'} and avoid over-engineering.`,
        priority: 'Low', effort: 'Medium', impact: 'Medium',
      },
    ],
    income: [
      {
        title: (current) => `${buildTitlePrefix(current)} Micro SaaS Pilot`,
        desc: (current) => `Prototype the smallest viable paid tool that solves a pain point in ${current.interests}. Build it with ${buildStackLabel(current)} in ${current.timeBudget} and validate demand before over-investing.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Paid Template Pack`,
        desc: (current) => `Design and package reusable templates, components, or assets for ${current.interests} buyers. Use ${buildStackLabel(current)} for the storefront or delivery layer and keep maintenance light.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Lead Magnet Tool`,
        desc: (current) => `Build a free but useful tool for a specific ${current.interests} audience that captures demand signals. Respect ${current.constraints || 'simple operating costs'} and learn before committing to a paid product.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Productized Service`,
        desc: (current) => `Turn a repeatable ${current.interests} service into a fixed-scope offering with intake, qualification, and delivery tracking in ${buildStackLabel(current)}.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Creator Toolkit`,
        desc: (current) => `Ship a compact toolset for creators working in ${current.interests}. Scope it to ${current.timeBudget}, build it with ${buildStackLabel(current)}, and optimize for a clearly defined niche.`,
        priority: 'Medium', effort: 'Medium', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Subscription Utility`,
        desc: (current) => `Build a lightweight utility for ${current.interests} with a recurring monthly value proposition. Use ${buildStackLabel(current)} and keep it within ${current.constraints || 'a low-maintenance budget'} so margins stay healthy.`,
        priority: 'Low', effort: 'Medium', impact: 'Medium',
      },
    ],
    community: [
      {
        title: (current) => `${buildTitlePrefix(current)} Resource Hub`,
        desc: (current) => `Build a searchable collection of the best resources in ${current.interests} using ${buildStackLabel(current)}. Strong curation plus a clean information architecture creates immediate value.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Event Organizer`,
        desc: (current) => `Create a lightweight event listing or RSVP tool to help people in ${current.interests} connect. Build it in ${buildStackLabel(current)} within ${current.timeBudget} and avoid unnecessary complexity.`,
        priority: 'Medium', effort: 'Medium', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Open Data Map`,
        desc: (current) => `Visualize community data related to ${current.interests} on an interactive map or chart with ${buildStackLabel(current)}. Respect ${current.constraints || 'simple hosting'} and focus on transparency.`,
        priority: 'Medium', effort: 'High', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Volunteer Match`,
        desc: (current) => `Build a simple matcher that connects people who want to help with ${current.interests} needs to specific opportunities. A focused form and list view in ${buildStackLabel(current)} is enough for an MVP.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Shared Progress Tracker`,
        desc: (current) => `Create a group accountability tracker for a ${current.interests} goal. Build it with ${buildStackLabel(current)}, keep the collaboration lightweight, and finish within ${current.timeBudget}.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Awareness Site`,
        desc: (current) => `Build a compelling one-page site for a ${current.interests} cause using ${buildStackLabel(current)}. Clear story, shareable link, one call to action, and no extra clutter.`,
        priority: 'Medium', effort: 'High', impact: 'Medium',
      },
    ],
    fun: [
      {
        title: (current) => `${buildTitlePrefix(current)} Jam Prototype`,
        desc: (current) => `Build a playable mini-game or interactive toy around ${current.interests} using ${buildStackLabel(current)}. Set a hard deadline within ${current.timeBudget}; constraints usually make the concept sharper.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Generative Art Toy`,
        desc: (current) => `Use ${buildStackLabel(current)} to build a playful experiment inspired by ${current.interests}. Every run should produce something new enough to share.`,
        priority: 'Medium', effort: 'Low', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Story Engine`,
        desc: (current) => `Build a branching narrative engine themed around ${current.interests}. Use ${buildStackLabel(current)} to make it feel alive, and keep scope tightly bounded by ${current.timeBudget}.`,
        priority: 'Medium', effort: 'High', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Sound Toy`,
        desc: (current) => `Create a sound or music experiment tied to ${current.interests} that people can play with for two minutes and immediately share. Build it in ${buildStackLabel(current)}.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Personal Arcade`,
        desc: (current) => `Build a tiny collection of two or three micro-experiments around ${current.interests} using ${buildStackLabel(current)}. Pure self-expression is the point, not product strategy.`,
        priority: 'Low', effort: 'Medium', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Chaos Generator`,
        desc: (current) => `Build a generator that combines random inputs from ${current.interests} into surprising, slightly absurd results with ${buildStackLabel(current)}. Low effort, highly shareable.`,
        priority: 'Low', effort: 'Low', impact: 'Medium',
      },
    ],
    productivity: [
      {
        title: (current) => `${buildTitlePrefix(current)} Focus Timer`,
        desc: (current) => `Build a focus timer tuned to your ${current.interests} workflow using ${buildStackLabel(current)}. Add one smart feature beyond a plain Pomodoro clone so it feels worth keeping.`,
        priority: 'High', effort: 'Low', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Weekly Review`,
        desc: (current) => `Create a structured review template and tracker tied to your ${current.interests} goals. Build it with ${buildStackLabel(current)} in ${current.timeBudget} so it reinforces a repeatable habit.`,
        priority: 'High', effort: 'Low', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Capture Inbox`,
        desc: (current) => `Build a fast-capture tool for ${current.interests} ideas and tasks that funnels everything into one simple process step. Use ${buildStackLabel(current)} to keep entry frictionless.`,
        priority: 'Medium', effort: 'Medium', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Goal Dashboard`,
        desc: (current) => `Create a dashboard that visualizes your progress toward ${current.interests} goals using ${buildStackLabel(current)}. Trend lines and focused summaries usually beat long lists.`,
        priority: 'Medium', effort: 'Medium', impact: 'Medium',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Habit Tracker`,
        desc: (current) => `Build a minimal habit tracker focused on one ${current.interests} behavior. Use ${buildStackLabel(current)} to make check-in take under five seconds.`,
        priority: 'Medium', effort: 'Low', impact: 'High',
      },
      {
        title: (current) => `${buildTitlePrefix(current)} Knowledge Base`,
        desc: (current) => `Create a searchable knowledge base for what you learn in ${current.interests}. Build it with ${buildStackLabel(current)} so the archive is actually pleasant to maintain.`,
        priority: 'Medium', effort: 'Medium', impact: 'Medium',
      },
    ],
  };

  const selectedIdeas = (ideaTemplates[normalizedContext.goal] ?? ideaTemplates.learn).slice(0, 6);

  return {
    understanding,
    ideas: selectedIdeas.map((item, index) => ({
      id: index.toString(),
      title: item.title(normalizedContext),
      description: item.desc(normalizedContext),
      priority: item.priority,
      effort: item.effort,
      impact: item.impact,
    })),
  };
}

const goalLabels: Record<ProjectGoal, string> = {
  learn: 'learn a new skill',
  portfolio: 'ship a portfolio piece',
  automation: 'automate a personal workflow',
  income: 'explore a side-income idea',
  community: 'contribute to a community need',
  fun: 'build something purely for fun',
  productivity: 'boost your personal productivity',
};

const platformLabels: Record<ProjectPlatform, string> = {
  web: 'web app',
  mobile: 'mobile app',
  desktop: 'desktop app',
  cli: 'CLI tool',
  api: 'API service',
  game: 'game prototype',
};

const experienceLabels: Record<ExperienceLevel, string> = {
  'use-what-i-know': 'lean on familiar tools',
  'mix-known-and-new': 'mix familiar tools with one stretch area',
  'learn-new-stack': 'use this project to learn a new stack',
};

const backendLabels: Record<BackendPreference, string> = {
  none: 'no backend',
  'frontend-only': 'frontend-only experience',
  optional: 'backend is optional',
  required: 'backend is required',
};

const dataLayerLabels: Record<DataLayer, string> = {
  none: 'no persisted data',
  'local-only': 'local-only storage',
  supabase: 'Supabase',
  sql: 'SQL database',
  nosql: 'NoSQL database',
  unsure: 'undecided data layer',
};

const deploymentLabels: Record<DeploymentTarget, string> = {
  'local-first': 'local-first delivery',
  'simple-web-deploy': 'simple web deployment',
  'desktop-distribution': 'desktop distribution',
  'mobile-app-store': 'mobile app-store deployment',
  unsure: 'deployment still undecided',
};

const authLabels: Record<AuthRequirement, string> = {
  none: 'no authentication',
  optional: 'optional authentication',
  required: 'required authentication',
};

const collaborationLabels: Record<CollaborationMode, string> = {
  'solo-only': 'single-user workflow',
  'small-group': 'small-team collaboration',
  'public-users': 'public multi-user product',
};

const deliveryBiasLabels: Record<DeliveryBias, string> = {
  'fastest-mvp': 'optimize for the fastest MVP',
  balanced: 'balance speed and polish',
  'portfolio-polish': 'favor portfolio polish and presentation',
};

const integrationLabels: Record<IntegrationNeeds, string> = {
  none: 'no external integrations',
  'light-integrations': 'light external integrations',
  'api-heavy': 'API-heavy workflow',
};

function buildTitlePrefix(context: BrainstormContext & { techPreferences: TechPreferences }): string {
  return context.techPreferences.preferredFrameworks[0]
    ?? context.techPreferences.preferredLanguages[0]
    ?? platformLabels[context.techPreferences.platform];
}

function buildStackLabel(context: BrainstormContext & { techPreferences: TechPreferences }): string {
  const parts = [
    context.techPreferences.preferredLanguages[0],
    context.techPreferences.preferredFrameworks[0],
    describePersistence(context.techPreferences.dataLayer, true),
  ].filter(Boolean);

  return parts.join(' + ');
}

function describePersistence(dataLayer: DataLayer, compact = false): string {
  switch (dataLayer) {
    case 'none':
      return compact ? '' : 'Skip persistence entirely for the first iteration.';
    case 'local-only':
      return compact ? 'local storage' : 'Use local persistence so setup stays frictionless.';
    case 'supabase':
      return compact ? 'Supabase' : 'Persist the critical records in Supabase and keep the schema lean.';
    case 'sql':
      return compact ? 'SQL' : 'Persist the core entities in a small SQL schema.';
    case 'nosql':
      return compact ? 'NoSQL' : 'Use a document-style store only for flexible user-generated content.';
    case 'unsure':
      return compact ? 'flexible storage' : 'Choose the simplest persistence layer that supports the primary workflow.';
  }
}

function normalizeList(items: string[], fallback: string[]): string[] {
  const unique = new Set(items.map((item) => item.trim()).filter(Boolean));
  return unique.size ? [...unique] : [...fallback];
}

function parseLegacySkills(skills?: string): Partial<TechPreferences> {
  if (!skills) return {};

  const tokens = skills
    .split(/[,+/]/)
    .map((token) => token.trim())
    .filter(Boolean);

  const languageMatches = tokens.filter((token) =>
    ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Swift', 'Kotlin', 'C#'].some(
      (candidate) => candidate.toLowerCase() === token.toLowerCase()
    )
  );

  const frameworkMatches = tokens.filter((token) =>
    ['React', 'Next.js', 'Vue', 'Svelte', 'Node.js', 'Express', 'FastAPI', 'Supabase', 'Electron', 'Tauri', 'React Native', 'Flutter', 'Phaser'].some(
      (candidate) => candidate.toLowerCase() === token.toLowerCase()
    )
  );

  return {
    preferredLanguages: languageMatches,
    preferredFrameworks: frameworkMatches,
  };
}
