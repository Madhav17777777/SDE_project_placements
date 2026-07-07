import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from '../src/components/common/Avatar.jsx';

describe('Avatar', () => {
  it('shows initials when no image src is provided', () => {
    render(<Avatar name="pixelqueen" />);
    expect(screen.getByText('PI')).toBeInTheDocument();
  });

  it('renders an <img> when a src is provided', () => {
    render(<Avatar src="https://example.com/avatar.png" name="pixelqueen" />);
    const img = screen.getByRole('img', { name: 'pixelqueen' });
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
  });

  it('shows a live badge when isLive is true', () => {
    render(<Avatar name="pixelqueen" isLive />);
    expect(screen.getByText('live')).toBeInTheDocument();
  });

  it('does not show a live badge by default', () => {
    render(<Avatar name="pixelqueen" />);
    expect(screen.queryByText('live')).not.toBeInTheDocument();
  });
});
