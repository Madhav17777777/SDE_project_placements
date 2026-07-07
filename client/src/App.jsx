import { Routes, Route } from 'react-router-dom';
import { ROUTES } from './constants/routes.js';

import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import SearchResults from './pages/SearchResults.jsx';
import StreamPage from './pages/StreamPage.jsx';
import VideoPage from './pages/VideoPage.jsx';
import ChannelPage from './pages/ChannelPage.jsx';
import NotFound from './pages/NotFound.jsx';

import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import VerifyEmail from './pages/auth/VerifyEmail.jsx';
import OAuthCallback from './pages/auth/OAuthCallback.jsx';

import ProfileSettings from './pages/user/ProfileSettings.jsx';
import Notifications from './pages/user/Notifications.jsx';
import WatchHistory from './pages/user/WatchHistory.jsx';
import Bookmarks from './pages/user/Bookmarks.jsx';

import Dashboard from './pages/streamer/Dashboard.jsx';
import StreamManager from './pages/streamer/StreamManager.jsx';
import UploadVideo from './pages/streamer/UploadVideo.jsx';
import ChannelSettings from './pages/streamer/ChannelSettings.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import ManageStreams from './pages/admin/ManageStreams.jsx';

function App() {
  return (
    <Routes>
      {/* Public, chrome'd pages */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.BROWSE} element={<BrowsePage />} />
        <Route path={ROUTES.SEARCH} element={<SearchResults />} />
        <Route path={ROUTES.STREAM()} element={<StreamPage />} />
        <Route path={ROUTES.VIDEO()} element={<VideoPage />} />
        <Route path={ROUTES.CHANNEL()} element={<ChannelPage />} />

        {/* Any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.PROFILE_SETTINGS} element={<ProfileSettings />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
          <Route path={ROUTES.WATCH_HISTORY} element={<WatchHistory />} />
          <Route path={ROUTES.BOOKMARKS} element={<Bookmarks />} />
        </Route>
      </Route>

      {/* Streamer/Admin dashboard, own chrome */}
      <Route element={<ProtectedRoute allowedRoles={['streamer', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.STREAMER_DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.STREAM_MANAGER} element={<StreamManager />} />
          <Route path={ROUTES.UPLOAD_VIDEO} element={<UploadVideo />} />
          <Route path={ROUTES.CHANNEL_SETTINGS} element={<ChannelSettings />} />
        </Route>
      </Route>

      {/* Admin only */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN_USERS} element={<ManageUsers />} />
          <Route path={ROUTES.ADMIN_STREAMS} element={<ManageStreams />} />
        </Route>
      </Route>

      {/* Auth pages, minimal chrome */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD()} element={<ResetPassword />} />
        <Route path={ROUTES.VERIFY_EMAIL()} element={<VerifyEmail />} />
        <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallback />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
