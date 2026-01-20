export interface BrainstormContext {
  companyName: string;
  productName: string;
  timeline: string;
  teamGoals: string;
  sessionType: 'product' | 'marketing' | 'strategy' | 'operations';
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
  
  const understanding = `Based on your context, I understand that ${context.companyName} is focused on ${context.productName}. Your team goals involve ${context.teamGoals} within a ${context.timeline} timeframe. For this ${context.sessionType} session, we need to bridge the gap between your current product capabilities and these specific objectives.`;

  const ideaTemplates = {
    product: [
      { title: "Core Loop Enhancement", desc: `Optimize the primary ${context.productName} user flow to directly support ${context.teamGoals}.` },
      { title: "Feature Integration", desc: `Integrate a new module that accelerates the ${context.timeline} delivery schedule.` },
      { title: "UX Refinement", desc: `Redesign the interface to highlight value props mentioned in your goals.` },
      { title: "Scalability Audit", desc: `Ensuring ${context.productName} can handle the growth expected by the end of ${context.timeline}.` },
      { title: "Competitive Edge", desc: `Develop a unique feature for ${context.companyName} that distinguishes it in the ${context.sessionType} space.` },
      { title: "API First Approach", desc: `Expose ${context.productName} core logic to allow ecosystem growth.` }
    ],
    marketing: [
      { title: "Targeted Campaign", desc: `Launch a campaign for ${context.companyName} focusing on the unique selling points of ${context.productName}.` },
      { title: "Content Strategy", desc: `Create educational content around ${context.teamGoals} to build authority.` },
      { title: "Social Proof Program", desc: `Leverage early ${context.productName} wins to drive adoption during ${context.timeline}.` },
      { title: "Partnership Outreach", desc: `Align with companies that complement ${context.companyName}'s current market position.` },
      { title: "Viral Referral Loop", desc: `Implement a mechanism in ${context.productName} that rewards ${context.sessionType} sharing.` },
      { title: "Brand Identity Refresh", desc: `Modernize ${context.companyName}'s visual language for the ${context.timeline} launch.` }
    ],
    strategy: [
      { title: "Market Pivot Analysis", desc: `Evaluate if ${context.productName} should expand into adjacent sectors.` },
      { title: "Resource Reallocation", desc: `Shift focus to high-impact areas that hit ${context.teamGoals} faster.` },
      { title: "Risk Mitigation Plan", desc: `Identify potential blockers for ${context.companyName} in the next ${context.timeline}.` },
      { title: "Operational Excellence", desc: `Streamline internal ${context.sessionType} processes.` },
      { title: "Customer Retention Focus", desc: `Deepen the relationship with current ${context.productName} users.` },
      { title: "Long-term Roadmap", desc: `Define the vision for ${context.companyName} beyond ${context.timeline}.` }
    ],
    operations: [
      { title: "Workflow Automation", desc: `Automate repetitive tasks in the ${context.productName} development cycle.` },
      { title: "Team Scaling Plan", desc: `Hire specialized talent to meet the ${context.teamGoals}.` },
      { title: "Tooling Upgrade", desc: `Adopt modern infrastructure to support ${context.companyName}'s growth.` },
      { title: "Communication Protocol", desc: `Improve sync between teams for the ${context.timeline} push.` },
      { title: "Cost Optimization", desc: `Reduce overhead in ${context.sessionType} without sacrificing quality.` },
      { title: "Documentation Sprint", desc: `Ensure knowledge about ${context.productName} is preserved as the team grows.` }
    ]
  };

  const selectedIdeas = ideaTemplates[context.sessionType] || ideaTemplates.product;

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
