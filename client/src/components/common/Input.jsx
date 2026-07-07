import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

// forwardRef so react-hook-form's `register()` can attach its ref directly.
const Input = forwardRef(({ label, error, className, ...props }, ref) => (
  <label className="block">
    {label && <span className="mb-1.5 block text-sm font-medium text-white/70">{label}</span>}
    <input ref={ref} className={cn('input-field', error && 'border-red-500 focus:ring-red-500/30', className)} {...props} />
    {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
  </label>
));

Input.displayName = 'Input';

export default Input;
