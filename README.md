# RoomieMatch

RoomieMatch is a Tinder-style web app that helps college students find compatible roommates. You sign in with Google, build a short profile, and start swiping: swipe right on someone and, if they swipe right on you back, the app opens a private real-time chat so you can actually talk about living together. It was built in 36 hours at **HackIllinois** by [Advait Tahilyani](https://github.com/AdvaitTahilyani), [Ishaan Goyal (@GoyalIshaan)](https://github.com/GoyalIshaan), and [@sh-crypto](https://github.com/sh-crypto).

## About the project

Finding a roommate in college is usually some mix of spreadsheets, Instagram DMs, and Facebook groups from 2013. The premise of RoomieMatch is simple: the "swipe through profiles and chat if it's mutual" interaction is already well understood by everyone in the target audience, so lean on that, strip it down to the fields that actually matter for living together, and skip the rest.

Because the project was built under a hard 36-hour deadline, the stack is deliberately boring: **Create React App** on the front end, **Firebase** for everything stateful on the back end (Auth, Firestore, Storage, Hosting), and a small set of well-maintained libraries for the swipe animation and UI chrome.

## Features

- **Google sign-in** — one tap, no extra account to create.
- **Onboarding flow** with profile photo upload (`/add-data`) that blocks access to the swipe deck until you've filled it in.
- **Swipe deck** powered by `react-tinder-card`, pulling every other user from Firestore in real time.
- **Profile details that actually matter** — cleanliness, sleep schedule (night owl / early bird), smoking, drinking, gender, country, university, and a free-form description.
- **Filters** so you can narrow the deck by lifestyle compatibility.
- **Profile viewer / editor** — tap a card to see a full profile, or open your own page to edit it and re-upload your photo.
- **Mutual-match detection** — a swipe right + swipe right automatically creates a shared chat document.
- **Real-time 1:1 chat** over Firestore's `onSnapshot`, with message history persisted on the chat doc.
- **Route protection** — unauthenticated users land on `/login`; authenticated users who haven't onboarded are pushed to `/add-data`.

## Tech Stack

| Layer | Choice |
| --- | --- |
| UI | React 18, MUI 5, Emotion |
| Routing | `react-router-dom` 6 |
| Swipe UX | `react-tinder-card` (backed by `@react-spring/web`) |
| Build | `react-scripts` (Create React App) |
| Auth | Firebase Authentication — Google provider |
| Database | Cloud Firestore (realtime, via `onSnapshot`) |
| File storage | Firebase Storage (profile photos) |
| Hosting | Firebase Hosting (SPA rewrite to `index.html`) |
| Session hooks | `react-firebase-hooks` |

## Project Structure

```
RoomieMatch/
├── public/                     # CRA static shell (logo, manifest, favicon)
├── src/
│   ├── index.js                # React root
│   ├── App.js                  # Routes + auth gating
│   ├── firebase.js             # Firebase app / Firestore / Auth exports
│   ├── signin.js               # Google sign-in + user doc bootstrap
│   ├── ProtectedRoute.js       # Redirects unauthenticated users
│   ├── AddDataPage.js          # First-run onboarding form + photo upload
│   ├── TindersCards.js         # Main swipe deck, filters, popup
│   ├── SwipeButtons.js         # Alternate swipe controls
│   ├── ProfileDisplayPopup.js  # Card-tap profile modal
│   ├── Profile.js              # Profile editor
│   ├── ProfileDisplay.js       # Read-only profile view
│   ├── Chats.js                # Chat list
│   ├── ChatScreen.js           # Individual conversation
│   ├── Chat.js / Header*.js    # Presentational chrome
│   └── *.css
├── functions/                  # Firebase Functions boilerplate (unused)
├── firestore.rules
├── storage.rules
├── database.rules.json
├── firebase.json
└── .firebaserc
```

## Data Model (Firestore)

```
users/{uid}
  email: string
  fullName, description, gender, country, university
  cleanlinessLevel, smoke, alcohol, sleep
  imageUrl: string (Firebase Storage URL)
  likes: string[]                 # uids this user has swiped right on
  hasCompletedOnboarding: boolean

chats/{autoId}
  users: [uidA, uidB]             # sorted pair
  messages: [
    { senderId, message, timestamp }
  ]
  createdAt: timestamp
```

A **match** is a symmetric pair of `likes[]` entries. The chat document is created the moment a match is detected, not on the first message.

## Prerequisites

- **Node.js 18+** and **npm**
- A **Firebase project** with:
  - Authentication enabled for the **Google** provider
  - **Cloud Firestore** enabled
  - **Firebase Storage** enabled
- The **Firebase CLI** if you plan to deploy (`npm install -g firebase-tools`)

## Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/AdvaitTahilyani/RoomieMatch.git
   cd RoomieMatch
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a Firebase project** and enable Auth (Google), Firestore, and Storage from the Firebase console.

4. **Configure Firebase credentials.** The committed `src/firebase.js` hard-codes a config object; replace it with your own, and ideally move the values behind `REACT_APP_*` environment variables in a `.env.local`:

   ```env
   REACT_APP_FIREBASE_API_KEY=...
   REACT_APP_FIREBASE_AUTH_DOMAIN=...
   REACT_APP_FIREBASE_PROJECT_ID=...
   REACT_APP_FIREBASE_STORAGE_BUCKET=...
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
   REACT_APP_FIREBASE_APP_ID=...
   ```

5. **Deploy sensible security rules.** The rules committed here are hackathon-era — `firestore.rules` has an expired open-access rule and `storage.rules` currently denies everything. Before running the app:

   - Update `firestore.rules` to scope reads/writes to `auth.uid`-owned docs and to chats whose `users` array contains the caller.
   - Update `storage.rules` to allow authenticated users to write to `images/...` and `profileImages/{uid}/...`.
   - Publish: `firebase deploy --only firestore:rules,storage`.

6. **Run the dev server**

   ```bash
   npm start
   ```

   The app opens at `http://localhost:3000`.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Run the CRA dev server with hot reload. |
| `npm run build` | Produce an optimized production build in `build/`. |
| `npm test` | Run the CRA test runner (no tests ship with the repo yet). |
| `firebase deploy --only hosting` | Ship `build/` to Firebase Hosting. |

## Deployment

`firebase.json` is already pointed at a `public` directory with SPA rewrites. A typical deploy is:

```bash
npm run build
# CRA outputs to build/ — either update firebase.json "public" to "build"
# or copy build/* into public/ before deploying.
firebase deploy
```

## Known Limitations

RoomieMatch was built in 36 hours. A few rough edges are worth flagging:

- **Swipe index vs filtered deck** — the swipe handler resolves the target user from the unfiltered list using a reversed index, so applying filters can desync which profile you think you just swiped. A small refactor to look up the user by `id` on the card itself fixes this.
- **Filter key naming** is inconsistent between the profile schema (`sleep`, `alcohol`) and a couple of filter state variables (`sleepingHabits`, `alcoholConsumption`).
- **Chat messages live on the chat document** as a growing array. Fine for a hackathon demo, not great past a few hundred messages; move them to a subcollection for production.
- **Firestore / Storage rules as committed are not safe** — they need to be tightened before the app is deployed anywhere public (see step 5 above).
- **Firebase config is hard-coded** in `src/firebase.js`. Rotate the API key and move the values to env vars before making the repo public-facing.

## Credits

Built at **HackIllinois** by:

- [Advait Tahilyani](https://github.com/AdvaitTahilyani)
- [Ishaan Goyal](https://github.com/GoyalIshaan)
- [@sh-crypto](https://github.com/sh-crypto)

36 hours, a lot of coffee, and exactly one working roommate-matching algorithm.
