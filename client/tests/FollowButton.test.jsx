// FollowButton talks to the network (React Query + user.service.js) and to
// auth state (useAuth), so unlike the presentational components above this
// one mocks both: `vi.mock` swaps the real modules for test doubles we
// control, letting us assert behavior (follow -> unfollow toggle, and the
// logged-out fallback) without a running backend.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FollowButton from '../src/components/channel/FollowButton.jsx';

vi.mock('../src/hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../src/services/user.service.js', () => ({
  userService: {
    getFollowStatus: vi.fn(),
    followChannel: vi.fn(),
    unfollowChannel: vi.fn(),
  },
}));
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

import { useAuth } from '../src/hooks/useAuth.js';
import { userService } from '../src/services/user.service.js';
import toast from 'react-hot-toast';

const renderWithClient = (ui) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('FollowButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prompts an anonymous user to log in instead of following', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    renderWithClient(<FollowButton channelId="channel1" />);
    fireEvent.click(screen.getByRole('button', { name: /follow/i }));

    expect(toast).toHaveBeenCalledWith('Log in to follow channels');
    expect(userService.followChannel).not.toHaveBeenCalled();
  });

  it('shows "Follow" then calls followChannel when clicked', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    userService.getFollowStatus.mockResolvedValue({ data: { following: false } });
    userService.followChannel.mockResolvedValue({ data: {} });

    renderWithClient(<FollowButton channelId="channel1" />);

    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Follow'));
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(userService.followChannel).toHaveBeenCalledWith('channel1'));
  });

  it('shows "Following" and calls unfollowChannel when already following', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    userService.getFollowStatus.mockResolvedValue({ data: { following: true } });
    userService.unfollowChannel.mockResolvedValue({ data: {} });

    renderWithClient(<FollowButton channelId="channel1" />);

    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Following'));
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(userService.unfollowChannel).toHaveBeenCalledWith('channel1'));
  });
});
