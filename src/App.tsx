import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CreatorProvider } from './context/CreatorContext';

import Welcome from './pages/Welcome';
import CreateAccount from './pages/CreateAccount';
import Login from './pages/Login';
import InterestSelection from './pages/InterestSelection';

import AppShell from './components/layout/AppShell';
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import PostDetail from './pages/PostDetail';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Vault from './pages/Vault';
import VaultUpload from './pages/VaultUpload';
import CreatorApply from './pages/CreatorApply';
import ChatRoom from './pages/ChatRoom';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCreators from './pages/admin/AdminCreators';
import AdminReports from './pages/admin/AdminReports';

export default function App() {
  return (
    <AppProvider>
      <CreatorProvider>
      <BrowserRouter>
        <Routes>
          {/* Onboarding flow */}
          <Route path="/" element={<Welcome />} />
          <Route path="/create" element={<CreateAccount />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding/interests" element={<InterestSelection />} />

          {/* Main app — guarded inside AppShell */}
          <Route element={<AppShell />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/vault/new" element={<VaultUpload />} />
            <Route path="/creator/apply" element={<CreatorApply />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/profile/:handle" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:id" element={<ChatRoom />} />

            {/* Admin dashboard — guarded again inside AdminLayout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="creators" element={<AdminCreators />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </CreatorProvider>
    </AppProvider>
  );
}
