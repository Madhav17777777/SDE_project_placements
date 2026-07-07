import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMenu, IoSearch, IoNotifications } from 'react-icons/io5';
import { useAuth } from '../../hooks/useAuth.js';
import { useUiStore } from '../../store/uiStore.js';
import { useNotificationStore } from '../../store/notificationStore.js';
import { ROUTES } from '../../constants/routes.js';
import Avatar from '../common/Avatar.jsx';
import Button from '../common/Button.jsx';

const Navbar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="glass-panel sticky top-0 z-40 flex h-16 items-center gap-4 px-4">
      <button onClick={toggleSidebar} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden">
        <IoMenu size={22} />
      </button>

      <Link to={ROUTES.HOME} className="flex items-center gap-2 font-bold text-lg tracking-tight">
        <span className="bg-gradient-to-br from-accent-400 to-accent-700 bg-clip-text text-transparent">
          StreamVerse
        </span>
      </Link>

      <form onSubmit={handleSearch} className="mx-auto hidden max-w-md flex-1 md:block">
        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search streams, videos, channels..."
            className="input-field pl-10"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link to={ROUTES.NOTIFICATIONS} className="relative rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white">
              <IoNotifications size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-600 text-[10px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to={ROUTES.PROFILE_SETTINGS}>
              <Avatar src={user?.avatar} name={user?.username} size="sm" />
            </Link>
            <Button variant="ghost" onClick={logout} className="hidden sm:inline-flex">
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to={ROUTES.SIGNUP}>
              <Button variant="primary">Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
