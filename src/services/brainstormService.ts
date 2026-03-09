import type { LLMConfig } from './llmProviderService';
import { generateCompletion } from './llmProviderService';

export interface BrainstormContext {
  interests: string;
  skills: string;
  timeBudget: string;
  goal: 'learn' | 'portfolio' | 'automation' | 'income' | 'community' | 'fun' | 'productivity';
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
      const goalLabels: Record<BrainstormContext['goal'], string> = {
        learn: 'learn a new skill',
        portfolio: 'ship a portfolio piece',
        automation: 'automate a personal workflow',
        income: 'explore a side-income idea',
        community: 'contribute to a community need',
        fun: 'build something purely for fun',
        productivity: 'boost their personal productivity',
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

interface IdeaTemplate {
  title: string;
  desc: string;
  priority: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
}

async function generateTemplateIdeas(context: BrainstormContext): Promise<BrainstormResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const goalLabels: Record<BrainstormContext['goal'], string> = {
    learn: 'learn a new skill',
    portfolio: 'ship a portfolio piece',
    automation: 'automate a personal workflow',
    income: 'explore a side-income idea',
    community: 'contribute to a community need',
    fun: 'build something purely for fun',
    productivity: 'boost your personal productivity',
  };

  const understanding = `You want to ${goalLabels[context.goal]} around ${context.interests}, using ${context.skills}, scoped to ${context.timeBudget}. Constraints to respect: ${context.constraints}.`;

  const ideaTemplates: Record<BrainstormContext['goal'], IdeaTemplate[]> = {
    learn: [
      {
        title: 'Skill Sprint Lab',
        desc: `Build a focused practice environment around ${context.interests} that enforces daily reps of ${context.skills}. Structure it as a series of small challenges completable within ${context.timeBudget}.`,
        priority: 'High', effort: 'Low', impact: 'High',
      },
      {
        title: 'One-Feature Clone',
        desc: `Pick one compelling feature from a ${context.interests} product and rebuild it from scratch using ${context.skills}. Reverse-engineering forces you to deeply understand the craft, not just copy the surface.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: 'API Explorer App',
        desc: `Find a public API related to ${context.interests} and build a small interface around it using ${context.skills}. Limit scope to a single workflow so you finish within ${context.timeBudget}.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: 'Data Snapshot Visualizer',
        desc: `Collect a small real-world dataset about ${context.interests}, clean it, and visualize it using ${context.skills}. Constraint: ${context.constraints}. The goal is insight, not polish.`,
        priority: 'Medium', effort: 'Medium', impact: 'High',
      },
      {
        title: 'CLI Micro-Tool',
        desc: `Identify one friction point you hit regularly in ${context.interests} and solve it with a tiny command-line tool built in ${context.skills}. Aim for something you'd actually run yourself.`,
        priority: 'Low', effort: 'Low', impact: 'Medium',
      },
      {
        title: 'Concept Visualizer',
        desc: `Pick a concept in ${context.interests} that's hard to explain and build an interactive demo that makes it click. Use ${context.skills} to make it embeddable and shareable.`,
        priority: 'Low', effort: 'Low', impact: 'High',
      },
      {
        title: 'Teach-It Tutorial Builder',
        desc: `Create a mini tutorial site around something you just learned in ${context.interests}. Writing explanations with working examples in ${context.skills} is one of the fastest ways to cement knowledge.`,
        priority: 'Medium', effort: 'Medium', impact: 'Medium',
      },
      {
        title: 'Technology Sandbox',
        desc: `Dedicate ${context.timeBudget} to a structured sandbox for ${context.skills} — a testbed where you break things intentionally, try edge cases, and document what you discover about ${context.interests}.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
    ],
    portfolio: [
      {
        title: 'Polished Case Study App',
        desc: `Build a complete, deployable project in ${context.interests} with a strong README, live demo, and a write-up explaining your decisions. Showcase ${context.skills} end-to-end.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
      {
        title: 'Design-to-Code Sprint',
        desc: `Design a clean, opinionated UI for a ${context.interests} use case, then implement it pixel-perfect in ${context.skills} within ${context.timeBudget}. Strong visual execution stands out.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: 'Open-Source Starter Kit',
        desc: `Ship a reusable template or starter kit for ${context.interests} that reflects your architectural opinions and ${context.skills}. A well-maintained repo signals engineering maturity.`,
        priority: 'Medium', effort: 'High', impact: 'High',
      },
      {
        title: 'Before / After Refactor',
        desc: `Take a messy, real codebase or workflow in ${context.interests} and rebuild it cleanly using ${context.skills}. Document the before-state, the decisions, and the outcome — this is a compelling narrative.`,
        priority: 'Medium', effort: 'Medium', impact: 'Medium',
      },
      {
        title: 'Interactive Demo Site',
        desc: `Build a live, clickable product demo around ${context.interests} that non-technical viewers can experience. Constrained to ${context.timeBudget} and ${context.constraints}, so every feature earns its place.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: 'Component Library Showcase',
        desc: `Build and document a focused set of UI components for ${context.interests} using ${context.skills}. Include a live Storybook or equivalent — it shows you can work at a system level.`,
        priority: 'Low', effort: 'Medium', impact: 'Medium',
      },
      {
        title: 'Mini Product Launch',
        desc: `Ship a real product — landing page, demo, and social post — for a ${context.interests} idea. Built in ${context.skills} within ${context.timeBudget}. Finishing and shipping is the differentiator.`,
        priority: 'Medium', effort: 'High', impact: 'High',
      },
      {
        title: 'Full-Stack Feature Build',
        desc: `Pick one meaty feature end-to-end (frontend, API, storage) in ${context.interests} and build it with ${context.skills}. Scope it to fit ${context.timeBudget} and document the architecture decisions.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
    ],
    automation: [
      {
        title: 'Personal Ops Dashboard',
        desc: `Aggregate the metrics and statuses that matter most in your ${context.interests} routine into a single dashboard built with ${context.skills}. Replace tab-switching with one clear view.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: 'Inbox Zero Triage Helper',
        desc: `Automate the sorting, tagging, or routing of a ${context.interests}-related inbox using ${context.skills}. Even a 5-minute daily win compounds into hours saved per month.`,
        priority: 'High', effort: 'Low', impact: 'High',
      },
      {
        title: 'One-Click Report Generator',
        desc: `Script the generation of a recurring report from your ${context.interests} data using ${context.skills}. Turns a manual 30-minute task into a single command.`,
        priority: 'Medium', effort: 'Medium', impact: 'High',
      },
      {
        title: 'Routine Scheduler & Reminder',
        desc: `Build a lightweight scheduler that reminds you of recurring ${context.interests} tasks and adapts to your actual schedule. Keep it within ${context.constraints} so it stays maintainable.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: 'Smart Adaptive Checklist',
        desc: `Create a checklist tool for ${context.interests} that learns which steps you always skip and adjusts accordingly. Built in ${context.skills} within ${context.timeBudget}.`,
        priority: 'Low', effort: 'Low', impact: 'Medium',
      },
      {
        title: 'Expense & Time Tracker',
        desc: `Ship a tiny, frictionless tracker for time or money spent on ${context.interests}. Designed for quick entry with ${context.skills}, so logging takes under 10 seconds.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: 'Workflow Orchestrator',
        desc: `Chain together several manual steps in your ${context.interests} workflow into a single automated pipeline using ${context.skills}. Respects ${context.constraints} — no over-engineering.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
      {
        title: 'Notification Aggregator',
        desc: `Consolidate scattered alerts and updates related to ${context.interests} into one digest built with ${context.skills}. Fewer interruptions, same awareness.`,
        priority: 'Low', effort: 'Medium', impact: 'Medium',
      },
    ],
    income: [
      {
        title: 'Micro SaaS Pilot',
        desc: `Prototype the smallest viable paid tool that solves a real pain point in ${context.interests}. Built with ${context.skills} in ${context.timeBudget}, validated before over-investing.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
      {
        title: 'Paid Template or Asset Pack',
        desc: `Design and package a set of reusable templates, components, or assets for ${context.interests} buyers. Distribution handled with ${context.skills} — straightforward income with low ongoing maintenance.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: 'Niche Lead Magnet Tool',
        desc: `Build a free, useful tool for a specific ${context.interests} audience that captures demand signals. Respects ${context.constraints} and gives you real data before committing to a paid product.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: 'Productized Service Builder',
        desc: `Turn a repeatable ${context.interests} service you could deliver manually into a fixed-scope, fixed-price offering with a simple intake form built in ${context.skills}.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: 'Creator Toolkit',
        desc: `Ship a compact set of tools aimed at creators working in ${context.interests}. Scoped to ${context.timeBudget} and built with ${context.skills} — a niche toolkit with a clear audience converts well.`,
        priority: 'Medium', effort: 'Medium', impact: 'Medium',
      },
      {
        title: 'Pricing Experiment Landing Page',
        desc: `Build a lean landing page for a ${context.interests} offer, test two or three pricing angles, and measure response. Validate the market before writing a line of product code.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: 'Subscription Utility',
        desc: `Build a lightweight utility for ${context.interests} with a recurring monthly value prop. Use ${context.skills} and keep it within ${context.constraints} so the cost-to-maintain stays low.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
      {
        title: 'Affiliate Content Hub',
        desc: `Create a focused content or comparison site around ${context.interests} that earns through affiliate or referral links. Built quickly in ${context.skills} — traffic and SEO do the ongoing work.`,
        priority: 'Low', effort: 'Medium', impact: 'Medium',
      },
    ],
    community: [
      {
        title: 'Curated Resource Hub',
        desc: `Build a well-organized, searchable collection of the best resources in ${context.interests} using ${context.skills}. A quality curation saves everyone time and earns trust.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: 'Local Event Organizer',
        desc: `Create a lightweight event listing or RSVP tool to help people in ${context.interests} connect locally. Built in ${context.skills} within ${context.timeBudget}, no over-engineering needed.`,
        priority: 'Medium', effort: 'Medium', impact: 'Medium',
      },
      {
        title: 'Open Data Map',
        desc: `Visualize publicly available community data related to ${context.interests} on an interactive map or chart. Built with ${context.skills}, respecting ${context.constraints} — transparency creates real impact.`,
        priority: 'Medium', effort: 'High', impact: 'High',
      },
      {
        title: 'Volunteer Match Tool',
        desc: `Build a simple matcher that connects people who want to help with ${context.interests} needs to specific opportunities. A focused form and list view is all it takes.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: 'Shared Progress Tracker',
        desc: `Create a group accountability tracker for a ${context.interests} goal — visible progress for everyone keeps momentum high. Scoped to ${context.timeBudget} using ${context.skills}.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: 'Awareness Campaign Site',
        desc: `Build a compelling one-page site for a ${context.interests} cause using ${context.skills}. Clear story, shareable link, one call to action — sometimes simple is the most powerful.`,
        priority: 'High', effort: 'Low', impact: 'High',
      },
      {
        title: 'Community Starter Kit',
        desc: `Ship a reusable starter kit that lowers the barrier for others trying to build in ${context.interests}. Document your decisions so the community can build on top of your ${context.skills}.`,
        priority: 'Low', effort: 'Medium', impact: 'Medium',
      },
      {
        title: 'Forum or Discussion Space',
        desc: `Stand up a focused discussion space or Q&A board for ${context.interests} using ${context.skills}. Constrained to ${context.timeBudget} — the community provides the content after launch.`,
        priority: 'Medium', effort: 'High', impact: 'Medium',
      },
    ],
    fun: [
      {
        title: 'Game Jam Prototype',
        desc: `Build a playable mini-game or interactive toy around ${context.interests} using ${context.skills}. Set a hard deadline within ${context.timeBudget} — constraints make games more creative, not less.`,
        priority: 'High', effort: 'Medium', impact: 'High',
      },
      {
        title: 'Generative Art Toy',
        desc: `Use ${context.skills} to build an in-browser generative art experiment inspired by ${context.interests}. Every run produces something new — share the output, not just the code.`,
        priority: 'Medium', effort: 'Low', impact: 'High',
      },
      {
        title: 'Interactive Story Engine',
        desc: `Build a small choose-your-own-adventure or branching narrative engine themed around ${context.interests}. Use ${context.skills} to make it feel alive, and keep the scope to ${context.timeBudget}.`,
        priority: 'Medium', effort: 'High', impact: 'High',
      },
      {
        title: 'Sound or Music Toy',
        desc: `Create a browser-based sound experiment tied to ${context.interests} — something people can play with for two minutes and immediately share. Built with ${context.skills}.`,
        priority: 'Medium', effort: 'Low', impact: 'Medium',
      },
      {
        title: 'Personal Arcade',
        desc: `Build a tiny collection of two or three micro-games in ${context.skills} around the theme of ${context.interests}. Pure self-expression — no user research required.`,
        priority: 'Low', effort: 'Medium', impact: 'Medium',
      },
      {
        title: 'Daily Weird Thing Generator',
        desc: `Build a site that generates one unexpected, delightful thing every day related to ${context.interests}. Use ${context.skills} to automate the content rotation. Weird and consistent wins followers.`,
        priority: 'Medium', effort: 'Low', impact: 'High',
      },
      {
        title: 'Multiplayer Experiment',
        desc: `Add a live multiplayer layer to a simple ${context.interests} concept using ${context.skills}. Keep the interaction model trivial so the novelty of real-time is the feature.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
      {
        title: 'Chaos / Random Idea Machine',
        desc: `Build a generator that combines random inputs from ${context.interests} to produce surprising, sometimes absurd results with ${context.skills}. Low-effort, endlessly shareable.`,
        priority: 'Low', effort: 'Low', impact: 'Medium',
      },
    ],
    productivity: [
      {
        title: 'Focus Session Timer',
        desc: `Build a Pomodoro-style focus timer tuned to your ${context.interests} workflow using ${context.skills}. Add one smart feature — like context-aware session labels — beyond what existing apps offer.`,
        priority: 'High', effort: 'Low', impact: 'High',
      },
      {
        title: 'Weekly Review Tool',
        desc: `Create a structured weekly review template and tracker tied to ${context.interests} goals. Built with ${context.skills} in ${context.timeBudget} — a consistent review practice compounds faster than any tool.`,
        priority: 'High', effort: 'Low', impact: 'High',
      },
      {
        title: 'Capture & Process Inbox',
        desc: `Build a fast-capture tool for ${context.interests} thoughts and tasks that funnels everything into a simple process step. Use ${context.skills} to make entry frictionless.`,
        priority: 'Medium', effort: 'Medium', impact: 'High',
      },
      {
        title: 'Goal Tracker Dashboard',
        desc: `Create a personal dashboard that visualizes your progress toward ${context.interests} goals using ${context.skills}. Seeing the trend line is more motivating than remembering a number.`,
        priority: 'Medium', effort: 'Medium', impact: 'Medium',
      },
      {
        title: 'Habit Streaker',
        desc: `Build a minimal habit tracker focused on a single ${context.interests} behavior. Use ${context.skills} to make check-in take under five seconds — the shorter the habit loop, the stronger it sticks.`,
        priority: 'Medium', effort: 'Low', impact: 'High',
      },
      {
        title: 'Reading or Learning List Manager',
        desc: `Build a focused list manager for articles, books, or courses in ${context.interests}. Use ${context.skills} to add one smart feature like tagging or progress tracking. No feature bloat.`,
        priority: 'Low', effort: 'Low', impact: 'Medium',
      },
      {
        title: 'Knowledge Base Builder',
        desc: `Create a personal, searchable knowledge base for what you learn in ${context.interests}. Built with ${context.skills} within ${context.timeBudget} — the value grows every time you add a note.`,
        priority: 'High', effort: 'High', impact: 'High',
      },
      {
        title: 'Meeting Notes Processor',
        desc: `Build a template + tool that takes raw meeting notes about ${context.interests} topics and structures them into action items automatically using ${context.skills}. Turns noise into next steps.`,
        priority: 'Medium', effort: 'Medium', impact: 'Medium',
      },
    ],
  };

  const selectedIdeas = ideaTemplates[context.goal] ?? ideaTemplates.learn;

  return {
    understanding,
    ideas: selectedIdeas.map((item, index) => ({
      id: index.toString(),
      title: item.title,
      description: item.desc,
      priority: item.priority,
      effort: item.effort,
      impact: item.impact,
    })),
  };
}
