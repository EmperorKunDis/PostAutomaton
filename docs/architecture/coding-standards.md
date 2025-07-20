# Coding Standards

These standards are **MANDATORY** for AI agents and human developers alike. They focus only on critical rules needed to prevent common pitfalls and ensure consistency across the codebase. Overly detailed or obvious standards (like "use SOLID principles") are omitted to avoid bloating context and slowing development, as we assume the AI already knows general best practices.

## Critical Fullstack Rules

  * **Type Sharing:** Always define shared TypeScript types and interfaces in `packages/shared/src/types/` and import them from there for both frontend and backend applications. This ensures type consistency across the full stack.
  * **API Calls:** Frontend applications should never make direct HTTP calls. All API interactions must go through the dedicated API service layer (e.g., `apps/web/src/services/`).
  * **Environment Variables:** Access sensitive configuration values only through a centralized configuration service or object. Never access `process.env` directly in application code. This promotes secure secrets management.
  * **Error Handling:** All API routes and critical backend services must use the standard error handling mechanism defined in the architecture. Frontend should also implement the unified error handling strategy.
  * **State Updates:** Frontend state should never be mutated directly. Always use the proper state management patterns (e.g., Zustand's setters, React Query's invalidation/setQueryData).
  * **Database Interactions:** Backend services should interact with the database only through the defined data access layer (e.g., Repository Pattern). Direct ORM calls outside of the repository should be avoided.
  * **Logging:** Use the defined logging library and adhere to its standards (levels, format, required context). Avoid `console.log` in production code.

## Naming Conventions

This table outlines key naming conventions specific to our project where clarity and consistency are paramount.

| Element | Frontend Convention | Backend Convention | Example |
|---|---|---|---|
| **Components** | `PascalCase` | - | `UserProfile.tsx`, `ContentCard.tsx` |
| **Hooks** | `camelCase` with `use` prefix | - | `useAuth.ts`, `useContentPlan.ts` |
| **API Routes** | - | `kebab-case` | `/api/user-profiles`, `/api/blog-posts` |
| **Database Tables** | - | `snake_case` | `user_profiles`, `social_media_posts` |
| **Interfaces/Types (Shared)** | `PascalCase` with `I` prefix (optional but common) or no prefix | `PascalCase` with `I` prefix (optional but common) or no prefix | `ICompanyProfile.ts`, `BlogPost.ts` |
| **Services (FE/BE)** | `camelCase` ending in `Service` | `camelCase` ending in `Service` | `authService.ts`, `companyService.ts` |
| **Modules (NestJS)** | - | `camelCase` | `AuthModule`, `CompaniesModule` |
