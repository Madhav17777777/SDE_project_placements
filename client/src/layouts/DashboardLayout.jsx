import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import { ROUTES } from '../constants/routes.js';
import { cn } from '../utils/cn.js';

const links = [
  { to: ROUTES.STREAMER_DASHBOARD, label: 'Overview' },
  { to: ROUTES.STREAM_MANAGER, label: 'Streams' },
  { to: ROUTES.UPLOAD_VIDEO, label: 'Upload Video' },
  { to: ROUTES.CHANNEL_SETTINGS, label: 'Channel Settings' },
];

const DashboardLayout = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 md:px-8">
      <aside className="glass-card h-fit w-56 shrink-0 p-3">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'block rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white',
                isActive && 'bg-accent-600/15 text-accent-glow'
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
