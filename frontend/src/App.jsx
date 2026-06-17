import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';

// Lazy loading all routes to implement code splitting
const Register = React.lazy(() => import('./pages/Register'));
const Login = React.lazy(() => import('./pages/Login'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const MentorChat = React.lazy(() => import('./pages/MentorChat'));
const Roadmap = React.lazy(() => import('./pages/Roadmap'));
const CodingAnalytics = React.lazy(() => import('./pages/CodingAnalytics'));
const ResumeAnalyzer = React.lazy(() => import('./pages/ResumeAnalyzer'));
const Opportunities = React.lazy(() => import('./pages/Opportunities'));
const RecruiterView = React.lazy(() => import('./pages/RecruiterView'));
const Achievements = React.lazy(() => import('./pages/Achievements'));
const SkillAnalysis = React.lazy(() => import('./pages/SkillAnalysis'));
const CareerMatch = React.lazy(() => import('./pages/CareerMatch'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isPublicRoute = location.pathname.startsWith('/public/');

  // If user is not logged in and not on a public route, redirect/restrict to auth pages
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white font-sans transition-colors duration-300">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }

  // Guest visitor accessing public candidate page
  if (!user && isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white font-sans transition-colors duration-300 overflow-y-auto">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/public/:userId" element={<RecruiterView isPublic={true} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }

  // Logged-in user trying to visit auth pages → redirect to dashboard
  if (isAuthPage) {
    return <Navigate to="/dashboard" replace />;
  }

  // Logged in layout - hide sidebar and header for onboarding and public sharing views
  const isFullScreenRoute = location.pathname === '/onboarding' || isPublicRoute;

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
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/public/:userId" element={<RecruiterView isPublic={true} />} />
                <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                <Route path="/skills" element={<ProtectedRoute><SkillAnalysis /></ProtectedRoute>} />
                <Route path="/careers" element={<ProtectedRoute><CareerMatch /></ProtectedRoute>} />
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
