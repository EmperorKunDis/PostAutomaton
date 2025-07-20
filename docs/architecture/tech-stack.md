# Tech Stack

## Cloud Infrastructure

  * **Provider:** Hetzner (Self-Managed / Bare Metal / Cloud Servers)
  * **Key Services:** Virtual Machines / Bare Metal Servers, Containerization (Docker/Kubernetes), Object Storage (Hetzner Storage Box or S3-compatible service), Load Balancer (Hetzner Load Balancer or Nginx/HAProxy), Monitoring & Logging (Prometheus/Grafana stack, ELK stack).
  * **Deployment Host and Regions:** Hetzner data center in Germany (e.g., Falkenstein, Nuremberg, Helsinki) for minimizing latency.

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|---|---|---|---|---|
| **Frontend Language** | TypeScript | Latest LTS (e.g., 5.x) | Primary development language for the frontend. | Strong typing, excellent tooling, widespread adoption in modern web development. |
| **Frontend Framework** | React | Latest LTS (e.g., 18.x) | User interface development. | Component-based, large ecosystem, strong community support, highly performant for interactive UIs. |
| **UI Component Library** | Material-UI (MUI) or Ant Design | Latest Stable | Pre-built UI components for rapid development and consistent design. | Provides a comprehensive set of accessible and customizable components, aligns with modern design principles. |
| **State Management** | Zustand or React Query | Latest Stable | Efficient state management for frontend. | Zustand for simple, fast global state; React Query for server state management (fetching, caching, syncing). Lightweight and effective. |
| **Backend Language** | TypeScript | Latest LTS (e.g., 5.x) | Primary development language for backend services. | Consistency with frontend, strong typing benefits, active Node.js ecosystem. |
| **Backend Framework** | NestJS | Latest Stable (e.g., 10.x) | Backend application framework. | Enterprise-ready, modular, strong Dependency Injection, excellent for building scalable APIs, good alignment with TypeScript. |
| **API Style** | RESTful API | N/A | Communication between frontend, backend, and external services. | Widely adopted, flexible, and well-understood for building robust APIs. |
| **Database** | PostgreSQL | Latest Stable (e.g., 16.x) | Primary relational database for structured data (user profiles, content metadata). | Robust, open-source, highly reliable, excellent for complex queries and data integrity. |
| **Cache** | Redis | Latest Stable | In-memory data store for caching, session management. | High performance, versatile, commonly used for reducing database load and speeding up read operations. |
| **File Storage** | Hetzner Storage Box or S3-compatible service | N/A | Storage for generated content, media assets, etc. | Scalable, reliable object storage solution within Hetzner ecosystem or compatible with it. |
| **Authentication** | OAuth 2.0 / OpenID Connect | N/A | Secure user authentication and authorization. | Standardized, robust, supports SSO integration with company credentials as per PRD. |
| **Frontend Testing** | Jest & React Testing Library | Latest Stable | Unit and integration testing for frontend components. | Fast, widely used, encourages testing components in a user-centric way. |
| **Backend Testing** | Jest (with Supertest for API) | Latest Stable | Unit and integration testing for backend services and APIs. | Consistent testing framework with frontend, Supertest for effective API testing. |
| **E2E Testing** | Cypress or Playwright | Latest Stable | End-to-end testing for critical user flows. | Provides robust browser automation for comprehensive full-stack testing. |
| **Build Tool (FE/BE)** | Nx (Monorepo Tool) | Latest Stable | Orchestrates builds across frontend and backend projects within the monorepo. | Simplifies build processes, caching, and task execution in a monorepo setup. |
| **Bundler (FE)** | Webpack (managed by Next.js/Nx) | N/A | Bundles frontend assets for deployment. | Standard for React applications, optimized for performance. |
| **IaC Tool** | Terraform or Ansible | Latest Stable | Infrastructure as Code for provisioning and managing Hetzner resources. | Terraform for declarative infrastructure, Ansible for configuration management. |
| **CI/CD** | GitLab CI/CD or Jenkins | N/A | Automates build, test, and deployment pipelines. | Flexible, widely adopted, integrates well with self-hosted environments. |
| **Monitoring** | Prometheus & Grafana | Latest Stable | Collects and visualizes metrics for system health and performance. | Powerful open-source stack for comprehensive monitoring. |
| **Logging** | ELK Stack (Elasticsearch, Logstash, Kibana) | Latest Stable | Centralized logging solution for all application and server logs. | Robust for log aggregation, analysis, and visualization. |
| **CSS Framework** | Tailwind CSS | Latest Stable | Utility-first CSS framework for rapid UI development. | Highly customizable, efficient for responsive design, encourages consistent styling. |
