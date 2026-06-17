# 🎯 NextStep AI - Production-Ready Career Readiness Platform

NextStep AI is an advanced, production-grade SaaS career readiness platform designed to evaluate candidate profiles, detect skill gaps, track coding analytics, generate automated learning roadmaps, and match students with job opportunities using AI.

---

## 🛠 Tech Stack

### Frontend
* **Core**: React 19 (Vite, TypeScript/JS, Fast Refresh)
* **Styling**: Tailwind CSS (sleek dark mode, premium glassmorphism aesthetics)
* **State Management**: Zustand (centralized global stores: `authStore`, `profileStore`, `analyticsStore`, `roadmapStore`, `careerStore` with session persistence)
* **Visualizations**: Recharts (for live coding analysis and skill spider charts)
* **Navigation**: React Router DOM (lazy loaded routes and route guards)
* **Exporting**: jsPDF (for generating verified student career reports)

### Backend
* **Framework**: FastAPI (high-performance Python web framework)
* **Asynchronous Client**: HTTPX (for fast external API scraping and queries)
* **ORM**: SQLAlchemy (database communication with Supabase PostgreSQL)
* **Deployment Server**: Uvicorn (ASGI server with reload capability)

### Database & Security
* **Authentication**: Supabase Auth (token-based session management)
* **Database**: Supabase PostgreSQL (hosted on AWS with connection pooling)
* **File Storage**: Supabase Storage Buckets (secure resume hosting)

---

## 🏗 Architecture

The platform follows a decoupled client-server architecture with background synchronization:

```mermaid
graph TD
    User([User / Browser])
    React[React Frontend (Vite)]
    FastAPI[FastAPI Backend]
    SupabaseDB[(Supabase PostgreSQL)]
    GitHub[GitHub API]
    LeetCode[LeetCode API / Scraper]
    OpenRouter[OpenRouter / Gemini AI]
    
    User -->|Interacts| React
    React -->|Direct Query / Real-time Sync| SupabaseDB
    React -->|API Requests| FastAPI
    
    FastAPI -->|DB Operations| SupabaseDB
    FastAPI -->|Analyze Github| GitHub
    FastAPI -->|Analyze LeetCode| LeetCode
    FastAPI -->|AI Insights & Roadmap| OpenRouter
```

---

## 🔄 Core Workflow

1. **User Onboarding**:
   * The user registers/logs in using Supabase Auth.
   * Completes a 6-step onboarding wizard to gather basic details, career goals, and skills.
2. **Profile Integrations & Resume Processing**:
   * Links GitHub and LeetCode accounts. The system fetches metrics, commits, stars, languages, and coding stats.
   * Uploads their resume to Supabase Storage. The Resume Analyzer extracts text and ranks the layout.
3. **Data Sync & Scoring Engine**:
   * Re-computes scores dynamically using a weighted formula:
     $$\text{Readiness Index} = (\text{Coding} \times 0.3) + (\text{Academic} \times 0.25) + (\text{Projects} \times 0.2) + (\text{Resume} \times 0.15) + (\text{Skills} \times 0.1)$$
   * Automatically seeds matching career profiles and maps missing skill gaps.
4. **Learning & Opportunities**:
   * Generates a step-by-step **Career GPS Roadmap** to bridge gaps.
   * Provides an **AI Career Mentor** chatbot for live resume advice and coding interview help.
   * Matches profiles with real-world job postings.

---

## 📈 Platform Features & Uses

* **Placement Readiness Score**: Live, interactive index showing candidate employability.
* **Career GPS Roadmap**: Visual stage-by-stage learning tracking (Foundation, Core Skills, Projects, Interview Prep, Placement Ready) that links directly to resource pages.
* **Resume Analyzer**: Instant feedback on resume strength and missing keywords.
* **Coding Analytics**: Detailed language breakdown and commit history tracking.
* **Mock Interview Simulator**: Real-time simulated questions to test technical knowledge.

---

## 🚀 Running the Project Locally

### 1. Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Activate venv & install dependencies:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Set environment variables in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/postgres
   OPENROUTER_API_KEY=your_key
   ```
4. Start the server:
   ```bash
   .\venv\Scripts\uvicorn.exe main:app --reload --port 8000
   ```

### 2. Frontend Setup
1. Navigate to `frontend/`:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `frontend/.env` variables.
4. Start dev server:
   ```bash
   npm run dev
   ```
