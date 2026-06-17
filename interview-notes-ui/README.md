# Interview Notes — Frontend

A clean, distraction-free web app to write and organize your interview prep notes.  
Built with React + Vite. Pairs with the backend at 👉 [NotesBackend](https://github.com/Farhantigadi/NotesBackend.git)

---

## What it does

- Organize notes into **Sections → Topics → Questions**
- Write answers, paste code snippets with syntax highlighting, attach images, and draw diagrams
- Edit mode toggle to add, edit, reorder, or delete content
- JWT-based login to keep your notes private
- Fully responsive layout with a warm paper-style theme

---

## Tech Stack

- **React 18** + **Vite**
- **React Router v6** — client-side routing
- **TanStack Query** — server state management
- **Axios** — API calls with JWT interceptor
- **React Hook Form + Zod** — form validation
- **Tailwind CSS** — utility styling
- **Lucide React** — icons
- **React Syntax Highlighter** — code blocks

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- Backend running — see [NotesBackend](https://github.com/Farhantigadi/NotesBackend.git)

---

### 1. Clone the repo

```bash
git clone https://github.com/Farhantigadi/NotesBackend.git
cd interview-notes-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and update it:

```bash
cp .env.example .env
```

Open `.env` and set your backend URL:

```env
VITE_API_BASE_URL=http://localhost:8080
```

> If your backend runs on a different port or host, update this value.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Running with Docker

Docker lets you run the app without installing Node.js at all.

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed

---

### Option A — Build and run locally

**Step 1 — Build the image**

```bash
docker build -t interview-notes-ui .
```

If your backend is not on `http://localhost:8080`, pass the URL at build time:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://your-backend-host:8080 \
  -t interview-notes-ui .
```

**Step 2 — Run the container**

```bash
docker run -p 80:80 interview-notes-ui
```

Open [http://localhost](http://localhost) in your browser.

---

### Option B — Docker Compose (frontend + backend together)

If you want to run both frontend and backend with one command, create a `docker-compose.yml` in the root of your project:

```yaml
version: '3.8'

services:
  backend:
    build: ./NotesBackend
    ports:
      - "8080:8080"

  frontend:
    build:
      context: ./interview-notes-ui
      args:
        VITE_API_BASE_URL: http://backend:8080
    ports:
      - "80:80"
    depends_on:
      - backend
```

Then run:

```bash
docker compose up --build
```

Frontend → [http://localhost](http://localhost)  
Backend → [http://localhost:8080](http://localhost:8080)

---

## Project Structure

```
src/
├── api/              # Axios instance + API functions (auth, questions, sections)
├── components/
│   ├── dialogs/      # Add/Edit dialogs for sections, topics, questions
│   ├── layout/       # Navbar, Sidebar, Layout wrapper
│   └── shared/       # CodeBlock, ImageUploader, ConfirmDialog, etc.
├── contexts/         # AuthContext, EditModeContext
├── hooks/            # React Query hooks for data fetching
├── pages/            # Route-level page components
└── main.jsx          # App entry point
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:8080` |

> All variables must be prefixed with `VITE_` to be accessible in the browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Authentication

- Login with your username and password
- JWT token is stored in `localStorage`
- All API requests automatically include the `Authorization: Bearer <token>` header
- On token expiry or 401 response, you are automatically redirected to the login page
- User accounts are managed on the backend (no self-signup — accounts are created by the admin)

---

## Backend

The backend repo is here: [https://github.com/Farhantigadi/NotesBackend.git](https://github.com/Farhantigadi/NotesBackend.git)

It is a Spring Boot application that exposes REST APIs for sections, topics, questions, image uploads, and authentication.

---

## License

MIT
