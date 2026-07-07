import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../src/components/common/Badge.jsx';

describe('Badge', () => {
  it('renders its children text', () => {
    render(<Badge>coding</Badge>);
    expect(screen.getByText('coding')).toBeInTheDocument();
  });

  it('applies the live variant styling', () => {
    render(<Badge variant="live">Live</Badge>);
    expect(screen.getByText('Live').className).toContain('bg-red-600');
  });
});
