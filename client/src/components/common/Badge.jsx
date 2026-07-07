import { cn } from '../../utils/cn.js';

const VARIANTS = {
  default: 'bg-white/10 text-white/80',
  accent: 'bg-accent-600/20 text-accent-glow',
  live: 'bg-red-600 text-white',
};

const Badge = ({ variant = 'default', className, children }) => (
  <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', VARIANTS[variant], className)}>
    {children}
  </span>
);

export default Badge;
