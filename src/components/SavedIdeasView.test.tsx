import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SavedIdeasView from './SavedIdeasView';
import type { IdeaElaboration } from '../services/brainstormService';
import type { BrainstormContext } from '../services/brainstormService';

vi.mock('../services/persistenceService', () => ({
  getSavedIdeas: vi.fn(),
  deleteIdea: vi.fn(),
}));

vi.mock('../services/exportService', () => ({
  exportToJSON: vi.fn(),
  exportToMarkdown: vi.fn(),
}));

import { getSavedIdeas, deleteIdea } from '../services/persistenceService';
import { exportToJSON, exportToMarkdown } from '../services/exportService';

const elaboration: IdeaElaboration = {
  overview: 'Overview text',
  coreFeatures: ['A'],
  dataFlow: 'Flow',
  milestones: ['M1'],
  risks: ['R1'],
  stretchGoals: ['G1'],
};

const context: BrainstormContext = {
  interests: 'AI',
  skills: 'TS',
  timeBudget: '10h',
  goal: 'portfolio',
  constraints: 'None',
};

describe('SavedIdeasView export', () => {
  beforeEach(() => {
    vi.mocked(getSavedIdeas).mockReset();
    vi.mocked(deleteIdea).mockReset();
    vi.mocked(exportToJSON).mockReset();
    vi.mocked(exportToMarkdown).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('calls JSON and Markdown exporters from the expanded card when elaboration exists', async () => {
    const user = userEvent.setup();
    vi.mocked(getSavedIdeas).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'row-1',
          title: 'Saved Project',
          description: 'A saved description',
          priority: 'High',
          effort: 'Low',
          impact: 'Medium',
          elaboration,
          context,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    const onToast = vi.fn();
    render(<SavedIdeasView onToast={onToast} />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading saved ideas/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Saved Project/i }));

    await user.click(screen.getByRole('button', { name: /Export JSON/i }));
    await user.click(screen.getByRole('button', { name: /Export Markdown/i }));

    expect(exportToJSON).toHaveBeenCalledTimes(1);
    expect(exportToJSON).toHaveBeenCalledWith(
      {
        id: 'row-1',
        title: 'Saved Project',
        description: 'A saved description',
        priority: 'High',
        effort: 'Low',
        impact: 'Medium',
      },
      elaboration,
      context
    );

    expect(exportToMarkdown).toHaveBeenCalledTimes(1);
    expect(exportToMarkdown).toHaveBeenCalledWith(
      {
        id: 'row-1',
        title: 'Saved Project',
        description: 'A saved description',
        priority: 'High',
        effort: 'Low',
        impact: 'Medium',
      },
      elaboration,
      context
    );

    expect(onToast).toHaveBeenCalledWith('success', 'Exported idea as JSON file.', 3000);
    expect(onToast).toHaveBeenCalledWith('success', 'Exported idea as Markdown file.', 3000);
  });

  it('shows a guard toast when elaboration is missing and does not call exporters', async () => {
    const user = userEvent.setup();
    vi.mocked(getSavedIdeas).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'row-2',
          title: 'No Detail Idea',
          description: 'Short',
          priority: null,
          effort: null,
          impact: null,
          elaboration: null,
          context: null,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    const onToast = vi.fn();
    render(<SavedIdeasView onToast={onToast} />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading saved ideas/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /No Detail Idea/i }));

    await user.click(screen.getByRole('button', { name: /Export JSON/i }));
    await user.click(screen.getByRole('button', { name: /Export Markdown/i }));

    expect(onToast).toHaveBeenCalledWith(
      'error',
      'This saved idea does not have enough detail to export.',
      4000
    );
    expect(onToast).toHaveBeenCalledTimes(2);
    expect(exportToJSON).not.toHaveBeenCalled();
    expect(exportToMarkdown).not.toHaveBeenCalled();
  });

  it('shows an error toast when Export JSON fails because the exporter throws', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      vi.mocked(getSavedIdeas).mockResolvedValue({
        success: true,
        data: [
          {
            id: 'row-throw',
            title: 'Throwy Project',
            description: 'Desc',
            priority: 'Medium',
            effort: 'Medium',
            impact: 'Medium',
            elaboration,
            context: null,
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
          },
        ],
      });

      vi.mocked(exportToJSON).mockImplementation(() => {
        throw new Error('download failed');
      });

      const onToast = vi.fn();
      render(<SavedIdeasView onToast={onToast} />);

      await waitFor(() => {
        expect(screen.queryByText(/Loading saved ideas/i)).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Throwy Project/i }));
      await user.click(screen.getByRole('button', { name: /Export JSON/i }));

      expect(onToast).toHaveBeenCalledWith('error', 'Failed to export idea.', 4000);
      expect(consoleError).toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it('shows an error toast when Export Markdown fails because the exporter throws', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      vi.mocked(getSavedIdeas).mockResolvedValue({
        success: true,
        data: [
          {
            id: 'row-md-throw',
            title: 'Markdown Throw Project',
            description: 'Desc',
            priority: 'Medium',
            effort: 'Medium',
            impact: 'Medium',
            elaboration,
            context: null,
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
          },
        ],
      });

      vi.mocked(exportToMarkdown).mockImplementation(() => {
        throw new Error('markdown export failed');
      });

      const onToast = vi.fn();
      render(<SavedIdeasView onToast={onToast} />);

      await waitFor(() => {
        expect(screen.queryByText(/Loading saved ideas/i)).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Markdown Throw Project/i }));
      await user.click(screen.getByRole('button', { name: /Export Markdown/i }));

      expect(onToast).toHaveBeenCalledWith('error', 'Failed to export idea.', 4000);
      expect(consoleError).toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});
