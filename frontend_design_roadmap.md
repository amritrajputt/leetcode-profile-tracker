# CodePulse — Frontend Design & Roadmap

> A complete design spec + build plan for someone who knows basic React and has zero design sense.  
> **TL;DR:** I'll give you the exact colors, fonts, spacing, and code structure. You just copy-paste and connect.

---

## 🎨 Design System (Use These Exact Values Everywhere)

### Colors
```
Background:        #0a0e1a  (deep navy)
Card Background:   rgba(255, 255, 255, 0.05)  (glassmorphism)
Card Border:       rgba(255, 255, 255, 0.1)
Primary Accent:    #6366f1  (indigo/purple)
Primary Hover:     #818cf8
Success Green:     #22c55e
Warning Orange:    #f59e0b
Gold (Rank 1):     #fbbf24
Silver (Rank 2):   #94a3b8
Bronze (Rank 3):   #cd7f32
Text Primary:      #f1f5f9  (white-ish)
Text Secondary:    #94a3b8  (muted grey)
Input Background:  rgba(255, 255, 255, 0.08)
Input Border:      rgba(255, 255, 255, 0.15)
Danger Red:        #ef4444
```

### Font
```
Google Font: "Inter"
Import: @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
```

### Glassmorphism Card (Copy-paste this CSS everywhere)
```css
.glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 32px;
}
```

### Gradient Button (Primary CTA)
```css
.btn-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    border: none;
    padding: 12px 28px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}
.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
}
```

---

## 📄 Pages — What Each Page Does & Looks Like

### Page 1: Landing Page (`/`)

**Who sees it:** Everyone (students + faculty)  
**Purpose:** First impression. Two buttons — one for students, one for admin.

**Layout:**
```
┌──────────────────────────────────────────────┐
│  Navbar:  [CodePulse Logo]     [Login btn]   │
├──────────────────────────────────────────────┤
│                                              │
│          🚀 Track Your Coding Journey        │
│    AIMT Placement Cell — LeetCode & GFG      │
│                                              │
│   [ Register as Student ]   [ Admin Login ]  │
│                                              │
├──────────────────────────────────────────────┤
│  ┌────────┐  ┌────────────┐  ┌───────────┐  │
│  │📊 Daily│  │🏆 Live     │  │📥 Excel   │  │
│  │Tracking│  │Leaderboard │  │Reports    │  │
│  └────────┘  └────────────┘  └───────────┘  │
└──────────────────────────────────────────────┘
```

**Key Details:**
- Big bold hero text, centered
- "Register as Student" = gradient filled button → navigates to `/register`
- "Admin Login" = outlined/ghost button → navigates to `/login`
- 3 feature cards below explaining what the platform does
- No data fetching needed on this page

---

### Page 2: Student Registration (`/register`)

**Who sees it:** Students (public, no auth)  
**Purpose:** Students fill in their details + coding platform usernames  
**API:** `POST /api/v1/tracker/add-student`

**Layout:**
```
┌──────────────────────────────────────────────┐
│  ← Back to Home                              │
├──────────────────────────────────────────────┤
│          ┌─────────────────────┐             │
│          │  Student Registration│             │
│          │                     │             │
│          │  Name       Roll No │             │
│          │  Email      Batch   │             │
│          │  Course     Branch  │             │
│          │  Section            │             │
│          │                     │             │
│          │  ── Platform IDs ── │             │
│          │  🟡 LeetCode User   │             │
│          │  🟢 GFG Username    │             │
│          │                     │             │
│          │  [ Register ]       │             │
│          └─────────────────────┘             │
└──────────────────────────────────────────────┘
```

**Key Details:**
- Single glassmorphism card, centered on page
- Form fields arranged in a 2-column grid (Name + Roll No side by side, etc.)
- Section for platform usernames separated with a subtle divider
- On success → redirect to `/success`
- On error (e.g., "student already exists") → show red toast/alert
- Validate on frontend too: roll number required, email format, etc.

---

### Page 3: Admin Login (`/login`)

**Who sees it:** Placement faculty only  
**Purpose:** Faculty logs in with email/password to access dashboard  
**API:** `POST /api/v1/auth/login`

**Layout:**
```
┌──────────────────────────────────────────────┐
│  ← Back to Home                              │
├──────────────────────────────────────────────┤
│              ┌───────────────┐               │
│              │   🔒          │               │
│              │ Placement     │               │
│              │ Admin Login   │               │
│              │               │               │
│              │ Email         │               │
│              │ Password  👁  │               │
│              │               │               │
│              │ [ Sign In ]   │               │
│              │               │               │
│              │ Faculty Only  │               │
│              └───────────────┘               │
└──────────────────────────────────────────────┘
```

**Key Details:**
- Smaller card than registration (only 2 fields)
- Password field has show/hide toggle (eye icon)
- On success → store JWT token in `localStorage`, redirect to `/dashboard`
- On error → show "Invalid credentials" message
- Keep it minimal and professional

---

### Page 4: Admin Dashboard / Leaderboard (`/dashboard`)

**Who sees it:** Authenticated faculty only (redirect to `/login` if no token)  
**Purpose:** The main command center — view all students, filter, export  
**APIs:**
- `GET /api/v1/tracker/leaderboard?batch=2024` (with Bearer token)
- `GET /api/v1/tracker/export?batch=2024` (download Excel)

**Layout:**
```
┌──────────────────────────────────────────────┐
│  CodePulse    [Batch ▼]  [Export 📥] [Logout]│
├──────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ 342  │ │  87  │ │  64  │ │  4   │        │
│  │Total │ │Avg LC│ │Avg GF│ │Batch │        │
│  └──────┘ └──────┘ └──────┘ └──────┘        │
├──────────────────────────────────────────────┤
│  🔍 Search student...                        │
├──────────────────────────────────────────────┤
│  # │ Name     │ Roll    │ Branch│ LC │GFG│Tot│
│ ───┼──────────┼─────────┼───────┼────┼───┼───│
│ 🥇 │ Rahul S  │ 230363..│ CSE   │ 245│180│425│
│ 🥈 │ Priya K  │ 230363..│ CSE   │ 210│156│366│
│ 🥉 │ Aman V   │ 230363..│ IT    │ 198│142│340│
│  4 │ Sneha R  │ 230363..│ CSE   │ 180│130│310│
│  5 │ Vikas M  │ 230363..│ ECE   │ 165│120│285│
├──────────────────────────────────────────────┤
│        < 1  2  3  4  5 >                     │
└──────────────────────────────────────────────┘
```

**Key Details:**
- **Navbar:** Logo left, Batch filter dropdown + Export button + Logout right
- **Stat Cards (top row):** 4 glassmorphism cards with key metrics
  - Total Students, Average LeetCode, Average GFG, Number of Batches
  - Calculate these on the frontend from the leaderboard data
- **Search Bar:** Filter table rows by name/roll number (client-side filter)
- **Leaderboard Table:**
  - Top 3 rows get special gold/silver/bronze left-border highlight
  - Alternating row backgrounds for readability
  - Sortable by clicking column headers (optional, nice-to-have)
- **Batch Dropdown:** Fetches `?batch=2024`, `?batch=2025`, etc.
- **Export Button:** Calls the `/export` endpoint → browser auto-downloads `.xlsx`
- **Logout:** Clears `localStorage` token, redirects to `/`
- **Auth Guard:** If no token in localStorage, redirect to `/login`

---

### Page 5: Registration Success (`/success`)

**Who sees it:** Students after successful registration  
**Purpose:** Confirmation + set expectations

**Layout:**
```
┌──────────────────────────────────────────────┐
│                                              │
│               ✅                             │
│     Registration Successful!                 │
│                                              │
│   Your coding profiles will be tracked       │
│   starting tonight at midnight.              │
│   Check the leaderboard tomorrow!            │
│                                              │
│        [ Back to Home ]                      │
│                                              │
└──────────────────────────────────────────────┘
```

**Key Details:**
- Simple, celebratory page
- Green checkmark icon (animated if possible)
- Clear message about when tracking starts (tonight)
- Single button back to home

---

## 🗺️ Route Map

| Route | Page | Auth Required? |
|---|---|---|
| `/` | Landing Page | ❌ No |
| `/register` | Student Registration | ❌ No |
| `/login` | Admin Login | ❌ No |
| `/dashboard` | Leaderboard + Stats | ✅ Yes (JWT) |
| `/success` | Registration Success | ❌ No |

---

## 🛠️ Build Roadmap (Day-by-Day)

Since you know basic React, here's the exact order to build this:

### Day 1: Project Setup + Landing Page
1. Create Vite + React project in a new folder (e.g., `client/`)
2. Install `react-router-dom` for routing
3. Set up the CSS design system (colors, fonts, `.glass-card`, `.btn-primary`)
4. Build the Landing Page with two buttons linking to `/register` and `/login`

### Day 2: Student Registration Form
1. Build the registration form with all fields
2. Use React `useState` for form state
3. Connect to `POST /api/v1/tracker/add-student` using `fetch()`
4. Handle success (redirect to `/success`) and error (show message)
5. Build the Success page

### Day 3: Admin Login
1. Build the login form (email + password)
2. Connect to `POST /api/v1/auth/login` using `fetch()`
3. On success, store the JWT token: `localStorage.setItem("token", data.token)`
4. Redirect to `/dashboard`
5. Build a simple `ProtectedRoute` component that checks for the token

### Day 4: Dashboard + Leaderboard Table
1. Fetch data from `GET /api/v1/tracker/leaderboard` with the token in headers
2. Display the stat cards (calculate totals/averages from the data)
3. Render the leaderboard table
4. Add batch filter dropdown
5. Add search bar (filter the already-fetched data client-side)

### Day 5: Polish + Export
1. Wire up the "Export Excel" button (fetch the `/export` endpoint as a blob download)
2. Add loading spinners while data is fetching
3. Add proper error messages/toasts
4. Add the Logout button functionality
5. Final visual polish — spacing, hover effects, mobile responsiveness

---

## 📦 Recommended npm Packages

| Package | Purpose | Why? |
|---|---|---|
| `react-router-dom` | Page routing | Navigate between pages |
| `react-hot-toast` | Toast notifications | Show success/error messages beautifully |
| `lucide-react` | Icons | Clean, modern icons (search, download, lock, etc.) |

> **That's it.** You don't need TailwindCSS, no UI library, no state management.  
> Just vanilla CSS + these 3 packages + basic React.

---

## 🔌 API Quick Reference

```
BASE_URL = "http://localhost:8081/api/v1"

POST /auth/login          → { email, password }        → returns { token }
POST /tracker/add-student → { name, rollNumber, ... }  → returns student
GET  /tracker/leaderboard → ?batch=2024                → returns array (needs Bearer token)
GET  /tracker/export      → ?batch=2024                → downloads .xlsx (needs Bearer token)
```

**How to send the token:**
```js
fetch(url, {
    headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
})
```
