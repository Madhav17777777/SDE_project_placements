import { NavLink } from 'react-router-dom';
import { IoHome, IoCompass, IoGrid, IoVideocam, IoSettings } from 'react-icons/io5';
import { useUiStore } from '../../store/uiStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { cn } from '../../utils/cn.js';

const links = [
  { to: ROUTES.HOME, label: 'Home', icon: IoHome },
  { to: ROUTES.BROWSE, label: 'Browse', icon: IoCompass },
  { to: '/browse?view=categories', label: 'Categories', icon: IoGrid },
];

const Sidebar = () => {
  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);
  const { isAuthenticated } = useAuth();

  return (
    <aside
      className={cn(
        'glass-panel sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col gap-1 overflow-y-auto p-3 transition-all lg:flex',
        isSidebarOpen ? 'w-56' : 'w-[72px]'
      )}
    >
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white',
              isActive && 'bg-accent-600/15 text-accent-glow'
            )
          }
        >
          <Icon size={20} />
          {isSidebarOpen && <span>{label}</span>}
        </NavLink>
      ))}

      <div className="my-2 border-t border-white/10" />

      {/* Any logged-in user can go live / upload / manage a channel in this
          project -- there's no separate "become a streamer" role upgrade,
          so this link is shown to every authenticated user, not gated by role. */}
      {isAuthenticated ? (
        <NavLink
          to={ROUTES.STREAMER_DASHBOARD}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white',
              isActive && 'bg-accent-600/15 text-accent-glow'
            )
          }
        >
          <IoVideocam size={20} />
          {isSidebarOpen && <span>Creator Dashboard</span>}
        </NavLink>
      ) : null}

      {isAuthenticated && (
        <NavLink
          to={ROUTES.PROFILE_SETTINGS}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white',
              isActive && 'bg-accent-600/15 text-accent-glow'
            )
          }
        >
          <IoSettings size={20} />
          {isSidebarOpen && <span>Settings</span>}
        </NavLink>
      )}
    </aside>
  );
};

export default Sidebar;
