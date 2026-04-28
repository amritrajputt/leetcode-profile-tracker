# 🎯 All Eyes On You (Student Coding Tracker)

A robust, full-stack student coding performance tracker built for college placement cells. This application automates the tracking of students' progress on LeetCode and GeeksforGeeks, providing public leaderboards, an admin dashboard, and automated nightly data synchronization.

## 🏗️ Architecture & Tech Stack

This project is divided into three main layers:

### 1. Frontend (Client)
- **Tech Stack**: React 19, Vite, React Router, CSS (Vanilla), Lucide React (Icons).
- **Deployment**: Hosted on **Vercel** (`alleyesonu.vercel.app` or similar custom domain).
- **Key Pages**:
  - **Landing Page**: Entry point for students and admins.
  - **Registration**: Public form where students enter their roll number, branch, batch, and coding platform usernames.
  - **Public Leaderboard**: Viewable by anyone without logging in. Shows rankings, total problems solved, and filters by batch.
  - **Admin Dashboard**: Secured by JWT authentication. Allows placement faculty to view detailed stats and export the leaderboard to Excel.

### 2. Backend (Server)
- **Tech Stack**: Node.js, Express, TypeScript, Drizzle ORM, node-cron.
- **Deployment**: Hosted as a Web Service on **Render**.
- **Core Modules**:
  - **Auth**: Handles Admin (Faculty) login and issues JWT tokens.
  - **Tracker API**: Handles student registration and serving leaderboard data.
  - **Scrapers**: Custom web scrapers built with native `fetch` to extract public profile data from LeetCode (GraphQL API) and GeeksforGeeks (HTML parsing).
  - **Cron Job**: A scheduled task (`node-cron`) that runs every night at midnight to fetch the latest problem counts for every registered student.

### 3. Database
- **Tech Stack**: PostgreSQL.
- **Hosting**: **Neon Serverless Postgres**.
- **Schema**:
  - `faculty`: Stores admin credentials (hashed with bcrypt).
  - `students`: Stores student metadata (name, roll number, usernames).
  - `dailySnapshots`: Stores a historical record of how many problems each student solved on a specific date. The leaderboard is calculated by fetching the *latest* snapshot for each student.

---

## ⚙️ How it Works (Data Flow)

1. **Onboarding**: A student visits the `/register` page and submits their LeetCode/GFG usernames.
2. **Immediate Sync**: Currently, their snapshot is created the first time the Cron job runs. (You can also trigger it manually via the `runCronNow.ts` script).
3. **Nightly Automation**: Every night at 00:00 (Midnight), the backend `cron` job wakes up. It iterates through every student in the database, fetches their public profile data from LeetCode and GFG, and inserts a new row into the `dailySnapshots` table.
4. **Leaderboard Generation**: When a user visits the Leaderboard, the backend queries the database for every student, joins it with their **most recent snapshot date**, and calculates their total score to rank them.

---

## 🚀 Key Features

- **No Authentication Required for Students**: Students can register and view the leaderboard completely hassle-free.
- **Tolerant Registration**: Students only need to provide *at least one* valid platform username (LeetCode OR GFG) to register.
- **One-Click Excel Export**: Admins can download beautifully formatted Excel reports (`.xlsx`) of the leaderboard directly from the dashboard.
- **Batch Filtering**: Both the public leaderboard and admin dashboard support filtering rankings by graduation year.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v20+)
- `pnpm` (Package Manager)
- A PostgreSQL Database (Local Docker or Neon)

### 1. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
PORT=4000
JWT_SECRET="your-super-secret-jwt-key"

# Admin credentials for seeding
email="admin@college.edu.in"
password="your-secure-password"
```

### 2. Backend Setup
Open a terminal in the root directory:
```bash
# Install backend dependencies
pnpm install

# Generate and run database migrations
pnpm run db:generate
pnpm run db:migrate

# Seed the Admin/Faculty account
npx tsx src/scripts/seedFaculty.ts

# Start the development server
pnpm run dev
```

### 3. Frontend Setup
Open a second terminal:
```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Create a frontend .env file
echo "VITE_API_URL=http://localhost:4000/api/v1" > .env

# Start the Vite development server
npm run dev
```

---

## 🛠️ Useful Scripts

- `npx tsx src/scripts/runCronNow.ts`: Manually trigger the scraper to fetch data for all students immediately instead of waiting for midnight.
- `pnpm run db:studio`: Opens Drizzle Studio to view your database GUI in the browser.

---
*Built for Placement Cells · All Eyes On You ©*
