# Student Coding Dashboard - Implementation Plan

This document outlines the end-to-end architecture and implementation phases for the Student Coding Tracking System. Please review this plan, and let me know if you approve it or if we need to adjust any parts before we begin coding.

## Overview
The system will allow the placement head (Admin) to monitor student coding activity on LeetCode and GeeksforGeeks. It relies on a time-series database approach to accurately calculate daily, weekly, and monthly progress without overloading the external platforms with requests.

---

## 1. Database Architecture

The core of this system relies on decoupling "Static Student Info" from "Changing Progress Data". 



### `students` Table
Stores the static information of a student.
- `id` (Primary Key, UUID)
- `roll_no` (String, Unique)
- `name` (String)
- `batch_year` (Integer, e.g., 2026)
- `lc_username` (String, nullable)
- `gfg_username` (String, nullable)

### `daily_snapshots` Table
Stores the historical problem-solving count for every student, taken at midnight.
- `id` (Primary Key)
- `student_id` (Foreign Key -> students.id)
- `date` (Date, e.g., '2024-10-25')
- `lc_total` (Integer)
- `gfg_total` (Integer)

> [!IMPORTANT]  
> **Crucial Checkpoint:** You must create a compound unique index on `(student_id, date)` in the `daily_snapshots` table. This prevents the cron job from accidentally creating duplicate records for the same student on the same day if the script is run twice by mistake.

---

## 2. Execution Phases

### Phase 1: Foundation & Database Setup
- Set up the PostgreSQL database and create the `students` and `daily_snapshots` tables.
- Create the Admin authentication system.
- Create an endpoint for the Admin to upload a CSV file of students (Roll No, Name, Batch).

### Phase 2: Platform Integration (The Scrapers)
- Write the `fetchLeetCodeStats(username)` function using the LeetCode GraphQL API.
- Write the `fetchGFGStats(username)` function using HTML scraping (e.g., `cheerio` or `puppeteer`).
- **Checkpoint:** Test both functions thoroughly with valid, invalid, and empty usernames to see how they behave.

### Phase 3: The Nightly Cron Job (The Core Engine)
- Implement `node-cron` scheduled for `0 0 * * *` (Midnight).
- Write the loop that iterates through all students, fetches their data, and saves it to `daily_snapshots`.
- Implement the randomized delay (2 to 3.5 seconds) between requests.

### Phase 4: Analytics APIs & Admin Dashboard
- Create the SQL queries that calculate progress:
  - *Daily:* `Snapshot(Today) - Snapshot(Yesterday)`
  - *Weekly:* `Snapshot(Today) - Snapshot(Today - 7)`
- Build API endpoints for Leaderboards (Top 10 daily, weekly, etc.).
- Build a `GET /api/leaderboard/export` endpoint using `exceljs` to allow admins to download the latest student rankings and scores as an `.xlsx` file.
- Build the Frontend Admin Dashboard to display these tables.

### Phase 5: Student Public Form
- Build a simple public web page where students input their `roll_no`.
- If the `roll_no` exists, allow them to input their `lc_username` and `gfg_username`.
- Backend instantly pings LeetCode/GFG to verify the username exists before saving.

---

## 3. Edge Cases & Critical Considerations

> [!WARNING]  
> **Cron Job Failure Loop**
> If Student #45 has a deleted LeetCode account, your API call will throw an error. If you don't use `try/catch` inside your loop, the *entire script will crash*, and Students #46 to #1000 will not get updated. 
> **Action:** Always wrap the fetch logic inside a `try/catch` block for *each* student, log the error, and use `continue` to move to the next student.

> [!CAUTION]  
> **Server Timezones**
> If you deploy this to a cloud provider like AWS, Render, or Heroku, the server's clock will be in **UTC**. This means your "Midnight" cron job will actually run at 5:30 AM IST. 
> **Action:** Explicitly set the timezone parameter in your cron job configuration (e.g., `timezone: "Asia/Kolkata"`).

> [!TIP]  
> **Invalid Usernames at Submission**
> Do not let students submit fake or misspelled usernames. When the student clicks "Submit" on the frontend, your backend must do a live check to verify the profile returns a `200 OK`. If it returns `404`, reject the form immediately.

> [!NOTE]  
> **Handling Missing Snapshot Data**
> If your server goes down for maintenance on a Tuesday night, you won't have Wednesday's snapshot. When writing your "Weekly Progress" calculation, make sure your SQL query looks for the *most recent* snapshot up to 7 days ago, rather than strictly expecting exactly 7 days ago.

## User Review Required
Please review the proposed execution phases and let me know if you want to proceed with this architecture, or if you want to add/remove any features!
