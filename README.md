# 🚀 Student Coding Tracker & Leaderboard

An automated, backend-heavy tracking system designed for college placement heads to monitor and analyze student coding performance across popular competitive programming platforms like **LeetCode** and **GeeksforGeeks**. 

By automatically capturing daily snapshots of each student's solved problems, the system generates dynamic leaderboards showing daily, weekly, monthly, and yearly progress.

---

## 🏗️ Architecture & How It Works

The system is built to be efficient, reliable, and respectful of external platform rate limits. 

1. **The Database (Drizzle ORM + PostgreSQL):** 
   - `studentsTable`: Stores static student data (Roll Number, Batch, Branch, and platform usernames).
   - `dailySnapshots`: A time-series table that records the exact number of problems solved by each student every single day.
2. **The Scrapers:** 
   - **LeetCode:** Fetches data reliably using LeetCode's official GraphQL API.
   - **GeeksForGeeks:** Scrapes the user profile utilizing custom regex on the embedded Next.js JSON payloads.
3. **The Nightly Engine (Cron Job):**
   - At exactly 12:00 AM (IST) every night, a `node-cron` job iterates through all registered students.
   - It fetches their latest problem counts and computes their growth (weekly, monthly, yearly) compared to past snapshots.
   - Saves the new data into the database with a 2.5-second delay between requests to prevent IP blocking.
4. **The APIs:**
   - Exposes RESTful endpoints to serve the pre-calculated leaderboard data to an Admin Dashboard Frontend.

---

## 🛠️ Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** [Neon Serverless PostgreSQL](https://neon.tech/)
- **Scheduling:** `node-cron`
- **Package Manager:** `pnpm`

---

## 🚦 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js (v18+)
- `pnpm` installed globally (`npm install -g pnpm`)
- A PostgreSQL database (Local or Cloud like Neon/Supabase)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/leetcode-profile-analyzer.git
cd leetcode-profile-analyzer
pnpm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and add your database connection string:
```env
PORT=8080
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
```

### 3. Database Setup
The project uses Drizzle ORM. You need to push the schema to your database before running the app.
```bash
# Generate SQL migration files based on your schema
pnpm db:generate

# Push the schema directly to the database
pnpm db:push 
# OR if you prefer migrations: pnpm db:migrate
```

### 4. Run the Application
```bash
# Starts the server in watch mode using tsc-watch
pnpm start
```
*Note: As soon as the server starts, the Nightly Cron Job is scheduled in the background.*

---

## 📡 API Endpoints (In Development)

### Leaderboard APIs
- `GET /api/leaderboard/daily` - Returns the top students based on daily problem-solving velocity.
- `GET /api/leaderboard/weekly` - Returns the top students based on problems solved in the last 7 days.
- `GET /api/leaderboard/monthly` - Returns the top students based on problems solved in the last 30 days.
- `GET /api/leaderboard/export` - Exports the latest student rankings and problem counts to an Excel (`.xlsx`) file.

### Student Management
- `POST /api/students/register` - Registers a new student. Validates LeetCode/GFG usernames via a live API ping before saving.

---

## 🛡️ Edge Cases Handled

- **Cron Job Fault Tolerance:** Wrapped in granular `try/catch` blocks. If one student's profile is deleted or errors out, the loop `continue`s to the next student without crashing the entire nightly job.
- **Rate Limiting Protection:** Implements artificial delays (`setTimeout`) between HTTP requests to external coding platforms.
- **Idempotency:** Uses `ON CONFLICT DO UPDATE` on compound constraints `(student_id, date)` to ensure no duplicate records are created if the cron job accidentally triggers twice on the same day.
- **Timezone Awareness:** The cron scheduler is explicitly set to `Asia/Kolkata` ensuring midnight runs happen at the correct local time, regardless of server location.

---

## 🚀 Future Enhancements

- **Admin Dashboard Frontend:** A React/Next.js UI for the placement head to view charts and export CSV reports.
- **More Platforms:** Expand scrapers to support Codeforces, CodeChef, and HackerRank.
- **Email Alerts:** Automatically email students who haven't solved a problem in 7 consecutive days.

---
*Built with ❤️ for Student Success.*
