import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShoppingBag, Bell, Package, Settings, LogOut,
  Mail, History, MessageSquare, ChevronDown, Truck, Palette,
} from 'lucide-react';
import furnexaLogo from '../assets/furnexa.jpeg';
import { AUTH_STORAGE_KEY } from '../pages/Login';

const navGroups = [
  {
    label: 'abdulrehman',
    items: [{ label: 'Dashboard', path: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Users',
    items: [
      { label: 'Manage Users', path: '/users', icon: Users },
      { label: 'Email Users', path: '/email-users', icon: Mail },
      { label: 'Email History', path: '/email-history', icon: History },
    ],
  },
  {
    label: 'Team',
    items: [
      { label: 'Riders', path: '/riders', icon: Truck },
      { label: 'Designers', path: '/designers', icon: Palette },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Manage Products', path: '/products', icon: Package },
      { label: 'Manage Orders', path: '/orders', icon: ShoppingBag },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { label: 'Feedback', path: '/feedback', icon: MessageSquare },
      { label: 'Notifications', path: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'System',
    items: [{ label: 'Settings', path: '/settings', icon: Settings }],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState(() =>
    navGroups.reduce((acc, group) => {
      acc[group.label] = ['Overview', 'Users'].includes(group.label);
      return acc;
    }, {})
  );

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 h-screen sticky top-0 overflow-y-auto bg-[#2E2118] dark:bg-[#150F0A] text-[#E8DFD3] flex flex-col border-r border-transparent dark:border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <img src={furnexaLogo} alt="Furnexa logo" className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/10" />
        <div className="leading-tight">
          <span className="text-lg font-serif tracking-wide text-white block">Furnexa</span>
          <span className="text-[10px] text-[#8A7C68] uppercase tracking-wider">Admin Panel</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navGroups.map((group) => {
          const isOpen = openGroups[group.label];
          const isGroupActive = group.items.some((item) =>
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
          );

          return (
            <div key={group.label} className="mb-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                  isGroupActive ? 'text-[#E7C084]' : 'text-[#8A7C68] hover:text-[#D8C5A7]'
                }`}
              >
                {group.label}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-0.5 pt-0.5 pb-1">
                  {group.items.map(({ label, path, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      end={path === '/'}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all relative ${
                          isActive
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-[#B8AA97] hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 bg-[#C98A3D] rounded-r-full shadow-[0_0_14px_rgba(201,138,61,0.45)]" />
                          )}
                          <Icon
                            size={18}
                            strokeWidth={isActive ? 2.5 : 1.75}
                            className={isActive ? 'text-[#F0C98C]' : 'text-[#8A7C68] group-hover:text-[#D8C5A7]'}
                          />
                          <span className={isActive ? 'font-semibold' : ''}>{label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10 flex items-center justify-between">
        <div className="leading-tight">
          <p className="text-xs font-medium text-[#E8DFD3]">Furnexa Admin</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg text-[#B8AA97] hover:bg-white/5 hover:text-[#C1694F] transition-colors"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;