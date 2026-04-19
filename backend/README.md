## ShuddhoBD Backend (Auth & RBAC)

This backend provides the mandatory requirements for ShuddhoBD:

- Secure login and logout with HTTP-only cookies (JWT-based).
- Role-Based Access Control (RBAC) for `citizen`, `analyst`, and `admin`.
- Passwords stored using strong one-way hashing (bcrypt).

### Tech Stack

- Node.js, Express, TypeScript
- MongoDB + Mongoose
- JWT with HTTP-only cookies

### Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Copy `.env.example` to `.env` and update values:

```bash
MONGO_URI=mongodb://localhost:27017/shuddhobd
JWT_SECRET=your_super_secret_here
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

3. Run the development server:

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

### Auth Endpoints

- `POST /api/auth/register` – Register a new user (citizen by default, or analyst/admin).
- `POST /api/auth/login` – Login, sets secure HTTP-only cookie.
- `POST /api/auth/logout` – Clears auth cookie.
- `GET /api/auth/me` – Returns the current authenticated user.

### Protected Role-Based Routes (examples)

- `GET /api/protected/citizen` – Requires any authenticated role.
- `GET /api/protected/analyst` – Requires `analyst` or `admin`.
- `GET /api/protected/admin` – Requires `admin`.

