import React, { useState } from 'react';
import { Target, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { signIn, profile, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user && !authLoading) {
      navigate(profile?.onboarding_completed ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [user, profile, authLoading]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await signIn(formData.email, formData.password);
      if (authError) throw authError;
      // Navigation handled by useEffect above watching user/profile state
    } catch (err) {
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 w-full h-full my-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-[#111827] rounded-3xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl transition-colors duration-300 mx-auto mt-12 md:mt-24">
        
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-[#6366F1]/10 dark:bg-[#6366F1]/20 p-2.5 rounded-xl">
              <Target size={24} className="text-[#8B5CF6]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">NextStep AI</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">Please enter your details to sign in.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
               <div className="shrink-0 mt-0.5">⚠️</div>
               <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none transition-all dark:text-white" 
                  placeholder="you@example.com" 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#6366F1] hover:text-[#4F46E5] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input 
                  type="password" 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none transition-all dark:text-white" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 mt-8 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#6366F1] hover:text-[#4F46E5] font-bold hover:underline transition-all">
              Create Account
            </Link>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="hidden md:flex w-1/2 bg-slate-50 dark:bg-[#0B0F19] border-l border-slate-200 dark:border-slate-800 p-10 flex-col justify-center items-center text-center relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#6366F1] opacity-5 rounded-full blur-3xl"></div>
           <div className="relative z-10 w-full max-w-sm">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                   <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                     <Target size={16} />
                   </div>
                   <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Career GPS</h4>
                   <p className="text-xs text-slate-500">Step-by-step roadmap to land your dream tech role.</p>
                </div>
                <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left mt-8">
                   <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                     <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                   </div>
                   <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">AI Mentor</h4>
                   <p className="text-xs text-slate-500">24/7 personalized guidance on coding & interviews.</p>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
