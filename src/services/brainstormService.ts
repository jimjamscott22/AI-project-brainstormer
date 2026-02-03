import type { LLMConfig } from './llmProviderService';
import { generateCompletion } from './llmProviderService';

export interface BrainstormContext {
  interests: string;
  skills: string;
  timeBudget: string;
  goal: 'learn' | 'portfolio' | 'automation' | 'income' | 'community';
  constraints: string;
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

Generate exactly 6 project ideas. Make them specific, actionable, and scoped to fit the user's time budget. Vary the priority, effort, and impact levels across ideas.`;

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

export const generateIdeas = async (
  context: BrainstormContext,
  llmConfig?: LLMConfig
): Promise<BrainstormResult> => {
  // If LLM is configured, try to use it
  if (llmConfig?.provider && llmConfig?.model) {
    try {
      const goalLabels = {
        learn: 'learn a new skill',
        portfolio: 'ship a portfolio piece',
        automation: 'automate a personal workflow',
        income: 'explore a side-income idea',
        community: 'contribute to a community need'
      };

      const userPrompt = `Generate project ideas for someone who:
- Wants to: ${goalLabels[context.goal]}
- Interests: ${context.interests}
- Skills/Stack: ${context.skills}
- Time Budget: ${context.timeBudget}
- Constraints: ${context.constraints}

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
  return generateTemplateIdeas(context);
};

export const generateIdeaElaboration = async (
  context: BrainstormContext,
  idea: Idea,
  llmConfig?: LLMConfig
): Promise<IdeaElaborationResult> => {
  if (llmConfig?.provider && llmConfig?.model) {
    try {
      const userPrompt = `Elaborate the following project for a solo builder.

Project Title: ${idea.title}
Short Description: ${idea.description}
Priority: ${idea.priority}
Effort: ${idea.effort}
Impact: ${idea.impact}

User context:
- Interests: ${context.interests}
- Skills/Stack: ${context.skills}
- Time Budget: ${context.timeBudget}
- Goal: ${context.goal}
- Constraints: ${context.constraints}

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
    elaboration: createTemplateElaboration(context, idea),
    source: 'template'
  };
};

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
  return {
    overview: `${idea.title} is a focused project for ${context.timeBudget} that leans on ${context.skills} to deliver a clear outcome for ${context.interests}. It keeps scope tight while still highlighting your main goal: ${context.goal}.`,
    coreFeatures: [
      'Simple onboarding or setup flow for first-time users',
      'Primary workflow that delivers the project value fast',
      'Progress or status view to reinforce momentum',
      'Polish pass: empty states, helpful copy, and defaults'
    ],
    dataFlow: `User inputs are captured, validated, and stored locally. Outputs are summarized back to the user with minimal state and a clear next action.`,
    milestones: [
      'Define the core user journey and sketch a basic UI',
      'Implement the primary flow end-to-end with minimal styling',
      'Add refinement: validation, empty states, and a short demo'
    ],
    risks: [
      'Scope creep beyond the time budget',
      'Over-engineering data storage or integrations'
    ],
    stretchGoals: [
      'Add light personalization or theming',
      'Ship a small shareable demo or landing page'
    ]
  };
}

function validateLevel(value: unknown): 'High' | 'Medium' | 'Low' {
  if (value === 'High' || value === 'Medium' || value === 'Low') {
    return value;
  }
  return 'Medium';
}

async function generateTemplateIdeas(context: BrainstormContext): Promise<BrainstormResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const goalLabels = {
    learn: 'learn a new skill',
    portfolio: 'ship a portfolio piece',
    automation: 'automate a personal workflow',
    income: 'explore a side-income idea',
    community: 'contribute to a community need'
  };

  const understanding = `You want to ${goalLabels[context.goal]} around ${context.interests}, using ${context.skills}, scoped to ${context.timeBudget}. Constraints to respect: ${context.constraints}.`;

  const ideaTemplates = {
    learn: [
      { title: "Skill Sprint Lab", desc: `Build a compact playground around ${context.interests} that forces daily practice of ${context.skills} within ${context.timeBudget}.` },
      { title: "One-Feature Clone", desc: `Clone a single feature from a ${context.interests} product to sharpen ${context.skills} without over-scoping.` },
      { title: "API Explorer", desc: `Create a simple client for a ${context.interests} API, focusing on one workflow and keeping to ${context.timeBudget}.` },
      { title: "Data Snapshot", desc: `Collect a small dataset about ${context.interests} and visualize it using ${context.skills} while honoring ${context.constraints}.` },
      { title: "Micro-Tool", desc: `Ship a tiny CLI or web tool that solves one pain point in ${context.interests} and stretches ${context.skills}.` },
      { title: "Explain-It Demo", desc: `Build a mini tutorial site or demo that teaches a concept in ${context.interests} using ${context.skills}.` }
    ],
    portfolio: [
      { title: "Polished Case Study", desc: `Deliver a finished project with a narrative, highlighting ${context.skills} and why ${context.interests} matters to you.` },
      { title: "Design-to-Code Sprint", desc: `Create a clean UI and implement it in ${context.skills}, scoped to ${context.timeBudget}.` },
      { title: "Open-Source Starter", desc: `Ship a starter kit or template for ${context.interests} that demonstrates your engineering choices.` },
      { title: "Before/After Refactor", desc: `Take a messy workflow in ${context.interests} and rebuild it cleanly using ${context.skills}.` },
      { title: "Interactive Demo", desc: `Build a clickable demo that communicates a clear outcome while staying within ${context.constraints}.` },
      { title: "Mini Product Launch", desc: `Publish a tiny product site plus a demo video to showcase ${context.skills} and scope discipline.` }
    ],
    automation: [
      { title: "Weekly Ops Dashboard", desc: `Create a personal dashboard for ${context.interests} that saves time and fits the ${context.timeBudget} scope.` },
      { title: "Inbox Triage Helper", desc: `Automate sorting or tagging for a ${context.interests}-related inbox using ${context.skills}.` },
      { title: "Routine Scheduler", desc: `Build a lightweight scheduler or reminder tool that respects ${context.constraints}.` },
      { title: "One-Click Report", desc: `Generate a clean report from your ${context.interests} data with a single command.` },
      { title: "Smart Checklist", desc: `Create a checklist app that adapts to your ${context.interests} habits using ${context.skills}.` },
      { title: "Expense or Time Tracker", desc: `Ship a tiny tracker that removes friction from a ${context.interests} routine.` }
    ],
    income: [
      { title: "Micro SaaS Pilot", desc: `Prototype a tiny paid tool for ${context.interests} that can ship within ${context.timeBudget}.` },
      { title: "Paid Template Pack", desc: `Design a set of templates around ${context.interests} and implement distribution with ${context.skills}.` },
      { title: "Niche Lead Magnet", desc: `Build a free tool that captures demand signals, respecting ${context.constraints}.` },
      { title: "Service Productizer", desc: `Turn a manual ${context.interests} workflow into a repeatable productized service.` },
      { title: "Creator Toolkit", desc: `Ship a compact toolkit for creators in ${context.interests}, tailored to your ${context.skills}.` },
      { title: "Pricing Experiment", desc: `Launch a simple landing page plus demo and test messaging for a ${context.interests} offer.` }
    ],
    community: [
      { title: "Resource Hub", desc: `Create a curated hub for ${context.interests} with a clean UI built in ${context.skills}.` },
      { title: "Local Organizer", desc: `Build a small organizer or calendar to help people in ${context.interests} connect.` },
      { title: "Open Data Map", desc: `Visualize community data related to ${context.interests} while honoring ${context.constraints}.` },
      { title: "Volunteer Match Tool", desc: `Create a simple matcher that connects needs to helpers in ${context.interests}.` },
      { title: "Shared Progress Tracker", desc: `Build a lightweight tracker to keep a group accountable within ${context.timeBudget}.` },
      { title: "Community Toolkit", desc: `Ship a starter kit that lowers the barrier to entry in ${context.interests}.` }
    ]
  };

  const selectedIdeas = ideaTemplates[context.goal] || ideaTemplates.learn;

  return {
    understanding,
    ideas: selectedIdeas.map((item, index) => ({
      id: index.toString(),
      title: item.title,
      description: item.desc,
      priority: index % 3 === 0 ? 'High' : (index % 3 === 1 ? 'Medium' : 'Low'),
      effort: index % 2 === 0 ? 'Low' : 'Medium',
      impact: index % 3 === 0 ? 'High' : 'Medium'
    }))
  };
}
