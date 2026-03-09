# MediScan — React Frontend

A modern, responsive React frontend for the MediScan medical report analysis app.

## Tech Stack
- **React 18** with hooks
- **React Router v6** for navigation
- **Vite** as the build tool
- **CSS Modules** for scoped styling
- No external UI libraries — custom design system

## Project Structure

```
src/
├── context/
│   └── AuthContext.jsx      # Global auth state (user, login, logout)
├── hooks/
│   └── useToast.js          # Toast notification hook
├── pages/
│   ├── LandingPage.jsx      # Marketing / static landing page
│   ├── LandingPage.module.css
│   ├── AuthPage.jsx         # Login + Signup (split-panel)
│   ├── AuthPage.module.css
│   ├── AppLayout.jsx        # Main app (sidebar + all views)
│   └── AppLayout.module.css
├── components/
│   ├── Toast.jsx            # Toast notification component
│   └── Toast.module.css
├── utils/
│   └── api.js               # All API calls to the backend
├── App.jsx                  # Router root
├── main.jsx                 # React entry point
└── index.css                # Global styles & CSS variables
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure backend URL
The Vite dev server proxies `/api` → `http://localhost:8000` (configured in `vite.config.js`).

If your backend runs on a different port, update `vite.config.js`:
```js
proxy: {
  '/api': {
    target: 'http://localhost:YOUR_PORT',
    changeOrigin: true,
  }
}
```

Also update your backend CORS to allow `http://localhost:5173`.

### 3. Start the dev server
```bash
npm run dev
```

Visit `http://localhost:5173`

### 4. Build for production
```bash
npm run build
```
The `dist/` folder contains the static build, ready to serve.

## Pages & Routes

| Route  | Page        | Auth Required |
|--------|-------------|---------------|
| `/`    | Landing     | No            |
| `/auth`| Login/Signup| No (redirects to /app if logged in) |
| `/app` | Dashboard + Analyze + Chat | Yes |

## Features

- **Landing page** — marketing page with hero, features, how-it-works, testimonials, CTA
- **Authentication** — login and signup with form validation, error display
- **Dashboard** — welcome banner, quick actions, recent reports grid
- **Analyze Report** — drag-and-drop file upload, optional prompt, animated 4-step progress
- **Results** — tabbed view for Summary / Risk Analysis / Next Steps / Ask Doctor
- **Chat** — follow-up conversational AI with report selector, typing indicator
- **History** — all reports in sidebar, click to view, delete with confirmation
- **Responsive** — collapsible sidebar on mobile, all views adapt to small screens

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/login/` | Authenticate user |
| POST | `/api/signup/` | Create new user |
| POST | `/api/summarize-image/` | Analyze a medical document |
| GET  | `/api/user-summaries/{userId}` | Get all user reports |
| DELETE | `/api/user-summaries/{summaryId}` | Delete a report |
| GET  | `/api/summary-response/{id}` | Get summary text |
| GET  | `/api/risk-response/{id}` | Get risk analysis |
| GET  | `/api/next-step-response/{id}` | Get next steps |
| GET  | `/api/ask-docter-response/{id}` | Get doctor questions |
| POST | `/api/followup/` | Send follow-up chat message |
