import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BrainstormForm from './BrainstormForm';

describe('BrainstormForm', () => {
  it('submits explicit tech preferences instead of a loose stack string', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<BrainstormForm onSubmit={onSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/Interests/i), 'fitness analytics');
    await user.selectOptions(screen.getByLabelText(/Project Goal/i), 'portfolio');
    await user.selectOptions(screen.getByLabelText(/Platform/i), 'web');
    await user.click(screen.getByRole('button', { name: /^Python$/i }));
    await user.click(screen.getByRole('button', { name: /^Next\.js$/i }));
    await user.selectOptions(screen.getByLabelText(/Backend Preference/i), 'required');
    await user.selectOptions(screen.getByLabelText(/Data Layer/i), 'supabase');
    await user.type(screen.getByLabelText(/Additional Stack Notes/i), 'deploy it simply');
    await user.type(screen.getByLabelText(/Constraints/i), 'free tools only');
    await user.click(screen.getByRole('button', { name: /Generate Project Ideas/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        interests: 'fitness analytics',
        goal: 'portfolio',
        techPreferences: expect.objectContaining({
          platform: 'web',
          preferredLanguages: ['TypeScript', 'Python'],
          preferredFrameworks: ['React', 'Next.js'],
          backendPreference: 'required',
          dataLayer: 'supabase',
          stackNotes: 'deploy it simply',
        }),
      })
    );
  });
});
