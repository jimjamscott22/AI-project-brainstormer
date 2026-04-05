import type {
  Idea,
  IdeaElaboration,
  BrainstormContext,
  PlanningAnswers,
  ProjectPlan,
} from './brainstormService';

export interface ExportedIdea {
  idea: Idea;
  elaboration: IdeaElaboration;
  context?: BrainstormContext;
  exportedAt: string;
}

export interface ExportedBuildPlan {
  idea: Idea;
  plan: ProjectPlan;
  planningAnswers: PlanningAnswers;
  context?: BrainstormContext;
  exportedAt: string;
}

/**
 * Triggers a browser download for the given content
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Sanitize a string for use in a filename
 */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Export idea as JSON file
 */
export function exportToJSON(
  idea: Idea,
  elaboration: IdeaElaboration,
  context?: BrainstormContext
): void {
  const exportData: ExportedIdea = {
    idea,
    elaboration,
    context,
    exportedAt: new Date().toISOString(),
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const filename = `project-idea-${sanitizeFilename(idea.title)}.json`;

  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Export idea as Markdown file
 */
export function exportToMarkdown(
  idea: Idea,
  elaboration: IdeaElaboration,
  context?: BrainstormContext
): void {
  const lines: string[] = [];

  // Header
  lines.push(`# ${idea.title}`);
  lines.push('');
  lines.push(`> Exported on ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`);
  lines.push('');

  // Idea summary
  lines.push('## Summary');
  lines.push('');
  lines.push(idea.description);
  lines.push('');
  lines.push(`| Attribute | Value |`);
  lines.push(`|-----------|-------|`);
  lines.push(`| Priority | ${idea.priority} |`);
  lines.push(`| Effort | ${idea.effort} |`);
  lines.push(`| Impact | ${idea.impact} |`);
  lines.push('');

  // Overview
  lines.push('## Overview');
  lines.push('');
  lines.push(elaboration.overview);
  lines.push('');

  // Core Features
  lines.push('## Core Features');
  lines.push('');
  elaboration.coreFeatures.forEach(feature => {
    lines.push(`- ${feature}`);
  });
  lines.push('');

  // Data Flow
  lines.push('## Data Flow');
  lines.push('');
  lines.push(elaboration.dataFlow);
  lines.push('');

  // Milestones
  lines.push('## Milestones');
  lines.push('');
  elaboration.milestones.forEach((milestone, index) => {
    lines.push(`${index + 1}. ${milestone}`);
  });
  lines.push('');

  // Risks
  lines.push('## Risks');
  lines.push('');
  elaboration.risks.forEach(risk => {
    lines.push(`- ⚠️ ${risk}`);
  });
  lines.push('');

  // Stretch Goals
  lines.push('## Stretch Goals');
  lines.push('');
  elaboration.stretchGoals.forEach(goal => {
    lines.push(`- 🎯 ${goal}`);
  });
  lines.push('');

  // Context (if provided)
  if (context) {
    lines.push('---');
    lines.push('');
    lines.push('## Original Context');
    lines.push('');
    lines.push(`- **Interests:** ${context.interests}`);
    lines.push(`- **Skills:** ${context.skills}`);
    lines.push(`- **Time Budget:** ${context.timeBudget}`);
    lines.push(`- **Goal:** ${context.goal}`);
    lines.push(`- **Constraints:** ${context.constraints}`);
    lines.push('');
  }

  const markdownContent = lines.join('\n');
  const filename = `project-idea-${sanitizeFilename(idea.title)}.md`;

  downloadFile(markdownContent, filename, 'text/markdown');
}

/**
 * Export build plan as JSON file
 */
export function exportBuildPlanToJSON(
  idea: Idea,
  plan: ProjectPlan,
  planningAnswers: PlanningAnswers,
  context?: BrainstormContext
): void {
  const exportData: ExportedBuildPlan = {
    idea,
    plan,
    planningAnswers,
    context,
    exportedAt: new Date().toISOString(),
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const filename = `build-plan-${sanitizeFilename(idea.title)}.json`;

  downloadFile(jsonContent, filename, 'application/json');
}

function pushListSection(lines: string[], heading: string, items: string[]): void {
  lines.push(`## ${heading}`);
  lines.push('');
  items.forEach((item) => {
    lines.push(`- ${item}`);
  });
  lines.push('');
}

/**
 * Export build plan as Markdown file
 */
export function exportBuildPlanToMarkdown(
  idea: Idea,
  plan: ProjectPlan,
  planningAnswers: PlanningAnswers,
  context?: BrainstormContext
): void {
  const lines: string[] = [];

  lines.push(`# Build Plan: ${idea.title}`);
  lines.push('');
  lines.push(`> Exported on ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`);
  lines.push('');

  lines.push('## Idea Summary');
  lines.push('');
  lines.push(idea.description);
  lines.push('');
  lines.push('| Attribute | Value |');
  lines.push('|-----------|-------|');
  lines.push(`| Priority | ${idea.priority} |`);
  lines.push(`| Effort | ${idea.effort} |`);
  lines.push(`| Impact | ${idea.impact} |`);
  lines.push('');

  lines.push('## Planning Inputs');
  lines.push('');
  lines.push('| Input | Value |');
  lines.push('|-------|-------|');
  lines.push(`| Deployment Target | ${planningAnswers.deploymentTarget} |`);
  lines.push(`| Auth Requirement | ${planningAnswers.authRequirement} |`);
  lines.push(`| Collaboration Mode | ${planningAnswers.collaborationMode} |`);
  lines.push(`| Delivery Bias | ${planningAnswers.deliveryBias} |`);
  lines.push(`| Integration Needs | ${planningAnswers.integrationNeeds} |`);
  lines.push('');

  pushListSection(lines, 'Recommended Stack', plan.recommendedStack);

  lines.push('## Why This Stack Fits');
  lines.push('');
  lines.push(plan.stackRationale);
  lines.push('');

  lines.push('## Architecture Summary');
  lines.push('');
  lines.push(plan.architectureSummary);
  lines.push('');

  pushListSection(lines, 'Feature Phases', plan.featurePhases);
  pushListSection(lines, 'Data Model', plan.dataModel);
  pushListSection(lines, 'API Needs', plan.apiNeeds);
  pushListSection(lines, 'Delivery Milestones', plan.deliveryMilestones);
  pushListSection(lines, 'Risks', plan.risks);
  pushListSection(lines, 'De-scope First If Needed', plan.descopingOptions);

  if (context) {
    lines.push('---');
    lines.push('');
    lines.push('## Original Context');
    lines.push('');
    lines.push(`- **Interests:** ${context.interests}`);
    lines.push(`- **Skills:** ${context.skills}`);
    lines.push(`- **Time Budget:** ${context.timeBudget}`);
    lines.push(`- **Goal:** ${context.goal}`);
    lines.push(`- **Constraints:** ${context.constraints}`);
    lines.push('');
  }

  const markdownContent = lines.join('\n');
  const filename = `build-plan-${sanitizeFilename(idea.title)}.md`;

  downloadFile(markdownContent, filename, 'text/markdown');
}
