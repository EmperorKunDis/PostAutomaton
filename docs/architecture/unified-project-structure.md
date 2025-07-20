# Unified Project Structure

The following structure outlines the proposed monorepo setup using Nx, designed to efficiently manage the `web` (frontend), `api` (backend), `shared`, `ui` (shared components), and `infrastructure` packages.

```plaintext
internal-marketing-content-app/
├── .github/                    # CI/CD workflows for build and deployment automation
│   └── workflows/
│       ├── ci.yaml             # Continuous Integration pipeline
│       └── deploy.yaml         # Continuous Deployment pipeline
├── apps/                       # Contains deployable applications
│   ├── web/                    # Frontend application (React with TypeScript)
│   │   ├── src/
│   │   │   ├── assets/         # Static assets like images, fonts
│   │   │   ├── components/     # Reusable UI components (local to 'web' app)
│   │   │   ├── pages/          # Page components/routes (e.g., login, dashboard, content editor)
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── services/       # API client services for 'api' communication
│   │   │   ├── stores/         # State management (Zustand)
│   │   │   ├── styles/         # Global styles/themes (Tailwind CSS config, base styles)
│   │   │   └── utils/          # Frontend-specific utilities
│   │   ├── public/             # Static assets served directly (e.g., favicon.ico)
│   │   ├── tests/              # Frontend tests (Jest, React Testing Library)
│   │   └── project.json        # Nx project configuration for 'web'
│   └── api/                    # Backend application (NestJS with TypeScript)
│       ├── src/
│       │   ├── auth/           # Authentication and authorization modules
│       │   ├── common/         # Common DTOs, interfaces, interceptors, pipes
│   │   │   ├── companies/      # Module for company identification and management
│   │   │   ├── writer-profiles/ # Module for writer profile management
│   │   │   ├── content-plans/  # Module for annual content plan management
│   │   │   ├── blog-posts/     # Module for blog post generation and management
│   │   │   ├── social-media-posts/ # Module for social media post adaptation and management
│   │   │   ├── users/          # Module for user management and roles
│   │   │   ├── integrations/   # External AI and social media API integration clients
│   │   │   ├── database/       # Database connection and ORM configuration
│   │   │   ├── llm-service/    # Interface and interaction layer for on-premise LLM
│   │   │   └── main.ts         # Main application entry point
│       ├── tests/              # Backend tests (Jest, Supertest)
│       └── project.json        # Nx project configuration for 'api'
├── packages/                   # Contains shareable libraries
│   ├── shared/                 # Shared types, interfaces, and utilities
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces for data models (CompanyProfile, BlogPost, etc.)
│   │   │   ├── constants/      # Shared constants
│   │   │   └── utils/          # General shared utilities (e.g., date helpers)
│   │   └── project.json
│   ├── ui/                     # Shared UI component library (if distinct from 'web' local components)
│   │   ├── src/
│   │   │   ├── index.ts        # Export entry for shared components
│   │   │   └── components/     # Reusable components accessible by other apps in monorepo
│   │   └── project.json
│   └── config/                 # Shared configuration for linting, testing, etc.
│       ├── eslint/             # ESLint configurations
│       ├── typescript/         # TypeScript base configurations
│       └── jest/               # Jest base configurations
├── infrastructure/             # Infrastructure as Code definitions for Hetzner
│   ├── hetzner-cloud/          # Terraform/Ansible scripts for Hetzner VM/server provisioning
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── versions.tf
│   │   └── ansible/            # Ansible playbooks for server configuration
│   ├── docker-compose.yaml     # Local development setup with Docker Compose
│   └── kubernetes/             # Kubernetes manifests (if container orchestration is used)
├── scripts/                    # Monorepo-level scripts (e.g., bootstrap, build-all)
├── docs/                       # Project documentation
│   ├── prd.md                  # Product Requirements Document
│   ├── fullstack-architecture.md # Fullstack Architecture Document (this file)
│   └── diagrams/               # Folder for additional diagrams
├── .env.example                # Example environment variables
├── package.json                # Root package.json with Nx workspaces
├── nx.json                     # Nx workspace configuration
└── README.md                   # Root README for the monorepo
```
