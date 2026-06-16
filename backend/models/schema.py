from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from models.database import Base

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    github_username = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profiles = relationship("StudentProfile", back_populates="student")
    scores = relationship("ReadinessScore", back_populates="student")
    skill_gaps = relationship("SkillGap", back_populates="student")
    roadmaps = relationship("LearningRoadmap", back_populates="student")
    messages = relationship("ChatMessage", back_populates="student")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    cgpa = Column(Float)
    coding_score = Column(Integer)
    projects_count = Column(Integer)
    skills_json = Column(JSON)
    projects_json = Column(JSON)
    career_goal = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    student = relationship("Student", back_populates="profiles")

class ReadinessScore(Base):
    __tablename__ = "readiness_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    total_score = Column(Integer)
    academic_score = Column(Integer)
    coding_score = Column(Integer)
    project_score = Column(Integer)
    skill_score = Column(Integer)
    resume_score = Column(Integer)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("Student", back_populates="scores")

class SkillGap(Base):
    __tablename__ = "skill_gaps"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    skill_name = Column(String)
    priority = Column(Integer) # 1-3
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("Student", back_populates="skill_gaps")

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    career_goal = Column(String)
    roadmap_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("Student", back_populates="roadmaps")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    role = Column(String) # 'user' or 'assistant'
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("Student", back_populates="messages")
