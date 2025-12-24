# Gemini Code Assistant Context

## Project Overview

This project is a comprehensive English language learning ecosystem built as a **monorepo using Nx and pnpm**. It is designed to help users master the 3000 most common English words.

The monorepo contains the following packages:

-   `apps/web`: A React + Vite web application that provides a Tinder-style quiz for vocabulary testing.
-   `packages/shared-data`: A shared library that contains the JSON data for the 3000 English words.

The goal is to create an integrated system where a web app and potentially other applications (like a Telegram bot) can share code, types, and data.

## Building and Running the Project

This is an Nx-managed monorepo. All commands should be run from the **root directory**.

### Key Commands:

-   **Install Dependencies:**
    ```bash
    pnpm install
    ```
    This command installs dependencies for all packages in the workspace.

-   **Run the Web App in Development Mode:**
    ```bash
    pnpm nx serve web
    ```
    This will start the Vite development server for the `web` app, typically available at `http://localhost:5173`.

-   **Build a Package:**
    You can build any package (app or library) using the `build` command. For example, to build the `shared-data` library:
    ```bash
    pnpm nx build @ai-workshop/shared-data
    ```
    To build the web app for production:
    ```bash
    pnpm nx build web
    ```
    This command bundles the application into the `dist/apps/web` directory.

-   **Linting:**
    To lint a specific project:
    ```bash
    pnpm nx lint web
    ```
    To lint the entire workspace:
    ```bash
    pnpm nx run-many --target=lint
    ```

### Viewing the Project Graph

Nx can visualize the dependencies between all the packages in the workspace. This is very useful for understanding the architecture.
```bash
pnpm nx graph
```
This will open a dependency graph in your browser.

## Development Conventions

-   **Monorepo Management:** The project is managed by Nx and uses `pnpm` for package management.
-   **Shared Code:** Common code, data, or types that need to be used across multiple applications should be placed in libraries inside the `packages/` directory.
-   **Technology Stack:**
    -   **Web App:** React, TypeScript, Vite
    -   **UI:** Ant Design
-   **Code Quality:** ESLint is configured and managed by Nx. Configuration can be found in the root `.eslintrc.json` and is extended in project-specific configs.
-   **TypeScript Paths:** Path aliases (e.g., `@ai-workshop/shared-data`) are managed by Nx and defined in the root `tsconfig.base.json`. This allows for clean, direct imports between packages.