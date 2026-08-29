import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useApp } from '../../context/AppContext';

export default function AppShell() {
  const { currentUser, isOnboarded } = useApp();

  if (!currentUser) return <Navigate to="/" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding/interests" replace />;

  return (
    <div className="flex min-h-screen bg-void">
      <Sidebar />
      <main className="min-h-screen w-full flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
