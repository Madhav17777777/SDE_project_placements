import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center justify-center gap-2 rounded-xl bg-red-600/90 px-4 py-2.5 font-medium text-white transition-all duration-200 hover:bg-red-600 active:scale-[0.98] disabled:opacity-50',
};

const Button = ({ variant = 'primary', className, isLoading, children, ...props }) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    className={cn(VARIANTS[variant], className)}
    disabled={isLoading || props.disabled}
    {...props}
  >
    {isLoading ? (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    ) : null}
    {children}
  </motion.button>
);

export default Button;
