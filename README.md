# 🚀 NextStep AI

> **Your Next Step, Powered by AI**

NextStep AI is an AI-powered Career Intelligence Platform that helps students evaluate their placement readiness, analyze coding profiles, identify skill gaps, generate personalized learning roadmaps, optimize resumes, and discover relevant opportunities.

The platform combines Resume Analysis, GitHub Analytics, LeetCode Insights, AI Mentorship, Career Matching, and Opportunity Recommendations into a single career growth ecosystem.

---

# ✨ Features

## 📊 Placement Readiness Score

Calculate a comprehensive readiness score using:

* Coding Performance (30%)
* Academics (25%)
* Projects (20%)
* Resume Quality (15%)
* Skills & Certifications (10%)

Provides actionable insights to improve employability.

---

## 🤖 AI Career Mentor

AI-powered mentor that helps with:

* Resume improvements
* Interview preparation
* DSA guidance
* Career planning
* Project suggestions
* Learning recommendations

Powered by OpenRouter AI.

---

## 🛣 Career GPS Roadmap

Personalized learning roadmap that guides students through:

1. Foundation
2. Core Skills
3. Projects
4. Interview Preparation
5. Placement Ready

Each stage includes resources, milestones, and progress tracking.

---

## 📄 Resume Analyzer

Upload your resume and receive:

* ATS Score
* Missing Keywords
* Resume Strength Analysis
* Improvement Suggestions
* Skill Extraction

---

## 💻 Coding Intelligence Dashboard

Analyze coding profiles through:

### GitHub Analytics

* Repository Count
* Stars
* Followers
* Commit Activity
* Language Distribution

### LeetCode Analytics

* Problems Solved
* Difficulty Breakdown
* Ranking Insights
* Consistency Tracking

---

## 🎯 Career Match Engine

AI-generated career recommendations:

* AI Engineer
* Software Engineer
* Data Analyst
* DevOps Engineer
* Cloud Engineer
* Cybersecurity Engineer

Includes:

* Match Percentage
* Missing Skills
* Salary Range
* Demand Indicator

---

## 🌟 Opportunity Engine

Discover:

* Hackathons
* Internships
* Open Source Programs
* Certifications
* Competitions

Matched based on profile and career goals.

---

## 🏆 Achievements & Badges

Gamified progress tracking through:

* Resume Upload Badge
* GitHub Connected Badge
* LeetCode Connected Badge
* Placement Ready Badge
* Career Explorer Badge

---

## 👨💼 Public Recruiter Profile

Generate a shareable recruiter-friendly profile containing:

* Skills
* Projects
* Coding Stats
* Resume Score
* Academic Details

Accessible via public URL.

---

# 🛠 Tech Stack

## Frontend

* React 19
* Vite
* Tailwind CSS
* Zustand
* React Router DOM
* Recharts
* jsPDF

## Backend

* FastAPI
* Python
* SQLAlchemy
* HTTPX
* Uvicorn

## Database & Authentication

* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage

## AI Services

* OpenRouter API
* Gemini Models
* AI Career Mentor
* Roadmap Generation

## Deployment

* Frontend: Vercel
* Backend: Render
* Database: Supabase

---

# 🏗 System Architecture

```text
User
 │
 ▼
React Frontend (Vercel)
 │
 ├── Supabase Auth
 │
 ├── Resume Upload
 │
 ▼
FastAPI Backend (Render)
 │
 ├── GitHub Analytics
 ├── LeetCode Analytics
 ├── Career Match Engine
 ├── Resume Analyzer
 ├── AI Mentor
 └── Roadmap Generator
 │
 ▼
Supabase PostgreSQL
 │
 ▼
OpenRouter AI Models
```

---

# 📂 Project Structure

```text
NextStep-AI/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── stores/
│   ├── services/
│   └── assets/
│
├── backend/
│   ├── routers/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   └── main.py
│
└── README.md
```

---

# ⚙️ Environment Variables

## Backend (.env)

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
OPENROUTER_API_KEY=
GITHUB_TOKEN=
```

## Frontend (.env)

```env
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

# 🚀 Running Locally

## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate
# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🌐 Deployment

## Backend (Render)

Build Command

```bash
pip install -r requirements.txt
```

Start Command

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## Frontend (Vercel)

Environment Variable

```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

Deploy directly from GitHub.

---

# 🎯 Future Enhancements

* AI Mock Interview Simulator
* Company-specific Resume Scoring
* LinkedIn Analytics
* Real-time Job Aggregation
* ATS Optimization Engine
* Placement Prediction Model
* Multi-Agent Career Advisor
* Mobile Application

---

# 👨💻 Developer

**Parthiva Aneesh**

B.Tech CSE (AI & Future Technologies)
SRM University AP

GitHub: https://github.com/Parthiva302

LinkedIn: https://linkedin.com/in/parthiva-aneesh

---

⭐ If you like this project, consider giving it a star on GitHub.
