# steady.

`steady.` is a gamified habit tracker built with React and Firebase. The main idea is to make habit building feel a bit more rewarding through streaks, XP, levels, badges, teams, and simple progress visuals.

https://www.youtube.com/watch?v=XvD9Y5s5Gyc

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

### 1. Clone the project

```bash
git clone https://github.com/Anf45/steady.
cd steady.
```

### 2. Install packages

```bash
npm install
```

### 3. Create `.env`

```bash
cp .env.example .env
```

If `cp` does not work on the machine being used, just create a `.env` file manually and copy the variable names from `.env.example`.

### 4. Set up Firebase first

The app will not work properly without a Firebase project connected to it.

Create a Firebase project and do these steps in the Firebase console:

1. create a new Firebase project
2. add a **Web App** inside the project
3. enable **Authentication**
4. enable **Email/Password** sign-in
5. create a **Firestore Database**
6. copy the web app config values into `.env`

### 5. Firebase variables needed

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

### 6. Firestore rules for testing

For this project to work, signed in users need permission to read and write their own data.

These rules are enough for local testing:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Start the app

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
4. make sure Firebase Auth and Firestore are enabled

## Quick test

There are no shared test credentials included with this project, so the marker should create a new account when testing it.

1. clone the repo and install packages
2. add Firebase values to `.env`
3. enable Email/Password auth and Firestore
4. start the app
5. create an account
6. choose a team
7. create a habit
8. check in on it
9. confirm XP and streak values change
10. open the habit details page
11. edit the habit
12. archive it, then restore it
13. open the profile page and check badges, level, and summary info
14. log out and confirm protected pages send you back to auth

## What is not in the project yet

- no password reset 
- no reminders or notifications
- no social features or leaderboard
- no calendar style habit history
- no automated test

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
