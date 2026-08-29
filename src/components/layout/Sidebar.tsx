import { NavLink } from 'react-router-dom';
import { Compass, Home, Lock, MessageCircle, PlusSquare, Shield, User } from 'lucide-react';
import Logo from '../Logo';
import Avatar from '../Avatar';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { to: '/feed', label: 'Feed', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/vault', label: 'Vault', icon: Lock },
  { to: '/upload', label: 'Post', icon: PlusSquare },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
];

export default function Sidebar() {
  const { currentUser } = useApp();
  if (!currentUser) return null;

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-line bg-void px-4 py-6 md:flex">
      <div className="mb-8 px-2">
        <Logo withWordmark size={34} />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3.5 rounded-xl px-3 py-3 text-[15px] transition-colors ${
                isActive ? 'bg-paper text-void font-semibold' : 'text-fog hover:bg-ink hover:text-paper'
              }`
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}

        {currentUser.isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3.5 rounded-xl px-3 py-3 text-[15px] transition-colors ${
                isActive ? 'bg-paper text-void font-semibold' : 'text-fog hover:bg-ink hover:text-paper'
              }`
            }
          >
            <Shield className="h-5 w-5" strokeWidth={1.75} />
            Admin
          </NavLink>
        )}
      </nav>

      <NavLink
        to={`/profile/${currentUser.handle}`}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
            isActive ? 'bg-ink' : 'hover:bg-ink'
          }`
        }
      >
        <Avatar seed={currentUser.avatarSeed} size={34} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-paper">{currentUser.handle}</p>
          <p className="flex items-center gap-1 text-xs text-smoke">
            <User className="h-3 w-3" /> View profile
          </p>
        </div>
      </NavLink>
    </aside>
  );
}
