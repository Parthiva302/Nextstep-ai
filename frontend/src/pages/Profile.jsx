import React, { useState } from 'react';
import { ShieldCheck, Mail, Phone, MapPin, Edit3, Award, FileText, Briefcase, Code, LogOut, GraduationCap, Target, Plus } from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { signOut, user, profile } = useAuth();
  const { studentData } = useStudent();
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Skills & Projects', 'Certifications & Coding', 'Resume'];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Info Card */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm transition-colors duration-300 lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex-shrink-0 border-4 border-white dark:border-[#0B0F19] overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{profile?.full_name || studentData?.name || "Student"}</h1>
                    <ShieldCheck className="text-blue-500" size={20} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">{profile?.career_goal || studentData?.career_goal || "Software Engineer"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
                    <Edit3 size={16} /> Edit Profile
                  </button>
                  <button onClick={handleLogout} className="bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 px-4 py-2 rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2"><Mail size={16} className="text-slate-400" /> {profile?.email || studentData?.email || "student@example.com"}</div>
                <div className="flex items-center gap-2"><Phone size={16} className="text-slate-400" /> {studentData?.phone || "Add Phone Number"}</div>
                <div className="flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> {studentData?.location || "Add Location"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Career Goal Card */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm transition-colors duration-300">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Target size={16} className="text-[#8B5CF6]" /> Target Career Goal
          </h3>
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">{profile?.career_goal || studentData?.career_goal || "Software Engineer"}</h2>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4">
               <div className="w-[60%] bg-[#8B5CF6] h-2 rounded-full"></div>
            </div>
            <p className="text-xs text-center text-slate-500 mt-2">60% matched based on current skills</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content based on Active Tab */}
      <div className="mt-6">
        
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
             <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <GraduationCap className="text-[#10B981]" /> College Information
               </h3>
               <div className="space-y-4">
                 <div>
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">University / College</p>
                   <p className="text-sm text-slate-900 dark:text-white font-medium">{profile?.college || studentData?.college || "Not specified"}</p>
                 </div>
                 <div>
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Branch / Major</p>
                   <p className="text-sm text-slate-900 dark:text-white font-medium">{profile?.branch || studentData?.branch || "Computer Science"}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Year of Study</p>
                     <p className="text-sm text-slate-900 dark:text-white font-medium">{studentData?.year || "3rd Year"}</p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">CGPA</p>
                     <p className="text-sm text-slate-900 dark:text-white font-medium">{studentData?.cgpa || "0.0"}</p>
                   </div>
                 </div>
               </div>
             </div>

             <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <Briefcase className="text-[#3B82F6]" /> Personal Details
               </h3>
               <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  <p>Profile setup completed on onboarding. Maintain your academic and personal details up to date for better AI recommendations.</p>
                  <button className="text-[#3B82F6] font-medium hover:underline text-sm mt-2 flex items-center gap-1">Update Details <Edit3 size={14} /></button>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'Skills & Projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Skills</h3>
                <button className="flex items-center gap-1 text-[#6366F1] text-sm font-medium hover:underline"><Plus size={16}/> Add Skill</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(studentData?.skills || ['React', 'Node.js', 'Python']).map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700">{skill}</span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Projects</h3>
                <button className="flex items-center gap-1 text-[#6366F1] text-sm font-medium hover:underline"><Plus size={16}/> Add Project</button>
              </div>
              <div className="space-y-4">
                {(studentData?.projects || ['E-Commerce Backend', 'Portfolio Site']).map((proj, i) => (
                   <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]">
                     <h4 className="font-bold text-slate-900 dark:text-white">{proj}</h4>
                     <p className="text-xs text-slate-500 mt-1">Full stack project built during hackathon.</p>
                     <div className="flex items-center gap-3 mt-3">
                       <span className="text-xs text-[#3B82F6] hover:underline cursor-pointer">GitHub Repo</span>
                       <span className="text-xs text-[#10B981] hover:underline cursor-pointer">Live Demo</span>
                     </div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Certifications & Coding' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Certifications</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0">
                    <Award className="text-[#8B5CF6]" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">AWS Cloud Practitioner</h4>
                    <p className="text-xs text-slate-500 mt-1">Amazon Web Services • Issued Dec 2024</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Coding Profiles</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Code className="text-slate-800 dark:text-slate-200" size={20} />
                    <span className="font-medium text-sm text-slate-700 dark:text-slate-300">GitHub</span>
                  </div>
                  <span className="text-sm font-medium text-[#6366F1] cursor-pointer">@abhinav-dev</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Code className="text-[#F59E0B]" size={20} />
                    <span className="font-medium text-sm text-slate-700 dark:text-slate-300">LeetCode</span>
                  </div>
                  <span className="text-sm font-medium text-[#6366F1] cursor-pointer">@abhinav_lc</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Resume' && (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm transition-colors duration-300 animate-in fade-in flex flex-col items-center justify-center min-h-[300px]">
             <FileText size={48} className="text-[#8B5CF6] mb-4" />
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Resume Information</h3>
             <p className="text-sm text-slate-500 text-center max-w-md mb-6">Your resume is securely stored and used by the AI Mentor and Opportunity Engine to personalize your experience.</p>
             
             <div className="flex gap-4">
               <button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
                  <FileText size={16} /> View Current Resume
               </button>
               <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
                  Upload New Resume
               </button>
             </div>
          </div>
        )}

      </div>

    </div>
  );
}
