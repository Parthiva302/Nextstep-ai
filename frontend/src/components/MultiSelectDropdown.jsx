import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check, Plus } from 'lucide-react';
import { ALL_SKILLS, SKILL_CATEGORIES } from '../constants/skills';

export default function MultiSelectDropdown({ 
  selected = [], 
  onChange, 
  placeholder = "Search skills...",
  maxSelection = 20
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const dropdownRef = useRef(null);

  // Filter skills based on search query and active category
  const filteredSkills = ALL_SKILLS.filter(item => {
    const matchesSearch = item.skill.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (skillName) => {
    if (selected.includes(skillName)) {
      onChange(selected.filter(s => s !== skillName));
    } else {
      if (selected.length < maxSelection) {
        onChange([...selected, skillName]);
      }
    }
    setQuery(''); // Clear search on select to easily see chips, but keep open
  };

  const handleRemove = (skillName, e) => {
    e.stopPropagation();
    onChange(selected.filter(s => s !== skillName));
  };

  const handleAddCustom = () => {
    if (query.trim() && !selected.includes(query.trim()) && selected.length < maxSelection) {
      onChange([...selected, query.trim()]);
      setQuery('');
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selected Chips & Input Area */}
      <div 
        className={`min-h-[50px] p-2 bg-slate-50 dark:bg-[#0B0F19] border rounded-xl transition-all flex flex-wrap items-center gap-2 cursor-text ${isOpen ? 'border-[#6366F1] ring-1 ring-[#6366F1]' : 'border-slate-200 dark:border-slate-700'}`}
        onClick={() => setIsOpen(true)}
      >
        {selected.map(skill => (
          <span 
            key={skill} 
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#6366F1]/10 text-[#6366F1] dark:text-[#818CF8] rounded-lg text-sm font-medium border border-[#6366F1]/20 animate-in fade-in zoom-in duration-200"
          >
            {skill}
            <button 
              onClick={(e) => handleRemove(skill, e)} 
              className="hover:bg-[#6366F1]/20 rounded-full p-0.5 transition-colors"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        
        <div className="flex-1 min-w-[120px] flex items-center gap-2 px-2">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            className="w-full bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder={selected.length === 0 ? placeholder : "Add more..."}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                e.preventDefault();
                // If exact match found in filtered, select it. Else add custom.
                const exactMatch = filteredSkills.find(s => s.skill.toLowerCase() === query.toLowerCase());
                if (exactMatch) {
                  handleSelect(exactMatch.skill);
                } else {
                  handleAddCustom();
                }
              }
            }}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Categories Tab */}
          <div className="flex overflow-x-auto p-2 border-b border-slate-100 dark:border-slate-800 gap-1 custom-scrollbar">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${activeCategory === 'All' ? 'bg-[#6366F1] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              All Skills
            </button>
            {Object.keys(SKILL_CATEGORIES).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-[#6366F1] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Skills List */}
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {filteredSkills.map(item => {
                  const isSelected = selected.includes(item.skill);
                  return (
                    <button
                      key={item.skill}
                      onClick={() => handleSelect(item.skill)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <span className="truncate">{item.skill}</span>
                      {isSelected && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No matching skills found.</p>
                {query.trim() && !selected.includes(query.trim()) && (
                  <button 
                    onClick={handleAddCustom}
                    className="inline-flex items-center gap-2 text-sm text-[#6366F1] font-medium hover:text-[#4F46E5] bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Plus size={16} /> Add "{query.trim()}" as custom skill
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
