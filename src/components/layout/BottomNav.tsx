import { NavLink } from 'react-router-dom';
import { Compass, Home, Lock, MessageCircle, PlusSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Avatar from '../Avatar';

export default function BottomNav() {
  const { currentUser } = useApp();
  if (!currentUser) return null;

  const items = [
    { to: '/feed', icon: Home },
    { to: '/explore', icon: Compass },
    { to: '/vault', icon: Lock },
    { to: '/upload', icon: PlusSquare },
    { to: '/messages', icon: MessageCircle },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-void/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
      {items.map(({ to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center rounded-lg px-3 py-1.5 ${isActive ? 'text-paper' : 'text-smoke'}`
          }
        >
          {({ isActive }) => <Icon className="h-6 w-6" strokeWidth={isActive ? 2 : 1.5} />}
        </NavLink>
      ))}
      <NavLink to={`/profile/${currentUser.handle}`} className="flex flex-col items-center rounded-lg px-3 py-1.5">
        {({ isActive }) => <Avatar seed={currentUser.avatarSeed} size={26} ring={isActive} />}
      </NavLink>
    </nav>
  );
}
