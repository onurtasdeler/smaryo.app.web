# Project Context: verifynumber-web

## Overview
`verifynumber-web` is a modern web application built with Next.js 15, designed to provide SMS verification services. It appears to be a frontend interface for purchasing and managing virtual phone numbers, likely integrating with the **5sim.net** API for number provisioning and **Firebase** for user authentication and data persistence.

## Tech Stack
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, Radix UI (primitives), Lucide React (icons)
*   **State Management:** Zustand, TanStack Query (React Query)
*   **Backend Integration:** Firebase (Authentication, Realtime Database), 5sim.net API (SMS services)
*   **Payment:** Polar
*   **Internationalization:** i18next
*   **Validation:** Zod

## Project Structure
The project follows a standard Next.js App Router structure within the `src` directory:

*   `src/app`: Contains the application routes and layouts.
    *   `(auth)`: Route group for authentication pages (`login`, `register`).
    *   `(dashboard)`: Route group for authenticated user pages (`activation`, `dashboard`, `history`, `settings`, `topup`).
    *   `api`: API routes (e.g., `checkout`).
*   `src/components`: Reusable UI components and providers.
*   `src/contexts`: React contexts, primarily `AuthContext` for managing user sessions.
*   `src/lib`: Utility libraries and configurations, including `firebase.ts` for Firebase initialization.
*   `src/types`: TypeScript type definitions, notably `fivesim.ts` which maps the external SMS API.

## Key Features
*   **Authentication:** User registration and login powered by Firebase Auth.
*   **Dashboard:** A protected area for users to manage their account and services.
*   **Number Activation:** Interface for purchasing virtual numbers and receiving SMS codes (`activation` page).
*   **Top-up:** Functionality to add funds to the user's account (`topup` page), potentially using Polar.
*   **History:** View past activations and transactions.
*   **Settings:** User profile management.

## Development
### Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn

### Environment Variables
The application requires specific environment variables to function. Refer to `.env.example` for the required keys:
*   **Firebase:** `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, etc.
*   **Polar:** `POLAR_API_KEY`, `POLAR_PRODUCT_ID`, `POLAR_WEBHOOK_SECRET`.
*   **App:** `NEXT_PUBLIC_APP_URL`.

### Commands
*   **Start Development Server:** `npm run dev`
*   **Build for Production:** `npm run build`
*   **Start Production Server:** `npm run start`
*   **Lint Code:** `npm run lint`
*   **Type Check:** `npm run type-check`

## Conventions
*   **Component Location:** Reusable components should be placed in `src/components`. Page-specific logic resides in `src/app`.
*   **Typing:** Strict TypeScript usage is encouraged. Domain-specific types (like 5sim) are centralized in `src/types`.
*   **Styling:** Use Tailwind CSS utility classes for styling. Complex UI patterns often leverage Radix UI primitives.
*   **State:** Global client state is managed via Zustand or React Context. Server state is handled by React Query.
