# All Eyes On You

A full-stack student coding performance tracker built for college placement cells. Automatically tracks students' LeetCode and GeeksforGeeks progress with nightly data sync, live leaderboards, and Excel exports.

---

## Quick Start

```bash
# Backend
pnpm install
pnpm tsx src/scripts/seedFaculty.ts   # seed admin account
pnpm start

# Frontend
cd client && npm install && npm run dev
```

## Environment Variables (.env)
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
PORT=8081
JWT_SECRET="your-secret"
email="admin@college.edu.in"
password="admin-password"
```

## API Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | No | Admin login |
| POST | `/api/v1/tracker/add-student` | No | Student self-registration |
| GET | `/api/v1/tracker/leaderboard?batch=2026` | JWT | Leaderboard |
| GET | `/api/v1/tracker/export?batch=2026` | JWT | Download Excel |

---
*Built for AIMT Placement Cell · All Eyes On You © 2026*
