# Testing Strategy

## Testing Pyramid

The testing strategy will adhere to the widely recognized testing pyramid model to ensure balanced and efficient testing across different layers.

```plaintext
      E2E Tests
     /         \
  Integration Tests
   /             \
Frontend Unit  Backend Unit
```

## Test Organization

This section defines how tests will be organized within the monorepo for both frontend and backend.

### Frontend Tests

```plaintext
apps/web/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.test.tsx  # Unit tests for Button component
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Dashboard.test.tsx # Unit tests for page components
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth/
│   │   │   ├── useAuth.ts
│   │   │   └── useAuth.test.ts # Unit tests for custom hooks
│   │   └── ...
│   ├── services/
│   │   ├── api.ts
│   │   └── api.test.ts # Unit tests for API client
│   └── ...
└── tests/                   # Top-level folder for Integration/E2E if not co-located
    ├── integration/
    │   └── login.integration.test.ts # Frontend integration tests
    └── e2e/ (or Cypress/Playwright outside apps/web)
        └── user-flow.spec.ts # E2E tests for key user journeys
```

*Rationale:* Co-locating unit tests with their respective components/modules promotes maintainability. A separate `tests` folder can house broader integration or E2E tests.

### Backend Tests

```plaintext
apps/api/
├── src/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── auth.service.test.ts # Unit tests for services
│   ├── companies/
│   │   ├── companies.controller.ts
│   │   ├── companies.controller.test.ts # Unit tests for controllers
│   │   ├── companies.service.ts
│   │   └── companies.service.test.ts
│   │   └── companies.repository.ts
│   │   └── companies.repository.test.ts # Unit tests for repositories
│   └── ...
└── tests/                   # Top-level folder for Integration tests
    └── integration/
        └── company.integration.test.ts # Backend integration tests (e.g., API endpoint tests)
```

*Rationale:* Similar to frontend, unit tests are co-located with modules. Integration tests that span multiple services or interact with the database are in a dedicated `integration` folder.

### E2E Tests

```plaintext