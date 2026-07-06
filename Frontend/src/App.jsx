import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ChatDashboard from './pages/ChatDashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CallProvider } from './context/CallContext';
import IncomingCallModal from './components/IncomingCallModal';
import VideoCallModal from './components/VideoCallModal';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <CallProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={
              <ProtectedRoute>
                <ChatDashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
        <IncomingCallModal />
        <VideoCallModal />
      </CallProvider>
    </AuthProvider>
  );
}
