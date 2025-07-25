# Internal Marketing Content App Fullstack Architecture Document

## Table of Contents

- [Internal Marketing Content App Fullstack Architecture Document](#table-of-contents)
  - [Introduction](./introduction.md)
    - [Intro Content](./introduction.md#intro-content)
    - [Starter Template or Existing Project](./introduction.md#starter-template-or-existing-project)
    - [Change Log](./introduction.md#change-log)
  - [High Level Architecture](./high-level-architecture.md)
    - [Technical Summary](./high-level-architecture.md#technical-summary)
    - [Platform and Infrastructure Choice (Revised)](./high-level-architecture.md#platform-and-infrastructure-choice-revised)
    - [Repository Structure](./high-level-architecture.md#repository-structure)
    - [High Level Architecture Diagram](./high-level-architecture.md#high-level-architecture-diagram)
    - [Architectural and Design Patterns](./high-level-architecture.md#architectural-and-design-patterns)
  - [Tech Stack](./tech-stack.md)
    - [Cloud Infrastructure](./tech-stack.md#cloud-infrastructure)
    - [Technology Stack Table](./tech-stack.md#technology-stack-table)
  - [Data Models](./data-models.md)
    - [Company Profile](./data-models.md#company-profile)
    - [Writer Profile](./data-models.md#writer-profile)
    - [Content Plan](./data-models.md#content-plan)
    - [Blog Post](./data-models.md#blog-post)
    - [Social Media Post](./data-models.md#social-media-post)
    - [User](./data-models.md#user)
  - [Components](./components.md)
    - [Fullstack Application (Main Monorepo Components)](./components.md#fullstack-application-main-monorepo-components)
      - [web (Frontend Application)](./components.md#web-frontend-application)
      - [api (Backend Application/Services)](./components.md#api-backend-applicationservices)
      - [shared (Shared Library)](./components.md#shared-shared-library)
      - [ui (Shared UI Components - Optional, if custom design system is extensive)](./components.md#ui-shared-ui-components-optional-if-custom-design-system-is-extensive)
      - [infrastructure (IaC Definitions)](./components.md#infrastructure-iac-definitions)
    - [Component Interaction Diagram](./components.md#component-interaction-diagram)
  - [External APIs](./external-apis.md)
    - [External AI Model Integrations](./external-apis.md#external-ai-model-integrations)
      - [Claude API](./external-apis.md#claude-api)
      - [Gemini API](./external-apis.md#gemini-api)
      - [ChatGPT API](./external-apis.md#chatgpt-api)
    - [Social Media Platform Integrations (for Analytics & Publishing)](./external-apis.md#social-media-platform-integrations-for-analytics-publishing)
      - [LinkedIn API](./external-apis.md#linkedin-api)
      - [Meta (Facebook/Instagram) Graph API](./external-apis.md#meta-facebookinstagram-graph-api)
      - [X (Twitter) API](./external-apis.md#x-twitter-api)
  - [Core Workflows](./core-workflows.md)
    - [1. Company Identification & Context Gathering Workflow](./core-workflows.md#1-company-identification-context-gathering-workflow)
    - [2. Annual Content Plan & Blog Post Generation Workflow](./core-workflows.md#2-annual-content-plan-blog-post-generation-workflow)
    - [3. Blog Post to Social Media Adaptation & Preview Workflow](./core-workflows.md#3-blog-post-to-social-media-adaptation-preview-workflow)
  - [Database Schema](./database-schema.md)
  - [Unified Project Structure](./unified-project-structure.md)
  - [Development Workflow](./development-workflow.md)
    - [Local Development Setup](./development-workflow.md#local-development-setup)
      - [Prerequisites](./development-workflow.md#prerequisites)
      - [Initial Setup](./development-workflow.md#initial-setup)
      - [Development Commands](./development-workflow.md#development-commands)
    - [Environment Configuration](./development-workflow.md#environment-configuration)
      - [Required Environment Variables](./development-workflow.md#required-environment-variables)
  - [Deployment Architecture](./deployment-architecture.md)
    - [Deployment Strategy](./deployment-architecture.md#deployment-strategy)
    - [CI/CD Pipeline](./deployment-architecture.md#cicd-pipeline)
    - [Environments](./deployment-architecture.md#environments)
  - [Security and Performance](./security-and-performance.md)
    - [Security Requirements](./security-and-performance.md#security-requirements)
    - [Performance Optimization](./security-and-performance.md#performance-optimization)
  - [Testing Strategy](./testing-strategy.md)
    - [Testing Pyramid](./testing-strategy.md#testing-pyramid)
    - [Test Organization](./testing-strategy.md#test-organization)
      - [Frontend Tests](./testing-strategy.md#frontend-tests)
      - [Backend Tests](./testing-strategy.md#backend-tests)
      - [E2E Tests](./testing-strategy.md#e2e-tests)
    - [Test Examples](./testing-strategy.md#test-examples)
      - [Frontend Component Test](./testing-strategy.md#frontend-component-test)
      - [Backend API Test](./testing-strategy.md#backend-api-test)
      - [E2E Test](./testing-strategy.md#e2e-test)
    - [Testing Best Practices](./testing-strategy.md#testing-best-practices)
  - [Coding Standards](./coding-standards.md)
    - [Critical Fullstack Rules](./coding-standards.md#critical-fullstack-rules)
    - [Naming Conventions](./coding-standards.md#naming-conventions)
  - [Error Handling Strategy](./error-handling-strategy.md)
    - [Error Flow](./error-handling-strategy.md#error-flow)
    - [Error Response Format](./error-handling-strategy.md#error-response-format)
    - [Frontend Error Handling](./error-handling-strategy.md#frontend-error-handling)
    - [Backend Error Handling](./error-handling-strategy.md#backend-error-handling)
  - [Monitoring and Observability](./monitoring-and-observability.md)
    - [Monitoring Stack](./monitoring-and-observability.md#monitoring-stack)
    - [Key Metrics](./monitoring-and-observability.md#key-metrics)
  - [Checklist Results Report](./checklist-results-report.md)
  - [Next Steps](./next-steps.md)
    - [Architect Prompt](./next-steps.md#architect-prompt)
