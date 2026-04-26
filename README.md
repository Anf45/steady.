# steady.

`steady.` is a gamified habit tracker built with React and Firebase. The main idea is to make habit building feel a bit more rewarding through streaks, XP, levels, badges, teams, and simple progress visuals.

## What the app does

- lets users sign up and log in
- lets users create, edit, archive, restore, and delete habits
- supports repeat targets for habits that need more than one completion in a day
- gives XP based on habit difficulty:
  - `easy` = `10 XP`
  - `medium` = `20 XP`
  - `hard` = `30 XP`
- tracks streaks, check-ins, levels, and titles
- shows badges and locked badge goals
- shows the next unlock so users can see what they are working toward
- includes team themes:
  - `Earth`
  - `Fire`
  - `Ice`
  - `Air`
- shows dashboard analytics and progress cards

## Running it locally

### 1. Install packages

```bash
npm install
```

### 2. Create `.env`

```bash
cp .env.example .env
```

Then add your Firebase values.

### 3. Firebase variables needed

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

What they are for:

- `VITE_FIREBASE_API_KEY` = web app API key
- `VITE_FIREBASE_AUTH_DOMAIN` = auth domain
- `VITE_FIREBASE_PROJECT_ID` = Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` = storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` = sender ID
- `VITE_FIREBASE_APP_ID` = web app ID

If these are missing, the app shows a clear Firebase setup error when those features are used.

### 4. Start the app

```bash
npm run dev
```

Other useful commands:

```bash
npm run build
npm run preview
```

## Using `.env.example`

`.env.example` is just a guide file. It does not contain real secrets.

Normal setup:

1. copy `.env.example` to `.env`
2. paste in your Firebase project values
3. restart the dev server

## Quick marker test flow

1. start the app with valid Firebase values
2. create an account
3. choose a team
4. create a habit
5. check in on it
6. confirm XP and streak values change
7. open the habit details page
8. edit the habit
9. archive it, then restore it
10. open the profile page and check badges, level, and summary info
11. log out and confirm protected pages send you back to auth

## What is not in the project yet

- no password reset flow
- no reminders or notifications
- no social features or leaderboard
- no calendar-style habit history
- no automated test suite yet

## Project structure

```text
src/
  app/            providers and route setup
  components/     reusable UI pieces
  hooks/          custom hooks
  pages/          route-level pages
  services/       Firebase logic and app logic
  styles/         global CSS
  utils/          helper functions
```

## Final note

The code is split so Firebase work stays in services, streak logic stays separate, and the pages mostly focus on UI. That made the project much easier to build, test, and keep organised as more features were added.
