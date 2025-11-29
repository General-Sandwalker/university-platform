import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/users/Users';
import Profile from './pages/Profile';
import MessagesAdvanced from './pages/messages/MessagesAdvanced';
import { Schedule } from './pages/schedule/Schedule';
import { Semesters } from './pages/schedule/Semesters';
import Absences from './pages/absences/Absences';
import DepartmentsManagement from './pages/academic/DepartmentsManagement';
import SpecialtiesManagement from './pages/academic/SpecialtiesManagement';
import LevelsManagement from './pages/academic/LevelsManagement';
import GroupsManagement from './pages/academic/GroupsManagement';
import SubjectsManagement from './pages/academic/SubjectsManagement';
import RoomsManagement from './pages/academic/RoomsManagement';
import EventsAdvanced from './pages/events/EventsAdvanced';
import Notifications from './pages/notifications/Notifications';
import AnalyticsAdvanced from './pages/AnalyticsAdvanced';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/forgot-password"
        element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/reset-password"
        element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" replace />}
      />
      
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users/*" element={<Users />} />
                <Route path="/messages/*" element={<MessagesAdvanced />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/semesters" element={<Semesters />} />
                <Route path="/absences/*" element={<Absences />} />
                <Route path="/departments" element={<DepartmentsManagement />} />
                <Route path="/specialties" element={<SpecialtiesManagement />} />
                <Route path="/levels" element={<LevelsManagement />} />
                <Route path="/groups" element={<GroupsManagement />} />
                <Route path="/subjects" element={<SubjectsManagement />} />
                <Route path="/rooms" element={<RoomsManagement />} />
                <Route path="/events" element={<EventsAdvanced />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/analytics" element={<AnalyticsAdvanced />} />
              </Routes>
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
