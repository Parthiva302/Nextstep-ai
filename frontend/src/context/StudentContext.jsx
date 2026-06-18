import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const StudentContext = createContext();
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

export const StudentProvider = ({ children }) => {
  // Student profile data
  const [studentData, setStudentData] = useState(null);
  
  // Placement score
  const [placementScore, setPlacementScore] = useState(null);
  
  // Skill gaps
  const [skillGaps, setSkillGaps] = useState([]);
  
  // Resume analysis
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  
  // Learning roadmap
  const [roadmap, setRoadmap] = useState(null);
  
  // Chat history
  const [chatHistory, setChatHistory] = useState([]);
  
  // Career match
  const [careerMatch, setCareerMatch] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    student: false,
    score: false,
    resume: false,
    roadmap: false,
    mentor: false
  });
  
  // Error states
  const [errors, setErrors] = useState({});

  // Update loading state
  const setLoadingState = useCallback((key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update error state
  const setError = useCallback((key, message) => {
    setErrors(prev => ({ ...prev, [key]: message }));
    // Clear error after 5 seconds
    setTimeout(() => {
      setErrors(prev => ({ ...prev, [key]: null }));
    }, 5000);
  }, []);

  // Fetch placement score
  const fetchPlacementScore = useCallback(async (studentId) => {
    try {
      setLoadingState('score', true);
      const [scoreRes, gapsRes, matchRes] = await Promise.allSettled([
        axios.get(`${API_URL}/score/${studentId}`),
        axios.get(`${API_URL}/skill-gaps/${studentId}`),
        axios.get(`${API_URL}/career-match/${studentId}`)
      ]);
      
      const isNotFound = [scoreRes, gapsRes].some(
        r => r.status === 'rejected' && r.reason?.response?.status === 404
      );
      
      if (isNotFound) {
        throw new Error('404_NOT_FOUND');
      }

      if (scoreRes.status === 'fulfilled') setPlacementScore(scoreRes.value.data);
      if (gapsRes.status === 'fulfilled') setSkillGaps(gapsRes.value.data);
      if (matchRes.status === 'fulfilled') setCareerMatch(matchRes.value.data);
      
      setLoadingState('score', false);
      
      // Fetch roadmap asynchronously without blocking the main dashboard
      fetchRoadmapBackground(studentId);
      
      return { scoreData: scoreRes.value?.data, skillGaps: gapsRes.value?.data };
    } catch (error) {
      setLoadingState('score', false);
      setError('score', error.response?.data?.detail || "Failed to load dashboard data");
      throw error;
    }
  }, [setLoadingState, setError]);

  const fetchRoadmapBackground = async (studentId) => {
    try {
      setLoadingState('roadmap', true);
      const roadmapRes = await axios.get(`${API_URL}/roadmap/${studentId}`);
      setRoadmap(roadmapRes.data);
      saveToLocalStorage(); // Save since it might arrive late
    } catch (error) {
      console.error("Failed to load roadmap:", error);
    } finally {
      setLoadingState('roadmap', false);
    }
  };

  // Analyze resume
  const analyzeResume = useCallback(async (studentId, file) => {
    try {
      setLoadingState('resume', true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/analyze?student_id=${studentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = response.data;
      if (data && data.score !== undefined) {
        setResumeAnalysis(data);
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Analysis returned no data. Please try again.');
      }
      
      setLoadingState('resume', false);
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Failed to analyze resume';
      setError('resume', msg);
      setLoadingState('resume', false);
      throw new Error(msg);
    }
  }, [setLoadingState, setError]);

  // Chat with mentor
  const chatWithMentor = useCallback(async (studentId, question) => {
    try {
      setLoadingState('mentor', true);
      
      // Optimistically add user message
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: question }
      ]);
      
      const response = await axios.post(`${API_URL}/mentor/chat`, {
        student_id: studentId || 1,
        question: question
      });

      const data = response.data;
      const reply = data?.response || data?.message;
      
      if (!reply) throw new Error('Empty response from AI');
      
      // Add assistant response
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: reply, model: data.metadata?.model_used || 'Claude 3.5 Sonnet' }
      ]);
      
      setLoadingState('mentor', false);
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Failed to get response';
      setError('mentor', msg);
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ Sorry, I encountered an issue: ${msg}. Please try again in a moment.` }
      ]);
      setLoadingState('mentor', false);
      throw error;
    }
  }, [setLoadingState, setError]);

  // Clear all data
  const clearAllData = useCallback(() => {
    setStudentData(null);
    setPlacementScore(null);
    setSkillGaps([]);
    setResumeAnalysis(null);
    setRoadmap(null);
    setChatHistory([]);
    setErrors({});
  }, []);

  // Save data to localStorage (persistence)
  const saveToLocalStorage = useCallback(() => {
    const dataToSave = {
      studentData,
      placementScore,
      skillGaps,
      resumeAnalysis,
      roadmap,
      chatHistory,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('nextstep_ai_data', JSON.stringify(dataToSave));
  }, [studentData, placementScore, skillGaps, resumeAnalysis, roadmap, chatHistory]);

  // Load data from localStorage
  const loadFromLocalStorage = useCallback(() => {
    const saved = localStorage.getItem('nextstep_ai_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.studentData) setStudentData(data.studentData);
        if (data.placementScore) setPlacementScore(data.placementScore);
        if (data.skillGaps) setSkillGaps(data.skillGaps);
        if (data.resumeAnalysis) setResumeAnalysis(data.resumeAnalysis);
        if (data.roadmap) setRoadmap(data.roadmap);
        if (data.chatHistory && data.chatHistory.length > 0) setChatHistory(data.chatHistory);
        return true;
      } catch (error) {
        console.error('Failed to load from localStorage', error);
        return false;
      }
    }
    return false;
  }, []);

  const value = {
    studentData,
    placementScore,
    skillGaps,
    resumeAnalysis,
    roadmap,
    chatHistory,
    careerMatch,
    loading,
    errors,
    fetchPlacementScore,
    analyzeResume,
    chatWithMentor,
    clearAllData,
    saveToLocalStorage,
    loadFromLocalStorage,
    setStudentData,
    setPlacementScore,
    setSkillGaps,
    setResumeAnalysis,
    setRoadmap,
    setChatHistory,
    setError
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within StudentProvider');
  }
  return context;
};
