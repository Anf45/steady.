# steady.

`steady.` is a React and Firebase habit-tracking web app built to help users create habits, check in daily, grow streaks, and earn XP. The project focuses on a simple, practical flow rather than advanced social or gamified features.

## Implemented features

- Email/password authentication with Firebase Auth
- User profile creation in Firestore on sign up
- Protected routes for authenticated pages
- Dashboard with XP summary and habit overview
- Habit creation, editing, listing, and archiving
- Habit detail page with recent check-in history
- Daily check-in flow with:
  - duplicate check-in prevention
  - streak updates
  - XP gain
  - check-in history storage
- Basic badge system:
  - first habit created
  - first check-in
  - 3-day streak
- Profile page showing account summary, XP, active habits, and earned badges
- Mobile-friendly card-based layout

## Setup instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then fill in your Firebase project values.

### 3. Configure Firebase

The app reads Firebase configuration from Vite environment variables.

Required variables:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

What each variable is for:

- `VITE_FIREBASE_API_KEY`: Firebase web app API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Auth domain, usually `your-project.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID for the web app

If these values are missing, the app fails with a clear Firebase setup error when Firebase features are used.

## How to run locally

Start the development server:

```bash
npm run dev
```

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## `.env.example` usage

`.env.example` is included as a template only. It does not contain real secrets.

Expected workflow:

1. Copy `.env.example` to `.env`
2. Paste in your own Firebase project values
3. Restart the Vite server after editing `.env`

## Test flow for marker

This project currently uses a manual test flow rather than automated tests.

Recommended end-to-end check:

1. Start the app with valid Firebase values in `.env`
2. Sign up with a new email account
3. Confirm you are redirected to the dashboard
4. Create a first habit
5. Confirm the habit appears on the dashboard
6. Check in on that habit
7. Confirm:
   - the check-in button changes state
   - XP increases
   - streak updates
   - the first check-in badge appears on the profile page
8. Open the habit detail page
9. Confirm the recent check-in date appears in the history list
10. Edit the habit and confirm the updated values save
11. Archive the habit and confirm it disappears from the active dashboard list
12. Open the profile page and confirm account summary values load correctly
13. Log out and confirm protected pages redirect back to auth

## Known limitations / not implemented

- No automated unit or integration test suite yet
- No real calendar UI for check-ins, only a recent date list
- No password reset flow
- No advanced profile editing
- No reminders, notifications, or recurring scheduling features
- No social features, leaderboards, or friend system
- Badge system is intentionally small and simple
- Vite may show a bundle size warning because Firebase increases client bundle size

## Project structure summary

```text
src/
  app/
    providers/      App-level providers such as auth context
    routes/         Router setup and protected routes
  components/
    common/         Shared UI pieces such as empty and status cards
    dashboard/      Dashboard-specific components
    habits/         Habit form, cards, and check-in UI
    layout/         Navbar and app shell
  hooks/            Custom hooks such as useAuth
  pages/            Route-level pages
  services/         Firebase-facing service layer and app logic
    firebase/       Firebase config and auth helpers
  styles/           Global CSS
  utils/            Reusable formatting and date helpers
```

## Submission note

The codebase is organised so that:

- Firebase access stays in the service layer
- streak logic stays isolated and reusable
- UI components remain focused on rendering and user interaction

This makes the project easier to explain, extend, and mark.
