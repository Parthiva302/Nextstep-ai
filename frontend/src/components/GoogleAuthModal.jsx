import React from 'react';
import { UserCircle2 } from 'lucide-react';

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="w-full max-w-[1040px] h-[600px] bg-[#1F1F1F] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-[#333]">
        
        {/* Header */}
        <div className="px-10 py-8 flex items-center gap-3">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-[#E3E3E3] font-medium text-lg tracking-wide">Sign in with Google</span>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row px-10">
          
          {/* Left Side */}
          <div className="w-full md:w-1/2 pr-8 pt-8">
            <h1 className="text-4xl font-normal text-[#E3E3E3] mb-4">Choose an account</h1>
            <p className="text-[#A8C7FA] text-[15px]">
              to continue to NextStep AI
            </p>
          </div>

          {/* Right Side - Account List */}
          <div className="w-full md:w-1/2 pt-8 flex flex-col h-full border-l border-[#444] pl-10">
            <div className="flex-1 space-y-1">
              
              {/* Account 1 */}
              <button 
                onClick={onSuccess}
                className="w-full text-left p-4 hover:bg-[#333] rounded-2xl transition-colors flex items-center gap-4 group border border-transparent"
              >
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-medium flex-shrink-0">
                  A
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[#E3E3E3] font-medium text-[15px] truncate">Abhinav Vidadala</p>
                  <p className="text-[#8E8E8E] text-[13px] truncate group-hover:text-[#C4C7C5] transition-colors">abhinav@example.com</p>
                </div>
              </button>

              <div className="h-[1px] bg-[#444] w-[90%] mx-auto my-2"></div>

              {/* Account 2 */}
              <button 
                onClick={onSuccess}
                className="w-full text-left p-4 hover:bg-[#333] rounded-2xl transition-colors flex items-center gap-4 group border border-transparent"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-medium flex-shrink-0">
                  P
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[#E3E3E3] font-medium text-[15px] truncate">Parthiva Aneesh</p>
                  <p className="text-[#8E8E8E] text-[13px] truncate group-hover:text-[#C4C7C5] transition-colors">parthivaaneesh@gmail.com</p>
                </div>
              </button>

              <div className="h-[1px] bg-[#444] w-[90%] mx-auto my-2"></div>

              {/* Use another account */}
              <button 
                onClick={onSuccess}
                className="w-full text-left p-4 hover:bg-[#333] rounded-2xl transition-colors flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCircle2 size={24} className="text-[#E3E3E3]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#E3E3E3] font-medium text-[14px]">Use another account</p>
                </div>
              </button>
            </div>

            {/* Footer Text */}
            <div className="mt-auto pb-10 pt-6">
              <p className="text-[#8E8E8E] text-[13px] leading-relaxed">
                To continue, Google will share your name, email address, and language preference with NextStep AI. Before using this app, you can review NextStep AI's <br/>
                <a href="#" className="text-[#A8C7FA] hover:underline font-medium">Privacy Policy</a> and <a href="#" className="text-[#A8C7FA] hover:underline font-medium">Terms of Service</a>.
              </p>
            </div>
          </div>
        </div>

      </div>
      
      {/* Invisible overlay for closing if clicked outside */}
      <div className="fixed inset-0 z-[-1]" onClick={onClose}></div>
    </div>
  );
}
