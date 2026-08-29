import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { LayoutGrid, ListTree, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TABS = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/admin/categories', label: 'Categories', icon: ListTree, end: false },
  { to: '/admin/creators', label: 'Creators', icon: ShieldCheck, end: false },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/reports', label: 'Reports', icon: ShieldAlert, end: false },
];

export default function AdminLayout() {
  const { currentUser } = useApp();
  if (!currentUser?.isAdmin) return <Navigate to="/feed" replace />;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <h1 className="font-display text-2xl tracking-tightest text-paper">Admin</h1>
      <p className="mt-1 text-sm text-smoke">Manage categories, members, and reports for Hunter.</p>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${
                isActive ? 'border-paper text-paper' : 'border-transparent text-smoke hover:text-paper'
              }`
            }
          >
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
      </div>

      <div className="py-6">
        <Outlet />
      </div>
    </div>
  );
}
