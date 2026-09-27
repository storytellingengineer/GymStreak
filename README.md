# GymStreak

GymStreak is a local-first fitness app focused on **consistent training, measurable progression, and daily streaks**.

The current release is a React/Vite MVP designed to work as a responsive web app and installable PWA. The product roadmap will evolve it into a mobile fitness application with cloud sync, notifications, a native Android widget, and an optional AI coaching layer.

## Current Status

**MVP: Active development**

The current application includes the core workout loop:

**Today → Start Workout → Log Sets → Finish → Streak → History → Progress**

The app is currently deployed through Vercel from the `main` branch.

## Features

### Training
- Push / Pull / Legs workout rotation
- Recommended workout for the day
- Workout session timer
- Exercise-level set tracking
- Weight and reps logging
- Previous working-weight prefill
- Set completion tracking
- Workout completion flow

### Streak & History
- Calendar-based daily streak
- Weekly consistency view
- Workout history
- Session duration
- Training volume calculation
- Last-7-days session count

### Progress
- Total training volume
- Total sessions
- Recent session-volume chart
- Exercise-level personal bests
- Latest logged weight and reps

### Coach
- Deterministic training guidance foundation
- Current streak context
- Last-workout context
- Recommendation entry point

The coach is intentionally rule-based for the MVP. A secure LLM-backed coach will be added later.

### Personalization
- User name
- Primary training goal
- kg / lb preference
- Local profile persistence

### PWA / Offline Foundation
- Installable PWA foundation
- Service worker
- LocalStorage persistence
- Offline-state indicator
- Browser-local workout data
- Install prompt when supported

## Tech Stack

- **React 19**
- **Vite 7**
- **JavaScript / JSX**
- **Lucide React**
- **CSS**
- **LocalStorage**
- **Service Worker / PWA**
- **GitHub**
- **Vercel**

## Architecture

### Current

```text
React + Vite
     |
     +-- Workout Engine
     +-- Streak Engine
     +-- Progress Engine
     +-- Coach Rules
     +-- LocalStorage
     +-- PWA Service Worker
```

The current version is intentionally local-first. No user account or cloud database is required to use the MVP.

### Target Architecture

```text
                 GymStreak App
                      |
          +-----------+-----------+
          |                       |
       Web/PWA              Mobile Shell
          |                       |
          |                  Android / iOS
          |                       |
          +-----------+-----------+
                      |
                 API / Backend
                      |
             +--------+--------+
             |                 |
          Database          AI Coach
             |                 |
        Cloud Sync       Secure LLM API
             |
       User Progress
```

## Android Widget

A real Android home-screen widget is **not possible with Vercel/web code alone**.

The planned architecture is:

- React/Vite application for the main product
- Capacitor or native Android layer for mobile packaging
- Native Android App Widget
- Shared workout/streak data between the app and widget

Planned widget formats:

- **Small:** current streak
- **Medium:** streak + today's workout + start action
- **Large:** streak + today's mission + workout details

## Roadmap

### Phase 1 — Foundation
- [x] React/Vite application
- [x] Push/Pull/Legs rotation
- [x] Daily streak
- [x] Workout timer
- [x] Set logging
- [x] Workout history
- [x] Volume tracking
- [x] Progress dashboard
- [x] Personal bests
- [x] Basic coach
- [x] Settings/profile
- [x] PWA foundation
- [x] GitHub source control
- [x] Vercel deployment

### Phase 2 — Personalization & Progression
- [ ] Progressive overload engine
- [ ] Recovery-aware recommendations
- [ ] Exercise substitutions
- [ ] Rest timer
- [ ] More training programs
- [ ] Goal-specific plans
- [ ] Better analytics
- [ ] PR detection and achievement system

### Phase 3 — Cloud
- [ ] Authentication
- [ ] Cloud database
- [ ] Cross-device sync
- [ ] Backup/restore
- [ ] User profile backend

### Phase 4 — Mobile
- [ ] Android/iOS shell
- [ ] Push notifications
- [ ] Background reminders
- [ ] Native storage integration
- [ ] App-store ready builds

### Phase 5 — Native Widget
- [ ] Android home-screen widget
- [ ] Live streak state
- [ ] Today's workout
- [ ] Quick-start action
- [ ] Widget data synchronization

### Phase 6 — AI Coach
- [ ] Secure backend AI gateway
- [ ] Training-plan reasoning
- [ ] Recovery-aware recommendations
- [ ] Exercise substitutions
- [ ] Natural-language workout questions
- [ ] LLM evaluation and observability

### Phase 7 — Product Layer
- [ ] Goals
- [ ] Achievements
- [ ] Milestones
- [ ] Weekly summaries
- [ ] Progress insights
- [ ] Retention features

## Local Development

Clone the repository:

```bash
git clone https://github.com/storytellingengineer/GymStreak.git
cd GymStreak
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Data Model

Workout history currently follows a lightweight local structure:

```text
Workout
├── id
├── date
├── type
├── duration
└── sets
    ├── exercise
    ├── weight
    └── reps
```

The local data model is designed to be migrated to a backend schema during the cloud-sync phase.

## Repository

GitHub:

https://github.com/storytellingengineer/GymStreak

## Product Direction

GymStreak is being built around one core principle:

> **Make showing up easy, make progress visible, and make consistency rewarding.**

The MVP proves the core workout loop first. Infrastructure, mobile capabilities, intelligent coaching, and deeper product features will be layered on top of that foundation.
