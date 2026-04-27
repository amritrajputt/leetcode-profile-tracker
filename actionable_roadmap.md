# Actionable Roadmap: Student Coding Dashboard

This roadmap breaks down the exact steps to build your system directly into your existing `Auth Typescript` backend. Follow these steps one by one.

## Step 1: Database Schema (Start Here)
Since your project uses Drizzle ORM, we first need to prepare the database to store our new student data.

* **Target File:** `src/db/schema.ts`
* **Action:** 
  1. Define the `students` table (with roll number, name, batch year, and platform usernames).
  2. Define the `dailySnapshots` table (with the date, student_id, and total counts).
  3. Run your Drizzle migration/push command to update your Neon/Postgres database.

## Step 2: The Platform Fetchers
Before we write the automated cron job, we need to prove we can successfully fetch data for a single user.

* **Target File:** `src/utils/scrapers.ts` (Create this file)
* **Action:**
  1. Write an `async function fetchLeetCodeStats(username)` that makes an HTTP POST request to the LeetCode GraphQL API.
  2. Write an `async function fetchGFGStats(username)` using `cheerio` to scrape the HTML page.
  3. Write a quick temporary script to test these functions with your own username to verify they return the correct problem counts.

## Step 3: The Nightly Cron Job
Now we scale the fetcher to run automatically for every student.

* **Target File:** `src/jobs/nightlyUpdate.ts` (Create this file)
* **Action:**
  1. Install the `node-cron` package.
  2. Write a function that fetches all students from the database.
  3. Create a `for` loop that iterates over each student. Inside the loop, wrap the fetcher calls in a `try/catch` block.
  4. Add a `setTimeout` delay of 2.5 seconds at the end of each loop iteration to prevent IP blocking.
  5. Save the fetched totals into the `dailySnapshots` table.
  6. Schedule the job to run every night at 12:00 AM (`0 0 * * *`).

## Step 4: Admin API Endpoints
Now the database will have data, so we need to expose it to the Admin Frontend.

* **Target File:** `src/routes/leaderboardRoutes.ts` and `src/controllers/leaderboardController.ts`
* **Action:**
  1. Create a `GET /api/leaderboard/daily` endpoint. Write a Drizzle SQL query to fetch today's snapshot for all students, sorted by `lc_total` descending.
  2. Create a `GET /api/leaderboard/weekly` endpoint. Write a query that fetches the snapshot from today and the closest snapshot to 7 days ago, calculates the difference, and sorts them.

## Step 5: Student Registration Form API
Create a public endpoint so students can submit their own usernames.

* **Target File:** `src/routes/studentRoutes.ts`
* **Action:**
  1. Create a `POST /api/students/register` endpoint.
  2. Take the `roll_no`, `lc_username`, and `gfg_username` from the request body.
  3. **Crucial Check:** Inside the route, call `fetchLeetCodeStats(lc_username)` immediately. If it throws an error (username invalid), return a `400 Bad Request` to the frontend and do NOT save it to the database.

---
*Once you are ready, let me know and we will begin with writing the code for **Step 1**!*
