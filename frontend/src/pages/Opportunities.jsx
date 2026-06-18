import React, { useState } from 'react';
import { ExternalLink, Briefcase, Code, Award, Users, Map, Heart, CheckCircle2, Check } from 'lucide-react';

export default function Opportunities() {
  const [activeTab, setActiveTab] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [addedRoadmaps, setAddedRoadmaps] = useState([]);

  const opportunities = [
    {
      id: 1,
      title: 'Google Summer of Code',
      category: 'Open Source Programs',
      deadline: 'Jan 15, 2027',
      match_percentage: 95,
      required_skills: ['Python', 'Git', 'Problem Solving'],
      benefits: ['Stipend', 'Mentorship', 'Global Network'],
      icon: <Code className="text-[#3B82F6]" size={24} />,
      iconBg: 'bg-[#3B82F6]/10',
      link: 'https://summerofcode.withgoogle.com/'
    },
    {
      id: 2,
      title: 'AWS Cloud Practitioner Exam',
      category: 'Certifications',
      deadline: 'Flexible',
      match_percentage: 80,
      required_skills: ['Cloud Computing', 'AWS Services', 'Security'],
      benefits: ['Industry Recognition', 'Resume Boost'],
      icon: <Award className="text-[#8B5CF6]" size={24} />,
      iconBg: 'bg-[#8B5CF6]/10',
      link: 'https://aws.amazon.com/certification/certified-cloud-practitioner/'
    },
    {
      id: 3,
      title: 'Flipkart Grid 8.0',
      category: 'Hackathons',
      deadline: 'Aug 24, 2026',
      match_percentage: 75,
      required_skills: ['Algorithms', 'System Design', 'React'],
      benefits: ['Cash Prize', 'PPI Opportunity'],
      icon: <Code className="text-[#F59E0B]" size={24} />,
      iconBg: 'bg-[#F59E0B]/10',
      link: 'https://unstop.com/hackathons/flipkart-grid-60-flipkart-1025585'
    },
    {
      id: 4,
      title: 'Microsoft SDE Intern',
      category: 'Internships',
      deadline: 'Nov 30, 2026',
      match_percentage: 88,
      required_skills: ['DSA', 'System Design', 'C++'],
      benefits: ['High Stipend', 'Pre-Placement Offer', 'Brand'],
      icon: <Briefcase className="text-[#10B981]" size={24} />,
      iconBg: 'bg-[#10B981]/10',
      link: 'https://careers.microsoft.com/'
    },
    {
      id: 5,
      title: 'ICPC Regionals',
      category: 'Competitions',
      deadline: 'Oct 10, 2026',
      match_percentage: 60,
      required_skills: ['Advanced DSA', 'Math', 'C++'],
      benefits: ['Global Ranking', 'Top Tech Recognition'],
      icon: <Users className="text-[#EF4444]" size={24} />,
      iconBg: 'bg-[#EF4444]/10',
      link: 'https://icpc.global/'
    }
  ];

  const handleFavoriteToggle = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const handleRoadmapToggle = (id, title) => {
    const isAdded = addedRoadmaps.includes(id);
    if (isAdded) {
      setAddedRoadmaps(prev => prev.filter(roadId => roadId !== id));
    } else {
      setAddedRoadmaps(prev => [...prev, id]);
      alert(`🎉 "${title}" has been added to your Learning Roadmap target benchmarks!`);
    }
  };

  const handleOpenLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredOpportunities = activeTab === 'All' 
    ? opportunities 
    : opportunities.filter(o => o.category === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Opportunity Engine</h1>
          <p className="text-sm text-slate-500 mt-1">AI-curated opportunities perfectly matched to your skill profile.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto custom-scrollbar pb-2 mb-6 gap-2">
          {['All', 'Hackathons', 'Internships', 'Open Source Programs', 'Certifications', 'Competitions'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors border ${activeTab === tab ? 'bg-[#6366F1] text-white border-[#6366F1]' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0B0F19]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-6">
          {filteredOpportunities.map(opp => {
            const isFavorited = favorites.includes(opp.id);
            const isAdded = addedRoadmaps.includes(opp.id);
            
            return (
              <div key={opp.id} className="flex flex-col xl:flex-row xl:items-center justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#6366F1] dark:hover:border-[#6366F1] transition-all group bg-white dark:bg-[#111827]">
                
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${opp.iconBg}`}>
                    {opp.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#6366F1] transition-colors">{opp.title}</h3>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium">{opp.category}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                       <div>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Required Skills</p>
                         <div className="flex flex-wrap gap-1.5">
                           {opp.required_skills.map((skill, i) => (
                             <span key={i} className="text-xs bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full font-medium">{skill}</span>
                           ))}
                         </div>
                       </div>
                       <div>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Benefits</p>
                         <div className="flex flex-wrap gap-2">
                           {opp.benefits.map((ben, i) => (
                             <span key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1"><CheckCircle2 size={12} className="text-[#3B82F6]"/> {ben}</span>
                           ))}
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 xl:mt-0 xl:ml-6 flex flex-col items-start xl:items-end gap-4 min-w-[200px]">
                  <div className="flex flex-col items-start xl:items-end">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Match Score</span>
                     <div className="flex items-end gap-1">
                       <span className={`text-2xl font-bold ${opp.match_percentage >= 80 ? 'text-[#10B981]' : opp.match_percentage >= 60 ? 'text-[#F59E0B]' : 'text-rose-500'}`}>{opp.match_percentage}%</span>
                     </div>
                     <span className="text-xs text-slate-500 font-medium mt-1">Deadline: {opp.deadline}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                     <button 
                       onClick={() => handleRoadmapToggle(opp.id, opp.title)}
                       className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${isAdded ? 'bg-[#10B981] hover:bg-[#059669] text-white border-[#10B981]' : 'bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#6366F1] border-transparent'}`}
                     >
                       {isAdded ? (
                         <><Check size={16} /> Added</>
                       ) : (
                         <><Map size={16} /> Add to Roadmap</>
                       )}
                     </button>
                     <button 
                       onClick={() => handleFavoriteToggle(opp.id)}
                       className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors border ${isFavorited ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-transparent'}`}
                     >
                       <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
                     </button>
                     <button 
                       onClick={() => handleOpenLink(opp.link)}
                       className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 w-10 h-10 rounded-xl transition-colors border border-transparent"
                     >
                       <ExternalLink size={16} />
                     </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
