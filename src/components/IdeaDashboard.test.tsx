import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import IdeaDashboard from './IdeaDashboard';

describe('IdeaDashboard planning mode', () => {
  it('shows planning questions and lets the user generate a build plan', async () => {
    const user = userEvent.setup();
    const onPlanningAnswersChange = vi.fn();
    const onGeneratePlan = vi.fn();
    const Dashboard = IdeaDashboard as unknown as React.ComponentType<Record<string, unknown>>;

    render(
      <Dashboard
        understanding="You want a portfolio-ready fitness dashboard."
        ideas={[
          {
            id: '1',
            title: 'React Coach Dashboard',
            description: 'A React dashboard for tracking workouts and trends.',
            priority: 'High',
            effort: 'Medium',
            impact: 'High',
          },
        ]}
        selectedIdea={{
          id: '1',
          title: 'React Coach Dashboard',
          description: 'A React dashboard for tracking workouts and trends.',
          priority: 'High',
          effort: 'Medium',
          impact: 'High',
        }}
        elaboration={{
          overview: 'A dashboard for coaches to monitor progress.',
          coreFeatures: ['Dashboard', 'Client list', 'Progress charts', 'Notes'],
          dataFlow: 'Capture workout entries and visualize trend lines.',
          milestones: ['Set up app', 'Build dashboard', 'Polish charts'],
          risks: ['Scope creep', 'Too many integrations'],
          stretchGoals: ['Mobile layout', 'CSV export'],
        }}
        planningAnswers={{
          deploymentTarget: 'simple-web-deploy',
          authRequirement: 'required',
          collaborationMode: 'solo-only',
          deliveryBias: 'balanced',
          integrationNeeds: 'light-integrations',
        }}
        projectPlan={null}
        isPlanning={false}
        planSource="template"
        onPlanningAnswersChange={onPlanningAnswersChange}
        onGeneratePlan={onGeneratePlan}
        isStorageConfigured={false}
        storageLabel="Database"
        isSaving={false}
        onSelectIdea={vi.fn()}
        onReset={vi.fn()}
        onExportJSON={vi.fn()}
        onExportMarkdown={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText(/Planning Mode/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/Deployment Target/i), 'local-first');
    expect(onPlanningAnswersChange).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Generate Build Plan/i }));
    expect(onGeneratePlan).toHaveBeenCalled();
  });
});
