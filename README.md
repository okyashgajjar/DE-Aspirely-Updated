# Aspirely 🚀

**Aspirely** is a high-performance, AI-driven career dashboard designed to bridge the gap between your current skills and your dream job. It provides real-time market intelligence, personalized job matching, and a state-of-the-art mock interview simulator.

## 🌟 Features

- **Algorithmic Job Matching**: Precision role identification based on your skills, experience, and location.
- **Market Intelligence**: Real-time salary trends, regional vacancy demand, and skill-gap analysis powered by Adzuna.
- **AI Behavioral Simulator**: Dynamic mock interviews with real-time voice/text interaction and comprehensive performance evaluation.
- **Skill Tracking**: Visual analytics of your career growth and learning trajectory.
- **Course Recommendations**: Targeted learning paths to close identified skill gaps.

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 16 (Turbopack)**: High-speed, edge-ready React framework.
- **Tailwind CSS**: Modern utility-first styling for a premium UI.
- **Recharts**: Dynamic, responsive data visualization.
- **Lucide React**: Clean, consistent iconography.

### **Backend & Data**
- **Drizzle ORM**: Type-safe, high-performance database layer optimized for the Edge Runtime.
- **SQLite (LibSQL)**: Lightweight, local-first data persistence with WASM/JS drivers.
- **OpenRouter (Gemini 2.0 Flash)**: Powering advanced AI interview logic and career advisory.
- **External APIs**: 
  - **Adzuna**: Live job market search and global salary stats.
  - **YouTube Data API**: Context-aware course discovery.

---

## 🧠 Backend Logic

### **1. Edge-Safe Database (Drizzle + LibSQL)**
Unlike traditional Node.js apps that rely on the `fs` module, Aspirely uses a **LibSQL WASM client**. This allows the entire application—including database queries—to run on **Next.js Edge Runtime**, ensuring global low latency and maximum performance.

### **2. AI Interview Lifecycle**
The mock interview engine is a recursive AI loop:
- **Start**: Generates a tailored first question based on the user's target role.
- **Answer**: Processes user input, updates the internal transcript, and generates the next logical question.
- **Evaluate**: Performs a deep-dive analysis of the total transcript to provide an objective score, identify strengths, and pinpoint improvement vectors.

### **3. Market Data Fallback**
To ensure a consistent experience across all regions, the Analytics engine includes a **Synthetic Fallback Logic**. When live historical data is limited for specific regions (like India), the system generates data-driven benchmarks to safely populate career trajectory and salary distribution charts.

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file with your API keys:
   - `OPENROUTER_API_KEY`
   - `ADZUNA_APP_ID` & `ADZUNA_API_KEY`
   - `YOUTUBE_DATA_API`
   - `NEXTAUTH_SECRET` & `GOOGLE_AUTH_CLIENT_ID`

3. **Database Setup**:
   ```bash
   npx drizzle-kit push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📜 Project Structure

- `db/`: Drizzle schema and database client.
- `app/api/`: Edge-optimized serverless routes for Jobs, Analytics, and AI.
- `components/`: Modular building blocks (Charts, Interview UI, Layout).
- `lib/`: Core utilities for authentication, AI, and external services.

---

Built with ❤️ by [Yash Gajjar]
