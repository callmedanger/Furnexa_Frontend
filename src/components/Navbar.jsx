import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { AUTH_STORAGE_KEY, USER_EMAIL_KEY, USER_NAME_KEY, getDisplayNameFromEmail } from '../pages/Login';

const Navbar = () => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationCount = 3;
  const storedName = sessionStorage.getItem(USER_NAME_KEY);
  const storedEmail = sessionStorage.getItem(USER_EMAIL_KEY);
  const loggedInUser = storedName || getDisplayNameFromEmail(storedEmail) || 'Admin';
  const userInitials = loggedInUser
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'A';

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(USER_NAME_KEY);
    sessionStorage.removeItem(USER_EMAIL_KEY);
    navigate('/login', { replace: true });
  };

  const handleSettings = () => {
    setProfileOpen(false);
    navigate('/settings');
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-[#2E2118]/90 backdrop-blur-sm border-b border-[#EDE6DA] dark:border-white/10 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Search */}
      <div className="flex items-center gap-2 bg-[#F6F2EC] dark:bg-white/5 border border-transparent focus-within:border-[#C98A3D]/40 focus-within:bg-white dark:focus-within:bg-white/10 rounded-lg px-3.5 py-2.5 w-80 transition-colors">
        <Search size={16} className="text-[#A99A82] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search orders, users, products..."
          className="bg-transparent outline-none text-sm w-full placeholder:text-[#A99A82] text-[#2E2118] dark:text-[#E8DFD3]"
        />
        <kbd className="hidden sm:block text-[10px] text-[#A99A82] bg-white dark:bg-white/10 border border-[#EDE6DA] dark:border-white/10 rounded px-1.5 py-0.5 font-sans">
          ⌘K
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* Notifications */}
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Open notifications"
          title="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#5C4A3A] dark:text-[#E8DFD3] hover:bg-[#F6F2EC] dark:hover:bg-white/10 hover:text-[#C98A3D] transition-colors"
        >
          <Bell size={19} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-semibold text-white bg-[#C1694F] rounded-full">
              {notificationCount}
            </span>
          )}
        </button>

        <div className="w-px h-8 bg-[#EDE6DA] dark:bg-white/10" />

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-3 px-1.5 py-1 rounded-lg hover:bg-[#F6F2EC] dark:hover:bg-white/10 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C98A3D] to-[#A8672A] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {userInitials}
            </div>
            <div className="leading-tight text-left hidden sm:block">
              <p className="text-sm font-medium text-[#2E2118] dark:text-[#E8DFD3]">{loggedInUser}</p>
              <p className="text-xs text-[#A99A82]">Furnexa Team</p>
            </div>
            <ChevronDown
              size={15}
              className={`text-[#A99A82] transition-transform ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-12 w-48 bg-white dark:bg-[#2A1F16] rounded-xl shadow-lg border border-[#EDE6DA] dark:border-white/10 py-1.5 z-20">
                <button
                  type="button"
                  onClick={handleSettings}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#5C4A3A] dark:text-[#C9BBA4] hover:bg-[#F6F2EC] dark:hover:bg-white/10 transition-colors"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <div className="h-px bg-[#EDE6DA] dark:bg-white/10 my-1" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#C1694F] hover:bg-[#FBE9E4] dark:hover:bg-[#C1694F]/10 transition-colors"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;