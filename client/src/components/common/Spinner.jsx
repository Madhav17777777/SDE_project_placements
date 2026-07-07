import { cn } from '../../utils/cn.js';

const Spinner = ({ size = 24, className }) => (
  <div
    className={cn('animate-spin rounded-full border-2 border-white/20 border-t-accent-500', className)}
    style={{ width: size, height: size }}
  />
);

export default Spinner;
