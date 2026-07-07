import { cn } from '../../utils/cn.js';

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg', xl: 'h-24 w-24 text-2xl' };

const Avatar = ({ src, name = '?', size = 'md', isLive, className }) => {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full bg-accent-700 font-semibold text-white',
          SIZES[size],
          isLive && 'ring-2 ring-red-500 ring-offset-2 ring-offset-surface-950'
        )}
      >
        {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initials}
      </div>
      {isLive && (
        <span className="absolute -bottom-0.5 -right-0.5 rounded bg-red-600 px-1 text-[9px] font-bold uppercase">
          live
        </span>
      )}
    </div>
  );
};

export default Avatar;
