import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MentorChat from './pages/MentorChat';
import Roadmap from './pages/Roadmap';
import CodingAnalytics from './pages/CodingAnalytics';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Opportunities from './pages/Opportunities';
import RecruiterView from './pages/RecruiterView';
import Achievements from './pages/Achievements';
import SkillAnalysis from './pages/SkillAnalysis';
import CareerMatch from './pages/CareerMatch';
import Onboarding from './pages/Onboarding';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const location = useLocation();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // If user is not logged in or is on an auth page
  const isAuthPage = ['/login', '/register', '/forgot-password', '/'].includes(location.pathname);
  if (isAuthPage && !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white font-sans transition-colors duration-300">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // Logged in layout
  const isFullScreenRoute = location.pathname === '/onboarding';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white font-sans transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      {!isFullScreenRoute && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        {!isFullScreenRoute && (
          <div className="px-8">
            <TopHeader isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          </div>
        )}

        {/* Scrollable Page Content */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar ${!isFullScreenRoute ? 'px-8 pb-8' : ''}`}>
          <Routes>
            {/* Onboarding Route (Protected, does not require onboarding to be completed) */}
            <Route path="/onboarding" element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            } />

            {/* Dashboard & Other Protected Routes (require onboarding) */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/mentor" element={<ProtectedRoute><MentorChat /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><CodingAnalytics /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
            <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
            <Route path="/recruiter" element={<ProtectedRoute><RecruiterView /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><SkillAnalysis /></ProtectedRoute>} />
            <Route path="/careers" element={<ProtectedRoute><CareerMatch /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
