import { NavLink } from 'react-router-dom';
import { Target, LayoutDashboard, BrainCircuit, Map, Code2, LineChart, Briefcase, FileText, Award, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { signOut } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'AI Mentor', icon: BrainCircuit, path: '/mentor' },
    { name: 'Roadmap', icon: Map, path: '/roadmap' },
    { name: 'Skill Analysis', icon: LineChart, path: '/skills' },
    { name: 'Career Match', icon: Target, path: '/careers' },
    { name: 'Coding Analytics', icon: Code2, path: '/analytics' },
    { name: 'Opportunities', icon: Briefcase, path: '/opportunities' },
    { name: 'Resume Analyzer', icon: FileText, path: '/resume' },
    { name: 'Achievements', icon: Award, path: '/achievements' },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="w-64 h-screen bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 transition-colors duration-300">
      {/* Brand */}
      <div className="p-6 flex items-center gap-2 mb-2">
        <div className="bg-[#6366F1]/10 dark:bg-[#6366F1]/20 p-1.5 rounded-lg">
          <Target size={20} className="text-[#8B5CF6]" />
        </div>
        <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">NextStep AI</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-[#6366F1]/10 text-[#8B5CF6] font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-all duration-200 w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
