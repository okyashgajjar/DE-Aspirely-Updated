# Aspirely 🚀

**Aspirely** is a high-performance, AI-driven career navigation platform built to bridge the gap between your current skills and your dream job. Featuring a hyper-focused cinematic UI, it provides real-time market intelligence, NLP-powered job matching, and a state-of-the-art voice-enabled mock interview simulator.

---

## 🌟 Core Features & Innovations

- **Cinematic, Adaptive UI**: A premium, "glassmorphism" inspired design system with seamless **Light/Dark Mode** support, dynamic gradients, and advanced loading skeletons.
- **NLP-Powered Job Matching**: Cross-discipline precision matching algorithms that analyze your semantic skill signature (including technical, writing, and research skills) against global job markets.
- **AI Behavioral Simulator**: Dynamic mock interviews with real-time voice/text interaction, custom company targeting, and comprehensive performance evaluation via OpenRouter (Gemini).
- **Growth Analytics**: Cinematic data visualization for salary trends, regional vacancy demand, and skill-gap analysis (powered by Adzuna).
- **Smart Learning Paths**: Dynamically generated course recommendations (via YouTube Data API) designed to bridge specific skill gaps in record time.
- **Focus Mode Dashboard**: A distraction-free workspace that prioritizes your daily career missions.

---

## 🛠️ Tech Stack & Architecture

### **Frontend & UI**
- **Next.js 16 (App Router & Turbopack)**: High-speed, server-first React framework.
- **Tailwind CSS v4**: Modern utility-first styling for a premium, responsive UI.
- **next-themes**: Flawless, flicker-free dark mode implementation.
- **Recharts & Lucide React**: Dynamic data visualization and clean, consistent iconography.

### **Backend & Machine Learning**
- **Auth.js v5 (NextAuth Beta)**: Secure, edge-compatible authentication (Google OAuth, Credentials).
- **NLP Regression Pipelines**: Advanced text classification and processing logic for deep skill-to-job matching.
- **OpenRouter (Gemini 2.0 Flash)**: Powering the continuous AI interview loops and 24/7 career coaching.
- **Adzuna API**: Live job market search and global salary statistics.

### **Database (Edge Ready)**
- **Turso (LibSQL)**: Distributed, low-latency edge database.
- **Drizzle ORM**: Type-safe, high-performance database layer optimized for Vercel Edge functions.

---

## 🧠 System Deep Dive

### **1. AI Interview Lifecycle**
The mock interview engine is a recursive AI loop:
- **Initialize**: Generates a tailored first question based on the user's exact target role and resume profile.
- **Interact**: Processes user text/voice input, updates the internal transcript state, and generates adaptive follow-up questions.
- **Evaluate**: Performs a deep-dive analysis of the total transcript to provide an objective score, identify strengths, and pinpoint actionable improvement vectors.

### **2. Edge-Safe Turso Architecture**
Aspirely utilizes a **LibSQL remote client** connected to **Turso**, allowing the entire application—including complex relational database queries—to run seamlessly on Vercel's serverless edge infrastructure without connection pooling bottlenecks.

---

## 🚀 Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root of the `web/` directory:
   ```env
   # Authentication (Auth.js)
   AUTH_SECRET="your-super-secret-key"
   AUTH_GOOGLE_ID="your-google-client-id"
   AUTH_GOOGLE_SECRET="your-google-client-secret"

   # Turso Database
   TURSO_DATABASE_URL="libsql://your-db-url.turso.io"
   TURSO_AUTH_TOKEN="your-turso-auth-token"

   # AI & External APIs
   OPENROUTER_API_KEY="your-openrouter-key"
   ADZUNA_APP_ID="your-adzuna-app-id"
   ADZUNA_API_KEY="your-adzuna-api-key"
   YOUTUBE_API_KEY="your-youtube-api-key"
   ```

3. **Database Migration**:
   ```bash
   npm run db:push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## ☁️ Vercel Deployment Guide

Aspirely is optimized for 1-click deployment on Vercel, but requires a few specific configurations due to beta dependencies:

1. **Environment Variables**: Ensure all `.env` variables listed above are securely added to your Vercel project settings.
2. **Database Migrations**: You can run `npx drizzle-kit push` locally connected to your production Turso database URL before deploying.
3. **Dependency Conflict Bypass (`.npmrc`)**:
   Aspirely uses bleeding-edge packages (like `next-auth@5.0.0-beta.30`). To prevent Vercel's strict `npm install` from failing due to internal `ERESOLVE` peer dependency mismatches, the project includes an `.npmrc` file with:
   ```text
   legacy-peer-deps=true
   ```
   *Do not remove this file unless upgrading out of the Auth.js beta phase!*

---

## 📜 Project Structure

- `/app/`: Next.js App Router pages, layouts, and serverless API endpoints (`/api`).
- `/components/`: Reusable UI components (Hero, Features, Loading Skeletons, ThemeToggle).
- `/db/`: Drizzle ORM schemas and Turso connection clients.
- `/lib/`: Utility functions, AI store hooks (Zustand), and data validations.
- `/public/`: Static assets and high-fidelity cinematic imagery.

---

Built with ❤️ by Yash Gajjar
