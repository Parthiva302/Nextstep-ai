import React, { useState } from 'react';
import { Target, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName
      });

      if (authError) throw authError;

      if (authData?.user) {
        if (authData?.session) {
          navigate('/onboarding');
        } else {
          // Auto-signin fallback since trigger has confirmed the user
          try {
            const { error: logErr } = await signIn(formData.email, formData.password);
            if (logErr) throw logErr;
            navigate('/onboarding');
          } catch {
            setError("Account created! Please sign in with your credentials.");
            setLoading(false);
          }
        }
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full bg-slate-50 dark:bg-[#0B0F19]">
      <div className="w-full max-w-5xl bg-white dark:bg-[#111827] rounded-3xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl transition-colors duration-300">
        
        {/* Left Side - Brand & Copy */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Target size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">NextStep AI</span>
            </div>
            
            <h1 className="text-4xl font-bold leading-tight mb-4 text-white drop-shadow-sm">
              Your career,<br />supercharged.
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-md">
              Join thousands of students building their digital profile, mastering skills, and landing their dream jobs.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
            <p className="text-white/90 font-medium text-sm">
              "NextStep AI completely transformed my placement prep. The roadmap and mentor are game-changers."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                JD
              </div>
              <div>
                <p className="text-sm font-bold">John Doe</p>
                <p className="text-xs text-white/70">Placed at Google</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-10 flex flex-col justify-center bg-white dark:bg-[#111827]">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Create Account</h2>
            <p className="text-slate-500 mb-8 font-medium">Start your journey to tech success.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
                <div className="shrink-0 mt-0.5">⚠️</div>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-11 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none transition-all dark:text-white" 
                    placeholder="John Doe" 
                  />
                </div>
              </div>

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
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none transition-all dark:text-white" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    required
                    minLength={8}
                    value={formData.confirmPassword}
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
                  <>Create Account <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#6366F1] hover:text-[#4F46E5] font-bold hover:underline transition-all">
                Sign In Instead
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
