import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import RequireRole from './components/common/RequireRole.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ReportIssue from './pages/ReportIssue.jsx';
import IssuesPage from './pages/IssuesPage.jsx';
import IssueDetails from './pages/IssueDetails.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminCategories from './pages/AdminCategories.jsx';
import AdminTeams from './pages/AdminTeams.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

const ADMIN = ['admin'];
const STAFF = ['it_support', 'maintenance'];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="report" element={<ReportIssue />} />
        <Route path="my-reports" element={<IssuesPage key="mine" mode="mine" />} />
        <Route
          path="assigned"
          element={
            <RequireRole roles={STAFF}>
              <IssuesPage key="assigned" mode="assigned" />
            </RequireRole>
          }
        />
        <Route path="issues" element={<IssuesPage key="authorized" mode="authorized" />} />
        <Route path="issues/:id" element={<IssueDetails />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="users" element={<RequireRole roles={ADMIN}><AdminUsers /></RequireRole>} />
        <Route path="categories" element={<RequireRole roles={ADMIN}><AdminCategories /></RequireRole>} />
        <Route path="teams" element={<RequireRole roles={ADMIN}><AdminTeams /></RequireRole>} />
        <Route path="analytics" element={<RequireRole roles={ADMIN}><Analytics /></RequireRole>} />
        <Route path="settings" element={<RequireRole roles={ADMIN}><Settings /></RequireRole>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
