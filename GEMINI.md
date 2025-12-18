# Gemini Code Assistant Context

## Project Overview

This project is a comprehensive English language learning ecosystem designed to help users master the 3000 most common English words from the Oxford Dictionary. It consists of two main components:

1.  **Web Application (Quiz):** A web-based quiz application with a Tinder-style card interface. Users can swipe right for words they know and left for words they don't. The application tracks progress, provides statistics, and saves results to the browser's LocalStorage.
2.  **Telegram Bot (Spaced Repetition):** A Telegram bot designed for interval-based learning. It takes the list of unknown words from the web application and automatically sends them to the user for review based on a spaced repetition algorithm.

The front-end is built with **React** and **TypeScript**, using **Vite** as a build tool. It uses **Ant Design** for UI components.

## Building and Running the Project

The web application is located in the `apps/web` directory.

### Key Commands:

*   **Install Dependencies:**
    ```bash
    npm install
    ```
*   **Run in Development Mode:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically available at `http://localhost:5173`.

*   **Build for Production:**
    ```bash
    npm run build
    ```
    This command type-checks the code and bundles the application for production into the `apps/web/dist` directory.

*   **Lint the Code:**
    ```bash
    npm run lint
    ```
    This command runs ESLint to check for code quality and style issues.

*   **Preview Production Build:**
    ```bash
    npm run preview
    ```
    This command serves the production build locally to test it before deployment.

## Development Conventions

*   **Technology Stack:** The project uses React with TypeScript.
*   **Styling:** Component-specific CSS files are used for styling.
*   **State Management:** The main application state is managed through React Context (`AppContext.tsx`).
*   **Data Persistence:** User progress (known/unknown words) is stored in the browser's LocalStorage via a dedicated `storageService.ts`.
*   **Code Quality:** ESLint is configured for linting. The configuration can be found in `apps/web/eslint.config.js`.
