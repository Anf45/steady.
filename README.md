# steady.

`steady.` is a habit tracker with a game layer on top. The idea is simple: build routines, check in, grow streaks, earn XP, unlock badges, and make progress feel a bit more fun than a plain checklist.

## What is in the app right now

- Email/password sign up and log in with Firebase Auth
- Protected pages for logged-in users
- Habit creation, editing, archiving, restoring, and deletion
- Daily check-ins with repeat targets for habits that need more than one completion
- Streak tracking with current streak and best streak
- XP rewards tied to habit difficulty:
  - `easy` = `10 XP`
  - `medium` = `20 XP`
  - `hard` = `30 XP`
- Levels and rank titles based on XP progress
- Badge unlocks for milestones like first habit, first check-in, streaks, and XP goals
- Dashboard summaries and simple analytics for progress over time
- Habit detail page with recent check-in history
- Profile page with team, badges, XP, check-ins, and account summary
- Team themes:
  - `Earth`
  - `Fire`
  - `Ice`
  - `Air`
- Dark mode
- Mobile-friendly card layout

## Getting it running

### 1. Install the project

```bash
npm install
```

### 2. Create your local env file

Copy the example file:

```bash
cp .env.example .env
```

Then paste your own Firebase values into `.env`.

### 3. Firebase variables needed

The app reads Firebase config from Vite environment variables, not hardcoded values.

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

What each one does:

- `VITE_FIREBASE_API_KEY` = Firebase web app API key
- `VITE_FIREBASE_AUTH_DOMAIN` = auth domain, usually `your-project.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID` = Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` = Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` = Firebase sender ID
- `VITE_FIREBASE_APP_ID` = Firebase web app ID

If these are missing, the app fails clearly when Firebase features are used.

### 4. Start the app

```bash
npm run dev
```

Useful extra commands:

```bash
npm run build
npm run preview
```

## Using `.env.example`

`.env.example` is only a setup guide. It does not contain any real secrets.

Normal workflow:

1. Copy `.env.example` to `.env`
2. Add your Firebase project values
3. Restart the dev server after saving the file

## Marker test flow

This project is mainly tested manually, so this is the quickest full run-through:

1. Start the app with valid Firebase values in `.env`
2. Create a new account
3. Pick a team during sign up
4. Confirm you land on the dashboard
5. Create a habit
6. Check in on it
7. Confirm:
   - the habit updates for today
   - XP goes up
   - the streak changes correctly
   - the dashboard stats update
8. Open the habit details page
9. Confirm recent check-in history appears
10. Edit the habit and save again
11. Archive it, then restore it from the archived section
12. Open the profile page and confirm badges, XP, level, and team info all load correctly
13. Log out and confirm protected pages send you back to auth

## What is still missing

- No automated unit or integration tests yet
- No password reset flow
- No calendar-style check-in view
- No reminders or notifications
- No social features, friends, or leaderboard system
- No advanced profile editing beyond the current team and reset options
- Some Firebase-heavy builds may show a Vite bundle size warning

## Project structure

```text
src/
  app/
    providers/      app-wide providers such as auth context
    routes/         route setup and protected routes
  components/
    common/         shared UI parts
    dashboard/      dashboard-specific UI
    habits/         habit cards, forms, and check-in controls
    layout/         navbar and app shell
  hooks/            custom hooks such as useAuth
  pages/            route-level screens
  services/         Firebase logic and app services
    firebase/       Firebase config and auth helpers
  styles/           global CSS
  utils/            reusable helpers
```

## Notes for marking

The codebase is split so the main responsibilities stay easy to follow:

- Firebase work stays in the service layer
- streak logic is separated from UI
- components mostly focus on rendering and user interaction

That separation made it easier to keep adding features without the whole project turning into one giant page file.
