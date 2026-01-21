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

export interface BrainstormResult {
  understanding: string;
  ideas: Idea[];
}

export const generateIdeas = async (context: BrainstormContext): Promise<BrainstormResult> => {
  // Simulate local LLM processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real scenario, this would call a local LLM API like Ollama or use WebLLM
  // For this exercise, we'll use a sophisticated template generator that proves contextuality
  
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
};
