import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import Tasks from './pages/Tasks';
import Appointments from './pages/Appointments';
import Medicines from './pages/Medicines';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute requireVerified>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="budget" element={<Budget />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="medicines" element={<Medicines />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
