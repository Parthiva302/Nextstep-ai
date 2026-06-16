import React, { useState } from 'react';
import { Target, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full bg-slate-50 dark:bg-[#0B0F19]">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl transition-colors duration-300 p-8">
        
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-[#6366F1]/10 dark:bg-[#6366F1]/20 p-2.5 rounded-xl">
            <Target size={24} className="text-[#8B5CF6]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">NextStep AI</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h2>
        <p className="text-sm text-slate-500 mb-8">Enter your email and we'll send you a link to reset your password.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center flex flex-col items-center">
            <CheckCircle size={48} className="text-green-500 mb-4" />
            <h3 className="text-green-800 dark:text-green-400 font-bold mb-2">Check your email</h3>
            <p className="text-green-600 dark:text-green-500 text-sm">We've sent a password reset link to {email}</p>
            <Link to="/login" className="mt-6 text-[#6366F1] font-bold text-sm hover:underline">
              Return to Login
            </Link>
          </div>
        ) : (
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none transition-all dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 mt-6 flex justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              ) : "Send Reset Link"}
            </button>

            <div className="pt-4 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#6366F1] transition-colors font-medium">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
