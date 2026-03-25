# Deployment Guide: Vercel + Turso

Aspirely-new is optimized for the **Next.js Edge Runtime**, making it incredibly fast. To deploy it with data persistence, you should use **Turso** as your cloud database.

## 1. Database Setup (Turso)

1.  **Install Turso CLI**: If you haven't, install it and run `turso auth signup`.
2.  **Create Database**: Run `turso db create aspirely-db`.
3.  **Get Credentials**:
    -   **URL**: `turso db show aspirely-db --url`
    -   **Token**: `turso db tokens create aspirely-db`
4.  **Push Schema**:
    ```bash
    TURSO_DATABASE_URL=<your-url> TURSO_AUTH_TOKEN=<your-token> npm run db:push
    ```

## 2. Vercel Deployment

1.  **Push to GitHub**: Ensure all changes are committed and pushed to your repo.
2.  **Connect to Vercel**: Import your project into Vercel.
3.  **Configure Environment Variables**:
    -   `TURSO_DATABASE_URL`: Your Turso DB URL (starts with `libsql://`).
    -   `TURSO_AUTH_TOKEN`: Your Turso Auth Token.
    -   `OPENROUTER_API_KEY`: For Gemini 2.0 AI.
    -   `ADZUNA_APP_ID` & `ADZUNA_API_KEY`: For job data.
    -   `NEXTAUTH_SECRET`: A random string for auth.
    -   `NEXTAUTH_URL`: Your deployment domain (e.g., `https://aspirely.vercel.app`).
4.  **Build Settings**: The default Next.js settings will work fine.

## 3. Why Turso?
Vercel's serverless functions are ephemeral—they don't store local files between requests. A local `sqlite.db` file will be wiped every time the function spins down. Turso provides a globally distributed LibSQL database that works perfectly with Drizzle and the Edge runtime.

---
**Note:** Built with ❤️ for Yash Gajjar.
