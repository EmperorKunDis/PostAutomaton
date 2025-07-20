# Internal Marketing Content App Fullstack Architecture Document

## Introduction

### Intro Content

This document outlines the overall project architecture for the Internal Marketing Content App, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack. This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

I have reviewed the PRD and brainstorming brief for any mentions of starter templates or existing codebases. Based on the information, it appears this is a Greenfield project with no specific starter template mentioned.

Therefore, we will proceed with architecture design from scratch, noting that all tooling, bundling, and configuration will need manual setup.

### Change Log

| Date | Version | Description | Author |
|---|---|---|---|
| 2025-07-20 | 1.0 | Initial draft based on PRD | Winston, Architect |

## High Level Architecture

### Technical Summary

The system will leverage a hybrid service architecture, combining a monolithic approach for the core on-premise LLM and content generation with microservices/serverless functions for external AI integrations and ancillary services. It will utilize a monorepo structure to streamline full-stack development. The architecture prioritizes scalability, security, and maintainability, ensuring efficient content generation and seamless integration with various social media platforms and external tools.

### Platform and Infrastructure Choice (Revised)

Based on the clarification that you have **your own servers on Hetzner**, we will pivot the infrastructure strategy to leverage this existing resource. This offers benefits in terms of cost control and direct control over hardware, aligning with the on-premise LLM requirement.

* **Provider:** Hetzner (Self-Managed / Bare Metal / Cloud Servers)
* **Key Services:**
    * **Virtual Machines / Bare Metal Servers:** For hosting the core on-premise LLM, backend services (Node.js/TypeScript), and the database.
    * **Containerization (e.g., Docker/Kubernetes):** Highly recommended for deploying backend services and potentially the LLM for efficient resource management, scalability, and easier deployment/orchestration on Hetzner servers.
    * **Object Storage (e.g., Hetzner Storage Box or S3-compatible service):** For the content library (generated blog posts, social posts, visuals).
    * **Load Balancer (e.g., Hetzner Load Balancer or Nginx/HAProxy):** For distributing traffic to backend services and ensuring high availability.
    * **Managed Database (if available/desired from Hetzner) or Self-Hosted Database:** For the primary database.
    * **Monitoring & Logging (e.g., Prometheus/Grafana stack, ELK stack):** For observability of all services and the LLM.
    * **VPN/Secure Tunnel:** For secure connectivity between your internal network (where users might be, or your N8N server) and the Hetzner servers if needed, or secure access for management.
* **Deployment Host and Regions:** Given your current location in Cheb, Karlovy Vary Region, Czechia, a Hetzner data center in a nearby region would be ideal for minimizing latency. Hetzner offers locations in **Germany (e.g., Falkenstein, Nuremberg, Helsinki)**. We can select the most appropriate one based on your specific server allocation and network considerations.

*Rationale for Change:* Leveraging existing Hetzner infrastructure provides significant advantages by utilizing current investments and offering full control over the environment, which is particularly beneficial for managing the on-premise LLM. Containerization will ensure the scalability and manageability typically found in cloud environments, adapted to your self-managed setup.

### Repository Structure

**Structure: Monorepo**
**Monorepo Tool:** Nx (recommended for its robust tooling for full-stack monorepos, including code generation, task running, and shared library management).
**Package Organization:** We will organize the monorepo into distinct `apps/` (for the frontend and backend applications) and `packages/` (for shared types, utilities, and potentially shared UI components).

### High Level Architecture Diagram


```mermaid
graph TD
    User(Marketing Team Member) -->|"Accesses"| FrontendApp["Frontend App (Web Responsive)"]
    FrontendApp -->|"API Calls (REST/gRPC)"| APIGateway[AWS API Gateway]
    APIGateway --> BackendApp["Backend Services (Node.js/TypeScript)"]
    BackendApp -->|"Orchestrates"| OnPremiseLLM["On-Premise LLM (EC2/ECS)"]
    BackendApp -->|"Deep Research API Calls"| ExternalAIs["External AI Models: Claude, Gemini, ChatGPT"]
    ExternalAIs -->|"Public Data"| Internet[Internet]

    BackendApp --> Database["Database: PostgreSQL/MongoDB"]
    BackendApp --> S3["AWS S3: Content Library"]
    BackendApp --> CloudWatch["AWS CloudWatch: Logs & Metrics"]
    
    BackendApp --> N8N["N8N Server: Webhooks/API"]
    FrontendApp --> S3Static["AWS S3: Static Assets"]
    
    subgraph "AWS Cloud"
        APIGateway
        BackendApp
        Database
        S3
        CloudWatch
    end
    
    subgraph "On-Premise / Hybrid"
        OnPremiseLLM
    end
```


*Rationale:* This diagram visualizes the primary components and data flows. The user interacts with the frontend, which communicates with the backend via API Gateway. The backend orchestrates calls to the on-premise LLM for content generation and external AIs for deep research. All data is persisted in the database and S3, with logs pushed to CloudWatch. N8N integration is shown for external automation.

### Architectural and Design Patterns

  * **Serverless Architecture (for Ancillary Services/External Integrations):** Using AWS Lambda for compute.
      * *Rationale:* Aligns with the need for flexibility and scalability for services that interact with external APIs, without incurring always-on costs.
  * **Repository Pattern (for Data Access):** Abstract data access logic.
      * *Rationale:* Enables testing and future database migration flexibility, decoupling business logic from database specifics.
  * **API Gateway Pattern (for Unified API Access):** Single entry point for all API calls.
      * *Rationale:* Centralizes authentication, rate limiting, and monitoring for both internal and external API consumers.
  * **Component-Based UI (for Frontend):** Reusable React components with TypeScript.
      * *Rationale:* Promotes maintainability and type safety across large codebases, supporting modular UI development.
  * **Microservices (for External AI Integrations & Ancillary Services):**
      * *Rationale:* Supports independent development, deployment, and scaling of services that interact with external APIs, limiting the blast radius of changes to specific integrations. This also helps with data privacy for external calls.
  * **Monolith (for Core On-Premise LLM & Content Generation):**
      * *Rationale:* For the core LLM and tightly coupled content generation logic, a monolithic approach can simplify management, ensure performance, and maintain control over the proprietary aspects of the application.

## Tech Stack

### Cloud Infrastructure

  * **Provider:** Hetzner (Self-Managed / Bare Metal / Cloud Servers)
  * **Key Services:** Virtual Machines / Bare Metal Servers, Containerization (Docker/Kubernetes), Object Storage (Hetzner Storage Box or S3-compatible service), Load Balancer (Hetzner Load Balancer or Nginx/HAProxy), Monitoring & Logging (Prometheus/Grafana stack, ELK stack).
  * **Deployment Host and Regions:** Hetzner data center in Germany (e.g., Falkenstein, Nuremberg, Helsinki) for minimizing latency.

### Technology Stack Table

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

## Data Models

### Company Profile

  * **Purpose:** To store the validated and contextualized information about the company for which content is being generated. This will serve as a central reference for all content decisions.
  * **Key Attributes:**
      * `id`: string - Unique identifier for the company.
      * `name`: string - Full legal or common name of the company.
      * `logoUrl`: string (optional) - URL to the company's logo.
      * `location`: string (optional) - Primary geographic location (city, country).
      * `shortDescription`: string (optional) - A brief summary of the company.
      * `industry`: string (optional) - Primary industry or sector.
      * `subIndustry`: string (optional) - More specific sub-industry.
      * `mission`: string (optional) - Company's mission statement.
      * `values`: string[] (optional) - Key company values.
      * `productCategories`: string[] (optional) - Categories of products or services offered.
      * `targetCustomers`: string[] (optional) - Primary target customer segments.
      * `communicationTone`: string (optional) - Inferred or defined tone of existing communications.
      * `recentNews`: string[] (optional) - URLs or summaries of recent news/announcements.
      * `websiteUrl`: string (optional) - Official company website URL.
      * `socialProfiles`: Record\<string, string\> (optional) - Map of social network names to profile URLs (e.g., `{ "linkedin": "...", "twitter": "..." }`).
  * **Relationships:** Related to `WriterProfile`, `ContentPlan`, `BlogPost`.

**TypeScript Interface**

```typescript
interface CompanyProfile {
  id: string;
  name: string;
  logoUrl?: string;
  location?: string;
  shortDescription?: string;
  industry?: string;
  subIndustry?: string;
  mission?: string;
  values?: string[];
  productCategories?: string[];
  targetCustomers?: string[];
  communicationTone?: string;
  recentNews?: string[];
  websiteUrl?: string;
  socialProfiles?: Record<string, string>;
}
```


### Writer Profile

  * **Purpose:** To define the persona and characteristics for content generation, enabling the AI to adapt tone and style.
  * **Key Attributes:**
      * `id`: string - Unique identifier for the writer profile.
      * `companyId`: string - ID of the associated company.
      * `name`: string - Name or title of the profile (e.g., "Marketing Manager," "CEO").
      * `tone`: string - Primary tone (e.g., "inspirational," "witty," "informative," "casual").
      * `writingStyle`: string - Specific writing style (e.g., "short & punchy," "long-form storytelling," "data-driven").
      * `targetAudience`: string - Audience for this writer (e.g., "customers," "investors," "job seekers").
      * `contentFocusAreas`: string[] (optional) - Specific topics this writer typically covers (e.g., "product innovation," "sustainability").
      * `assignedSocialNetworks`: string[] (optional) - List of social networks specifically assigned to this writer (if per-writer selection is used).
  * **Relationships:** Belongs to `CompanyProfile`, related to `BlogPost`, `SocialMediaPost`.

**TypeScript Interface**

```typescript
interface WriterProfile {
  id: string;
  companyId: string;
  name: string;
  tone: string;
  writingStyle: string;
  targetAudience: string;
  contentFocusAreas?: string[];
  assignedSocialNetworks?: string[];
}
```

### Content Plan

  * **Purpose:** To manage the annual content strategy, including topics and overall frequency settings.
  * **Key Attributes:**
      * `id`: string - Unique identifier for the content plan.
      * `companyId`: string - ID of the associated company.
      * `year`: number - The year for which the plan is generated (e.g., 2025).
      * `frequencySettings`: Record\<string, string | Record\<string, boolean\>\> - Defines global and/or per-platform frequency (e.g., `{ "global": "weekly", "linkedin": "daily", "custom": { "monday": true, "thursday": true } }`).
      * `topics`: Array\<{ month: number; topic: string; keywords: string[] }\> - List of monthly or weekly topics.
      * `status`: 'Draft' | 'Approved' | 'Active' | 'Archived' - Current status of the plan.
  * **Relationships:** Belongs to `CompanyProfile`, contains `BlogPost`s.

**TypeScript Interface**

```typescript
interface ContentPlan {
  id: string;
  companyId: string;
  year: number;
  frequencySettings: Record<string, string | Record<string, boolean>>;
  topics: Array<{ month: number; topic: string; keywords: string[] }>;
  status: 'Draft' | 'Approved' | 'Active' | 'Archived';
}
```

### Blog Post

  * **Purpose:** To store the full, long-form article generated by the AI, which serves as the source for social media content.
  * **Key Attributes:**
      * `id`: string - Unique identifier for the blog post.
      * `contentPlanId`: string - ID of the associated content plan.
      * `topic`: string - The main topic of the blog post.
      * `writerProfileId`: string - ID of the writer profile used for generation.
      * `title`: string - Title of the blog post.
      * `outline`: Array\<{ sectionTitle: string; paragraphs: string[] }\> - Structured outline of the post.
      * `fullContentMarkdown`: string - The complete blog post content in Markdown format (5-6 A4 pages).
      * `status`: 'Draft' | 'AwaitingReview' | 'Approved' | 'Published' | 'Archived' - Current status of the blog post.
      * `versionHistory`: Array\<{ timestamp: string; editorId: string; type: 'AI' | 'Human'; changesSummary: string }\> - Log of versions/edits.
      * `utmParameters`: Record\<string, string\> (optional) - Default UTM parameters for links within the blog.
  * **Relationships:** Belongs to `ContentPlan` and `WriterProfile`, is parent to `SocialMediaPost`s.

**TypeScript Interface**

```typescript
interface BlogPost {
  id: string;
  contentPlanId: string;
  topic: string;
  writerProfileId: string;
  title: string;
  outline: Array<{ sectionTitle: string; paragraphs: string[] }>;
  fullContentMarkdown: string;
  status: 'Draft' | 'AwaitingReview' | 'Approved' | 'Published' | 'Archived';
  versionHistory?: Array<{ timestamp: string; editorId: string; type: 'AI' | 'Human'; changesSummary: string }>;
  utmParameters?: Record<string, string>;
}
```

### Social Media Post

  * **Purpose:** To store individual social media content adaptations derived from a blog post, tailored for specific platforms and writer profiles.
  * **Key Attributes:**
      * `id`: string - Unique identifier for the social media post.
      * `blogPostId`: string - ID of the source blog post.
      * `writerProfileId`: string - ID of the writer profile for this specific post.
      * `platform`: string - The social media platform (e.g., "LinkedIn," "Instagram," "X").
      * `content`: string - The text content of the post.
      * `visualConceptPrompt`: string (optional) - Prompt for AI art tools or description for visual asset.
      * `mediaAssetUrl`: string (optional) - URL to the generated or uploaded media asset for the post.
      * `hashtags`: string[] (optional) - List of hashtags.
      * `callToAction`: string (optional) - Call to action text.
      * `status`: 'Draft' | 'AwaitingApproval' | 'Approved' | 'Scheduled' | 'Published' | 'Rejected' - Current status.
      * `publishDate`: Date (optional) - Scheduled or actual publish date.
      * `performanceMetrics`: Record\<string, number\> (optional) - Key analytics metrics (likes, comments, etc.).
      * `versionHistory`: Array\<{ timestamp: string; editorId: string; type: 'AI' | 'Human'; changesSummary: string }\> (optional) - Log of versions/edits.
  * **Relationships:** Belongs to `BlogPost` and `WriterProfile`.

**TypeScript Interface**

```typescript
interface SocialMediaPost {
  id: string;
  blogPostId: string;
  writerProfileId: string;
  platform: string;
  content: string;
  visualConceptPrompt?: string;
  mediaAssetUrl?: string;
  hashtags?: string[];
  callToAction?: string;
  status: 'Draft' | 'AwaitingApproval' | 'Approved' | 'Scheduled' | 'Published' | 'Rejected';
  publishDate?: Date;
  performanceMetrics?: Record<string, number>;
  versionHistory?: Array<{ timestamp: string; editorId: string; type: 'AI' | 'Human'; changesSummary: string }>;
}
```

### User

  * **Purpose:** To manage user accounts and their associated roles and permissions within the application.
  * **Key Attributes:**
      * `id`: string - Unique user ID.
      * `email`: string - User's email address (for login and notifications).
      * `name`: string - User's display name.
      * `role`: 'Admin' | 'Editor' | 'Reviewer' | 'Guest' - Assigned role.
      * `platformAccessRights`: Record\<string, boolean\> (optional) - Granular access rights to specific platforms/features.
  * **Relationships:** Associated with all content creation and collaboration activities.

**TypeScript Interface**

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Editor' | 'Reviewer' | 'Guest';
  platformAccessRights?: Record<string, boolean>;
}
```

## Components

### Fullstack Application (Main Monorepo Components)

This represents the top-level logical separation within the Nx monorepo.

#### web (Frontend Application)

  * **Responsibility:** Provides the user interface for interacting with the content generation, management, and analytics features. Handles all user-facing logic and communication with the backend API.
  * **Key Interfaces:**
      * `UI Components`: Consumes shared UI components and framework-specific components.
      * `API Client`: Interacts with the `api` service via RESTful endpoints.
      * `State Management`: Manages local and global UI state.
  * **Dependencies:** `api` (for data), `shared` (for types, utilities), `ui` (for shared UI components).
  * **Technology Stack:** React, TypeScript, Material-UI/Ant Design, Zustand/React Query, Tailwind CSS.

#### api (Backend Application/Services)

  * **Responsibility:** Provides the core business logic, orchestrates content generation, manages data persistence, and exposes RESTful APIs to the `web` frontend and `N8N` integration. Hosts the core on-premise LLM and manages external AI integrations.
  * **Key Interfaces:**
      * `REST API Endpoints`: Exposes endpoints for frontend consumption (e.g., `/companies`, `/writer-profiles`, `/blog-posts`, `/social-posts`, `/analytics`).
      * `Database ORM/Client`: Interacts with PostgreSQL/MongoDB.
      * `LLM Interaction Layer`: Communicates with the `on-premise LLM`.
      * `External AI Clients`: Interacts with Claude, Gemini, ChatGPT APIs.
      * `Social Platform Integrations`: Handles API calls to LinkedIn, Meta, X for publishing and analytics.
  * **Dependencies:** `shared` (for types, utilities), `database`, `on-premise LLM`, `external AI models`, `social platform APIs`, `N8N`.
  * **Technology Stack:** NestJS, TypeScript, PostgreSQL/MongoDB, Redis, various API client libraries.

#### shared (Shared Library)

  * **Responsibility:** Contains common code, types, and utilities used by both `web` and `api` applications to ensure consistency and reduce duplication.
  * **Key Interfaces:**
      * `TypeScript Interfaces`: Exported data model interfaces (e.g., `CompanyProfile`, `WriterProfile`).
      * `Utility Functions`: Common helper functions (e.g., date formatting, string manipulation).
      * `Constants`: Shared configuration values.
  * **Dependencies:** None (designed to be a foundational library).
  * **Technology Stack:** TypeScript.

#### ui (Shared UI Components - Optional, if custom design system is extensive)

  * **Responsibility:** Houses reusable UI components that can be shared across different frontend applications if the monorepo expands to include more than one frontend (e.g., a separate admin dashboard).
  * **Key Interfaces:** Exported React components.
  * **Dependencies:** `shared`.
  * **Technology Stack:** React, TypeScript, Tailwind CSS, Material-UI/Ant Design (for base components).

#### infrastructure (IaC Definitions)

  * **Responsibility:** Manages the provisioning and configuration of server infrastructure on Hetzner using Infrastructure as Code (IaC).
  * **Key Interfaces:** Terraform/Ansible scripts.
  * **Dependencies:** None (manages external resources).
  * **Technology Stack:** Terraform, Ansible.

### Component Interaction Diagram

```mermaid
graph TD
    User(Marketing Team Member) -->|"HTTP/S"| FrontendApp["web: React App"]
    FrontendApp -->|"REST/GraphQL/tRPC"| API["api: NestJS Services"]
    
    API --> Database["PostgreSQL/MongoDB"]
    API --> Cache["Redis Cache"]
    API --> FileStorage["Hetzner Storage Box"]
    API --> OnPremiseLLM["On-Premise LLM Service"]
    API --> ExternalAIs["External AI Models: Claude, Gemini, ChatGPT"]
    API --> SocialPlatformAPIs["Social Media Platform APIs"]
    API --> N8N["N8N Server: Webhooks/API"]

    subgraph "Hetzner Infrastructure"
        Database
        Cache
        FileStorage
        OnPremiseLLM
    end

    subgraph "External"
        ExternalAIs
        SocialPlatformAPIs
        N8N
    end

    FrontendApp -.-> Shared[shared: Types/Utils]
    FrontendApp -.-> UI_Lib[ui: Shared Components]
    API -.-> Shared

    Infrastructure["infrastructure: IaC"] --> HetznerInfrastructure["Hetzner Servers"]
```

*Rationale:* This diagram visually represents the logical components and their primary interactions. It clarifies the data flow and how different services within the `api` interact with internal and external dependencies.

## External APIs

### External AI Model Integrations

These are the primary external services for deep research and enhanced content capabilities.

#### Claude API

  * **Purpose:** To provide deep research capabilities and potentially alternative content generation styles beyond the on-premise LLM.
  * **Documentation:** `(To be provided by user/research based on specific Claude version)`
  * **Base URL(s):** `https://api.anthropic.com/v1/...`
  * **Authentication:** API Key (securely managed by backend service, potentially via secrets management service).
  * **Rate Limits:** `(To be determined based on chosen plan and usage)`
  * **Key Endpoints Used:**
      * `POST /messages` - For conversational AI interaction and content generation.
  * **Integration Notes:** Queries will be pseudonymized to protect sensitive company data. Responses will be streamed or chunked for efficient processing.

#### Gemini API

  * **Purpose:** To provide deep research capabilities, diverse content perspectives, and potentially multimodal generation features.
  * **Documentation:** `(To be provided by user/research based on specific Gemini version)`
  * **Base URL(s):** `https://generativelanguage.googleapis.com/v1beta/...`
  * **Authentication:** API Key (securely managed by backend service).
  * **Rate Limits:** `(To be determined based on chosen plan and usage)`
  * **Key Endpoints Used:**
      * `POST /models/{model}:generateContent` - For text generation, multimodal content.
  * **Integration Notes:** Implement robust error handling for API failures and rate limit throttling. Responses will be carefully parsed and validated.

#### ChatGPT API

  * **Purpose:** To provide deep research, content refinement, and potentially creative brainstorming capabilities.
  * **Documentation:** `(To be provided by user/research based on specific OpenAI model)`
  * **Base URL(s):** `https://api.openai.com/v1/...`
  * **Authentication:** API Key (securely managed by backend service).
  * **Rate Limits:** `(To be determined based on chosen plan and usage)`
  * **Key Endpoints Used:**
      * `POST /chat/completions` - For conversational models.
      * `POST /completions` - For legacy text generation models.
  * **Integration Notes:** Implement usage tracking to monitor costs. Ensure content generated aligns with ethical guidelines.

### Social Media Platform Integrations (for Analytics & Publishing)

These APIs are essential for content performance tracking and eventual publishing.

#### LinkedIn API

  * **Purpose:** To retrieve post-level engagement metrics and potentially for automated publishing.
  * **Documentation:** `https://learn.microsoft.com/en-us/linkedin/shared/api-guide/`
  * **Base URL(s):** `https://api.linkedin.com/v2/...`
  * **Authentication:** OAuth 2.0 (User-based authentication for publishing, Application-based for analytics where available).
  * **Rate Limits:** `(To be determined)`
  * **Key Endpoints Used:**
      * `GET /shares`, `GET /ugcPosts` - To retrieve posts and their analytics.
      * `POST /ugcPosts` - For publishing (future).
  * **Integration Notes:** Requires user consent for certain data access. Be mindful of data privacy regulations.

#### Meta (Facebook/Instagram) Graph API

  * **Purpose:** To retrieve analytics data for Facebook Pages and Instagram Business Accounts, and potentially for publishing.
  * **Documentation:** `https://developers.facebook.com/docs/graph-api`
  * **Base URL(s):** `https://graph.facebook.com/v19.0/...`
  * **Authentication:** OAuth 2.0 (Page/Business Account access tokens).
  * **Rate Limits:** `(To be determined)`
  * **Key Endpoints Used:**
      * `GET /{page-id}/insights` - For page/post level metrics.
      * `GET /{instagram-business-account-id}/media` - For Instagram post data.
      * `POST /{page-id}/feed` - For publishing (future).
  * **Integration Notes:** Requires user permissions for linked Facebook Pages and Instagram Business Accounts. Access is typically token-based and requires refresh.

#### X (Twitter) API

  * **Purpose:** To retrieve post-level engagement metrics and potentially for automated publishing.
  * **Documentation:** `https://developer.x.com/en/docs`
  * **Base URL(s):** `https://api.x.com/2/...`
  * **Authentication:** OAuth 1.0a (for user context) or OAuth 2.0 (Bearer Token for App-only).
  * **Rate Limits:** `(To be determined)`
  * **Key Endpoints Used:**
      * `GET /tweets/{id}/metrics` - To retrieve metrics for a specific tweet.
      * `POST /tweets` - For publishing (future).
  * **Integration Notes:** Be aware of the evolving X API access policies and potential costs.

## Core Workflows

### 1\. Company Identification & Context Gathering Workflow

This diagram illustrates the process from initial user input of a company name to the system identifying and validating the most likely company, and gathering its detailed context.

```mermaid
sequenceDiagram
    participant U as User (Marketing Team)
    participant FE as Frontend (web)
    participant BE as Backend (api)
    participant OLLM as On-Premise LLM Service
    participant EDS as External Data Sources (Databases, Social APIs, News)
    participant EAI as External AI Models (Claude, Gemini, ChatGPT)

    U->>FE: Enters Company Name
    FE->>BE: Request: SearchCompany(name)
    BE->>EDS: Query: PublicCompanyInfo(name)
    EDS-->>BE: Response: RawCompanyData
    BE->>OLLM: Request: ProcessCompanyData(RawCompanyData)
    OLLM-->>BE: Response: ProcessedCompanyData
    BE->>FE: Display: SuggestedCompanyCard(data)
    U->>FE: Confirms / Selects Different / Provides More Context
    alt User provides more context or manual input
        FE->>BE: Request: UpdateCompanyContext(additionalContext)
    end
    BE->>EAI: Query: DeepResearch(CompanyContext)
    EAI-->>BE: Response: DeepCompanyInsights
    BE->>BE: Consolidate Company Profile
    BE-->>FE: Confirmation: Company Profile Ready
    FE->>U: Company Context Established
```

*Rationale:* This workflow details the intricate dance between frontend, backend, on-premise LLM, and external data/AI for the initial and crucial step of company identification and context building. It highlights the user's role in validation.

### 2\. Annual Content Plan & Blog Post Generation Workflow

This diagram illustrates the process from selecting a topic from the annual plan to generating and reviewing a long blog post.

```mermaid
sequenceDiagram
    participant U as User (Marketing Team)
    participant FE as Frontend (web)
    participant BE as Backend (api)
    participant OLLM as On-Premise LLM Service
    participant DB as Database (PostgreSQL/MongoDB)

    U->>FE: Selects ContentPlan
    FE->>BE: Request: GetAnnualTopics(ContentPlanId)
    BE->>DB: Query: Topics(ContentPlanId)
    DB-->>BE: Response: TopicsList
    BE-->>FE: Display: TopicsList
    U->>FE: Selects Topic for Blog Post
    FE->>BE: Request: GenerateBlogPostOutline(Topic, WriterProfileId, CompanyId)
    BE->>OLLM: Request: GenerateOutline(Topic, WriterProfileContext)
    OLLM-->>BE: Response: BlogOutline
    BE->>FE: Display: BlogOutlineForReview(editable)
    U->>FE: Reviews/Edits Outline (Per-paragraph approval)
    FE->>BE: Request: ApproveOutline(BlogId, EditedOutline)
    BE->>OLLM: Request: GenerateFullBlogPost(ApprovedOutline, WriterProfileContext, CompanyContext)
    OLLM-->>BE: Response: FullBlogPostDraft
    BE->>DB: Save: BlogPost(FullBlogPostDraft)
    BE-->>FE: Display: FullBlogPostForReview(editable)
    U->>FE: Reviews/Edits/Approves Full Blog Post
    FE->>BE: Request: FinalizeBlogPost(BlogId)
    BE->>DB: Update: BlogPostStatus('Approved')
    BE-->>FE: Confirmation: Blog Post Finalized
```

*Rationale:* This workflow clearly delineates the stages of content planning and blog post creation, emphasizing the iterative interaction between the user and the AI (both frontend and on-premise LLM) for outline and full content generation and approval.

### 3\. Blog Post to Social Media Adaptation & Preview Workflow

This diagram shows how a finalized blog post is transformed into platform-specific social media content and presented for user review.

```mermaid
sequenceDiagram
    participant U as User (Marketing Team)
    participant FE as Frontend (web)
    participant BE as Backend (api)
    participant OLLM as On-Premise LLM Service
    participant DB as Database (PostgreSQL/MongoDB)
    participant SA as Social Adapters (Internal Logic/LLM)

    U->>FE: Initiates: AdaptBlogPostToSocialMedia(BlogPostId, SelectedPlatforms, WriterProfiles, Frequency)
    FE->>BE: Request: GetBlogPost(BlogPostId)
    BE->>DB: Query: BlogPost(BlogPostId)
    DB-->>BE: Response: FullBlogPostContent
    BE->>OLLM: Request: SemanticAnalysis(FullBlogPostContent)
    OLLM-->>BE: Response: KeyInsights, Segments
    BE->>SA: Loop: ForEach(Platform, WriterProfile)
    SA->>OLLM: Request: GenerateSocialPostDraft(Segment, PlatformParams, WriterTone, VisualConceptNeeds)
    OLLM-->>SA: Response: SocialPostDraftWithVisualPrompt
    SA-->>BE: Collect: AllSocialPostDrafts
    BE->>DB: Save: SocialMediaPosts(Drafts)
    BE-->>FE: Display: ContentPlanSummary(selected networks, frequency, etc.)
    FE->>FE: Display: BlogPreview(summary, outline)
    FE->>FE: Display: PostPreviews(Platform, Writer, Editable, VisualSuggestions)
    U->>FE: Reviews/Edits Social Posts & Visuals
    FE->>BE: Request: FinalizeSocialContentPlan(SocialPostIds)
    BE->>DB: Update: SocialMediaPostStatuses('AwaitingApproval')
    BE-->>FE: Confirmation: Social Content Plan Ready for Approval
```

*Rationale:* This workflow showcases the adaptation process, emphasizing the role of semantic analysis and multi-layered AI generation for platform- and writer-specific content, culminating in a comprehensive preview for user validation. It explicitly includes the generation of visual concepts.

## Database Schema

The following SQL DDL defines the schema for our PostgreSQL database. This schema is designed to support the data models we discussed, ensuring data integrity, relationships, and efficient querying.

```sql
-- Table: companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    location VARCHAR(255),
    short_description TEXT,
    industry VARCHAR(100),
    sub_industry VARCHAR(100),
    mission TEXT,
    values TEXT[], -- Array of strings
    product_categories TEXT[], -- Array of strings
    target_customers TEXT[], -- Array of strings
    communication_tone VARCHAR(50),
    recent_news TEXT[], -- Array of URLs or summaries
    website_url VARCHAR(255),
    social_profiles JSONB, -- Store as JSONB for flexible key-value pairs (e.g., {"linkedin": "url"})
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient company lookups by name
CREATE INDEX idx_companies_name ON companies(name);

-- Table: writer_profiles
CREATE TABLE writer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tone VARCHAR(50) NOT NULL,
    writing_style VARCHAR(50) NOT NULL,
    target_audience VARCHAR(100) NOT NULL,
    content_focus_areas TEXT[], -- Array of strings
    assigned_social_networks TEXT[], -- Array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick retrieval of writer profiles for a company
CREATE INDEX idx_writer_profiles_company_id ON writer_profiles(company_id);

-- Table: content_plans
CREATE TABLE content_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    frequency_settings JSONB NOT NULL, -- Store as JSONB for flexible frequency options
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Approved', 'Active', 'Archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, year) -- Ensure only one content plan per company per year
);

-- Table: content_plan_topics (A junction table for topics within a content plan)
CREATE TABLE content_plan_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_plan_id UUID NOT NULL REFERENCES content_plans(id) ON DELETE CASCADE,
    month INTEGER, -- Optional, for monthly topics
    topic VARCHAR(500) NOT NULL,
    keywords TEXT[], -- Array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient topic retrieval for a content plan
CREATE INDEX idx_content_plan_topics_plan_id ON content_plan_topics(content_plan_id);

-- Table: blog_posts
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_plan_id UUID NOT NULL REFERENCES content_plans(id) ON DELETE CASCADE,
    topic VARCHAR(500) NOT NULL,
    writer_profile_id UUID NOT NULL REFERENCES writer_profiles(id) ON DELETE RESTRICT, -- Do not delete writer profile if linked to blog posts
    title VARCHAR(500) NOT NULL,
    outline JSONB, -- Store outline structure as JSONB
    full_content_markdown TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'AwaitingReview', 'Approved', 'Published', 'Archived'
    utm_parameters JSONB, -- Store UTM parameters as JSONB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick retrieval of blog posts by content plan and writer
CREATE INDEX idx_blog_posts_content_plan_id ON blog_posts(content_plan_id);
CREATE INDEX idx_blog_posts_writer_profile_id ON blog_posts(writer_profile_id);

-- Table: blog_post_version_history
CREATE TABLE blog_post_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    editor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to users table
    type VARCHAR(10) NOT NULL, -- 'AI' or 'Human'
    changes_summary TEXT,
    snapshot_content_markdown TEXT NOT NULL -- Store the full content of this version
);

-- Index for retrieving versions of a specific blog post
CREATE INDEX idx_blog_post_version_history_post_id ON blog_post_version_history(blog_post_id);

-- Table: social_media_posts
CREATE TABLE social_media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    writer_profile_id UUID NOT NULL REFERENCES writer_profiles(id) ON DELETE RESTRICT,
    platform VARCHAR(50) NOT NULL, -- e.g., 'LinkedIn', 'Instagram', 'X'
    content TEXT NOT NULL,
    visual_concept_prompt TEXT,
    media_asset_url VARCHAR(255),
    hashtags TEXT[], -- Array of strings
    call_to_action VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'AwaitingApproval', 'Approved', 'Scheduled', 'Published', 'Rejected'
    publish_date TIMESTAMP WITH TIME ZONE,
    performance_metrics JSONB, -- Store analytics metrics as JSONB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blog_post_id, writer_profile_id, platform, publish_date) -- Prevent duplicate scheduled posts
);

-- Index for quick retrieval of social media posts
CREATE INDEX idx_social_media_posts_blog_post_id ON social_media_posts(blog_post_id);
CREATE INDEX idx_social_media_posts_writer_platform ON social_media_posts(writer_profile_id, platform);
CREATE INDEX idx_social_media_posts_publish_date ON social_media_posts(publish_date);

-- Table: social_media_post_version_history (similar to blog_post_version_history)
CREATE TABLE social_media_post_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_media_post_id UUID NOT NULL REFERENCES social_media_posts(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    editor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(10) NOT NULL, -- 'AI' or 'Human'
    changes_summary TEXT,
    snapshot_content TEXT NOT NULL -- Store the full content of this version
);

-- Index for retrieving versions of a specific social media post
CREATE INDEX idx_social_media_post_version_history_post_id ON social_media_post_version_history(social_media_post_id);

-- Table: users (for authentication and authorization)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255), -- For local authentication if not using SSO exclusively
    role VARCHAR(50) NOT NULL, -- 'Admin', 'Editor', 'Reviewer', 'Guest'
    platform_access_rights JSONB, -- Store flexible access rights as JSONB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick user lookup by email
CREATE UNIQUE INDEX idx_users_email ON users(email);


-- Function to update updated_at columns automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for tables that need updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_writer_profiles_updated_at
BEFORE UPDATE ON writer_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_plans_updated_at
BEFORE UPDATE ON content_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_posts_updated_at
BEFORE UPDATE ON social_media_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Unified Project Structure

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

## Development Workflow

### Local Development Setup

This section outlines the steps and commands required to get the application running locally for development.

#### Prerequisites

```bash
# Node.js and npm/Yarn
# Ensure you have a Node.js LTS version (e.g., 20.x) installed.
# We recommend using nvm (Node Version Manager) for easy version switching.
# Install Yarn (if not already installed, as Nx often uses it):
npm install -g yarn

# Docker & Docker Compose
# Required for running PostgreSQL, Redis, and potentially the on-premise LLM locally.
# Install Docker Desktop (macOS/Windows) or Docker Engine & Compose (Linux).

# Git
# For version control.

# Hetzner Cloud CLI (optional, for infrastructure management if needed)
# curl -sL [https://install.hetzner.cloud/install.sh](https://install.hetzner.cloud/install.sh) | bash
```

#### Initial Setup

```bash
# 1. Clone the monorepo
git clone <your-repo-url>
cd internal-marketing-content-app

# 2. Install monorepo dependencies
yarn install # or npm install

# 3. Set up local environment variables
# Copy the example .env file and fill in your local configurations.
cp .env.example .env

# 4. Start local development services (PostgreSQL, Redis) via Docker Compose
# Ensure Docker Desktop is running or Docker daemon is active on Linux.
docker-compose up -d postgres redis

# 5. Run database migrations (if any initial migrations are defined)
# yarn nx run api:migrate # (Example Nx command, exact command TBD)

# 6. Seed initial test data (if needed)
# yarn nx run api:seed-data # (Example Nx command, exact command TBD)
```

#### Development Commands

```bash
# Start all services (frontend and backend APIs) concurrently
# Nx can be configured to run multiple projects simultaneously.
yarn nx serve web & yarn nx serve api

# Start frontend only
yarn nx serve web

# Start backend only
yarn nx serve api

# Run all tests in the monorepo
yarn nx test

# Run tests for a specific project (e.g., 'api' or 'web')
yarn nx test api
yarn nx test web

# Build all projects for production
yarn nx build
```

### Environment Configuration

This section specifies the environment variables required for the application to run correctly in different environments (local development, staging, production).

#### Required Environment Variables

These variables should be defined in `.env` files (or equivalent for production deployments) for each application.

```bash
# Frontend (.env.local for local, configured via CI/CD for deployments)
# Example: apps/web/.env.local
REACT_APP_API_BASE_URL=http://localhost:3000/api # Local backend API URL
REACT_APP_SSO_CLIENT_ID=<your_sso_client_id>
# Add any other frontend specific public variables

# Backend (.env for local, managed by secrets for deployments)
# Example: apps/api/.env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/database # Local DB connection string
REDIS_URL=redis://localhost:6379
JWT_SECRET=<your_jwt_secret> # For internal auth tokens
EXTERNAL_AI_CLAUDE_API_KEY=<your_claude_api_key>
EXTERNAL_AI_GEMINI_API_KEY=<your_gemini_api_key>
EXTERNAL_AI_CHATGPT_API_KEY=<your_chatgpt_api_key>
# Social Media API Credentials (Store securely in production!)
LINKEDIN_CLIENT_ID=<client_id>
LINKEDIN_CLIENT_SECRET=<client_secret>
META_APP_ID=<app_id>
META_APP_SECRET=<app_secret>
X_API_KEY=<api_key>
X_API_SECRET=<api_secret>
# N8N Webhook/API Credentials
N8N_WEBHOOK_SECRET=<secret>
N8N_API_KEY=<api_key>

# Shared (defined in root .env or loaded as needed)
# None typically, shared configuration should be via TypeScript constants or
# managed directly by Nx.
```

*Rationale for Environment Configuration:*

  * **`.env.example`:** Provides a template for required variables without exposing secrets.
  * **Local vs. Production Segregation:** Public-facing frontend variables are separated from sensitive backend secrets.
  * **Secure Credential Management:** Emphasizes that API keys and secrets *must* be managed securely in production environments (e.g., Hetzner-specific secrets manager, Vault, or environment variables in a secure CI/CD pipeline).

## Deployment Architecture

### Deployment Strategy

This section outlines how the frontend and backend applications will be deployed onto your Hetzner infrastructure.

  * **Frontend Deployment:**
      * **Platform:** Hetzner servers (via Docker/Kubernetes or directly on VMs with a web server like Nginx).
      * **Build Command:** `yarn nx build web` (or `npm run nx build web`) to produce optimized static assets.
      * **Output Directory:** `dist/apps/web` (standard Nx build output).
      * **CDN/Edge:** Optional: For global reach and faster content delivery, consider integrating with a separate CDN service (e.g., Cloudflare, Bunny.net) if your user base extends beyond your Hetzner region. For internal use only, direct serving from Hetzner via Nginx is sufficient.
  * **Backend Deployment:**
      * **Platform:** Hetzner servers (via Docker/Kubernetes for container orchestration, or directly on VMs).
      * **Build Command:** `yarn nx build api` (or `npm run nx build api`) to compile the NestJS application.
      * **Deployment Method:**
          * **Containerized (Recommended):** Deploy Docker containers to Hetzner VMs managed by Docker Compose (for simpler setups) or Kubernetes (for more complex, scalable orchestration). This offers portability and consistent environments.
          * **Directly on VM:** Deploy the built Node.js application directly onto a VM, managed by a process manager like PM2 or Systemd.

### CI/CD Pipeline

The CI/CD pipeline will be instrumental in automating the build, test, and deployment processes. We'll outline a conceptual pipeline using GitLab CI/CD (as an example given its popularity for self-hosted solutions and integration with monorepos) or Jenkins.

```yaml
# .github/workflows/deploy.yaml (Example for GitLab CI/CD or similar)

# CI/CD Pipeline for Internal Marketing Content App

stages:
  - build
  - test
  - deploy:dev
  - deploy:staging
  - deploy:production

variables:
  DOCKER_IMAGE_NAME: [registry.yourdomain.com/internal-marketing-content-app](https://registry.yourdomain.com/internal-marketing-content-app)
  DOCKER_IMAGE_TAG: $CI_COMMIT_SHORT_SHA # Or use semantic versioning

# Build Frontend Application
build_frontend:
  stage: build
  script:
    - yarn install --frozen-lockfile
    - yarn nx build web --prod
  artifacts:
    paths:
      - dist/apps/web
  only:
    - main
    - develop

# Build Backend Application & Docker Image
build_backend:
  stage: build
  script:
    - yarn install --frozen-lockfile
    - yarn nx build api --prod
    - docker build -t $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG -f apps/api/Dockerfile . # Dockerfile for backend
    - docker push $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG
  only:
    - main
    - develop

# Run Unit and Integration Tests
test_all:
  stage: test
  script:
    - yarn install --frozen-lockfile
    - yarn nx test # Runs all tests (frontend & backend)
  only:
    - main
    - develop
  allow_failure: false # Fail pipeline on test failures

# Deploy to Development Environment (Hetzner VM)
deploy_dev:
  stage: deploy:dev
  script:
    - ssh user@dev.yourdomain.com "docker pull $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG && docker-compose -f /path/to/docker-compose.dev.yml up -d --remove-orphans"
  environment:
    name: development
    url: [https://dev.yourdomain.com](https://dev.yourdomain.com)
  only:
    - develop # Deploy on 'develop' branch push

# Deploy to Staging Environment (Hetzner VM)
deploy_staging:
  stage: deploy:staging
  script:
    - ssh user@staging.yourdomain.com "docker pull $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG && docker-compose -f /path/to/docker-compose.staging.yml up -d --remove-orphans"
  environment:
    name: staging
    url: [https://staging.yourdomain.com](https://staging.yourdomain.com)
  when: manual # Manual trigger from develop to staging
  only:
    - develop

# Deploy to Production Environment (Hetzner VM)
deploy_production:
  stage: deploy:production
  script:
    - ssh user@prod.yourdomain.com "docker pull $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG && docker-compose -f /path/to/docker-compose.prod.yml up -d --remove-orphans"
  environment:
    name: production
    url: [https://app.yourdomain.com](https://app.yourdomain.com)
  when: manual # Manual trigger from main to production
  only:
    - main
```

*Rationale:* This pipeline defines distinct stages for building, testing, and deploying to different environments. It emphasizes Docker for consistent deployments and SSH for remote server interaction. Manual triggers are recommended for staging and production for controlled releases.

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|---|---|---|---|
| **Development** | `http://localhost:<FE_PORT>` | `http://localhost:<BE_PORT>` | Local development and testing. |
| **Hetzner Dev** | `https://dev.yourdomain.com` | `https://dev-api.yourdomain.com` | Shared development environment on Hetzner, for integration testing of multiple features/users. |
| **Hetzner Staging** | `https://staging.yourdomain.com` | `https://staging-api.yourdomain.com` | Pre-production testing, QA, and stakeholder review. |
| **Hetzner Production** | `https://app.yourdomain.com` | `https://api.yourdomain.com` | Live environment for the marketing team. |

## Security and Performance

### Security Requirements

This section outlines the critical security measures to be implemented across the application.

  * **Frontend Security:**
      * **CSP Headers:** Implement Content Security Policy (CSP) headers to mitigate Cross-Site Scripting (XSS) and other content injection attacks.
      * **XSS Prevention:** Ensure all user-generated content and data displayed in the UI is properly sanitized and escaped to prevent XSS vulnerabilities. Use React's built-in protections and sanitize any `dangerouslySetInnerHTML` usage.
      * **Secure Storage:** Avoid storing sensitive user information (e.g., authentication tokens, personal data) directly in local storage. Utilize HttpOnly cookies for session tokens or in-memory storage for short-lived, non-sensitive data.
  * **Backend Security:**
      * **Input Validation:** All incoming API requests and user inputs must undergo strict server-side validation to prevent injection attacks (SQL Injection, NoSQL Injection) and ensure data integrity. Use a validation library (e.g., class-validator for NestJS).
      * **Rate Limiting:** Implement API rate limiting to protect against brute-force attacks and denial-ofservice (DoS) attempts on frequently accessed endpoints.
      * **CORS Policy:** Configure Cross-Origin Resource Sharing (CORS) policies to allow only trusted origins to access the backend API.
      * **HTTPS Enforcement:** Enforce HTTPS for all communication between frontend and backend, and with external APIs, to ensure data encryption in transit.
  * **Authentication Security:**
      * **Token Storage:** Store authentication tokens (e.g., JWTs) securely. For browser-based applications, HttpOnly, Secure cookies are preferred over local storage to mitigate XSS risks.
      * **Session Management:** Implement robust session management, including token expiration, refresh tokens, and server-side invalidation.
      * **Password Policy:** If local password authentication is used, enforce strong password policies (complexity, length) and securely hash passwords using industry-standard algorithms (e.g., bcrypt).

### Performance Optimization

This section outlines strategies to ensure the application remains fast and responsive.

  * **Frontend Performance:**
      * **Bundle Size Target:** Aim to keep the JavaScript bundle size optimized by using tree-shaking, code splitting, and lazy loading for routes and components.
      * **Loading Strategy:** Implement lazy loading for non-critical assets and features to improve initial page load times. Use React's `lazy` and `Suspense`.
      * **Caching Strategy:** Leverage browser caching for static assets (JavaScript, CSS, images). Implement service workers for more advanced caching and offline capabilities if required.
  * **Backend Performance:**
      * **Response Time Target:** Aim for API response times of less than 200ms for critical endpoints.
      * **Database Optimization:** Optimize database queries through proper indexing, query optimization, and efficient data access patterns (e.g., using the Repository Pattern). Implement connection pooling.
      * **Caching Strategy:** Utilize Redis for caching frequently accessed data (e.g., database query results, computed values) to reduce database load and improve API response times.

## Testing Strategy

### Testing Pyramid

The testing strategy will adhere to the widely recognized testing pyramid model to ensure balanced and efficient testing across different layers.

```plaintext
      E2E Tests
     /         \
  Integration Tests
   /             \
Frontend Unit  Backend Unit
```

### Test Organization

This section defines how tests will be organized within the monorepo for both frontend and backend.

#### Frontend Tests

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

#### Backend Tests

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

#### E2E Tests

```plaintext
# Typically in a dedicated `e2e` project within the Nx monorepo, or a separate repository.
apps/e2e/ # Nx E2E project
├── src/
│   ├── support/
│   │   ├── commands.ts
│   │   └── index.ts
│   ├── fixtures/
│   │   └── example.json
│   ├── integration/ (or spec files)
│   │   └── login.spec.ts
│   │   └── content-generation.spec.ts
│   └── plugins/
│       └── index.ts
├── cypress.config.ts # or playwright.config.ts
└── project.json
```

*Rationale:* E2E tests are isolated from application code, focusing on user journeys across the entire deployed system.

### Test Examples

This section provides basic examples of test structures for different test types.

#### Frontend Component Test

```typescript
// apps/web/src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Test Button</Button>);
    fireEvent.click(screen.getByText('Test Button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Example: Accessibility test
  it('has accessible name', () => {
    render(<Button aria-label="Submit Form">Submit</Button>);
    expect(screen.getByLabelText('Submit Form')).toBeInTheDocument();
  });
});
```

*Rationale:* Uses `React Testing Library` to simulate user interactions and test components from a user's perspective, ensuring accessibility.

#### Backend API Test

```typescript
// apps/api/tests/integration/companies.integration.test.ts
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app/app.module'; // Adjust path as needed

describe('Companies (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule], // Import your main application module
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/companies (GET) - should return a list of companies', () => {
    return request(app.getHttpServer())
      .get('/companies')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
        // Add more specific assertions for response structure
      });
  });

  it('/companies (POST) - should create a new company', () => {
    const newCompany = { name: 'TestCo', shortDescription: 'A test company' };
    return request(app.getHttpServer())
      .post('/companies')
      .send(newCompany)
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toEqual('TestCo');
        expect(res.body.id).toBeDefined();
      });
  });

  // Example: Error handling test
  it('/companies (POST) - should return 400 for invalid data', () => {
    const invalidCompany = { name: '' }; // Invalid name
    return request(app.getHttpServer())
      .post('/companies')
      .send(invalidCompany)
      .expect(400);
  });
});
```

*Rationale:* Uses `Supertest` to make HTTP requests against the running NestJS application, validating API behavior from an external perspective.

#### E2E Test

```typescript
// apps/e2e/src/integration/content-generation.spec.ts (Cypress example)
describe('Content Generation Workflow', () => {
  beforeEach(() => {
    cy.visit('/login'); // Assuming login is required
    // Perform login steps
    cy.get('[data-cy=email-input]').type('test@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should successfully generate and preview social media content', () => {
    // 1. Select company
    cy.get('[data-cy=company-search-input]').type('Innovate Corp');
    cy.get('[data-cy=company-select-button]').click();
    cy.get('[data-cy=company-validation-confirm]').click();

    // 2. Select writer profiles
    cy.get('[data-cy=writer-profile-select-marketing]').click();
    cy.get('[data-cy=writer-profile-next-button]').click();

    // 3. Select social networks
    cy.get('[data-cy=platform-checkbox-linkedin]').check();
    cy.get('[data-cy=platform-checkbox-instagram]').check();
    cy.get('[data-cy=platform-next-button]').click();

    // 4. Generate annual topics (assuming auto-generated then confirmed)
    cy.get('[data-cy=annual-plan-confirm-button]').click();

    // 5. Select a topic and generate blog post
    cy.get('[data-cy=topic-select-first]').click();
    cy.get('[data-cy=generate-blog-button]').click();
    cy.get('[data-cy=blog-post-review-confirm-all-sections]').click(); // Confirm all sections

    // 6. Generate social media content
    cy.get('[data-cy=generate-social-posts-button]').click();

    // 7. Preview and verify
    cy.get('[data-cy=social-post-preview-linkedin]').should('be.visible');
    cy.get('[data-cy=social-post-preview-instagram]').should('be.visible');
    cy.contains('Review & Finalize Posts').should('be.visible');

    // 8. Export (optional)
    cy.get('[data-cy=export-button]').click();
    cy.get('[data-cy=export-option-csv]').click();
  });

  // Example: Error scenario
  it('should display error for invalid company search', () => {
    cy.get('[data-cy=company-search-input]').type('NonExistentCompanyXYZ');
    cy.get('[data-cy=company-search-button]').click();
    cy.contains('Company not found. Please try again or provide manual details.').should('be.visible');
  });
});
```

*Rationale:* Simulates actual user interaction through the UI, ensuring that critical end-to-end workflows function correctly. Uses data attributes (`data-cy`) for reliable test selectors.

### Testing Best Practices

  * **Unit Tests**: Test individual functions, components, or methods in isolation. Mock all external dependencies.
  * **Integration Tests**: Test interactions between integrated units (e.g., API endpoint to service, service to repository, UI component interacting with local state).
  * **E2E Tests**: Test critical user flows across the entire application, simulating real user behavior.
  * **Coverage Goals**: Aim for high code coverage (e.g., 80% for unit tests) to ensure sufficient test coverage.
  * **Test Structure**: Adhere to the Arrange-Act-Assert (AAA) pattern for clear and readable tests.
  * **Mock External Dependencies**: For unit and integration tests, mock external APIs (e.g., Claude, Gemini, X APIs, database calls) to ensure tests are fast, reliable, and isolated.
  * **Test Data Management**: Use test factories or fixtures for consistent and reproducible test data. Implement cleanup strategies for integration/E2E tests.

## Coding Standards

These standards are **MANDATORY** for AI agents and human developers alike. They focus only on critical rules needed to prevent common pitfalls and ensure consistency across the codebase. Overly detailed or obvious standards (like "use SOLID principles") are omitted to avoid bloating context and slowing development, as we assume the AI already knows general best practices.

### Critical Fullstack Rules

  * **Type Sharing:** Always define shared TypeScript types and interfaces in `packages/shared/src/types/` and import them from there for both frontend and backend applications. This ensures type consistency across the full stack.
  * **API Calls:** Frontend applications should never make direct HTTP calls. All API interactions must go through the dedicated API service layer (e.g., `apps/web/src/services/`).
  * **Environment Variables:** Access sensitive configuration values only through a centralized configuration service or object. Never access `process.env` directly in application code. This promotes secure secrets management.
  * **Error Handling:** All API routes and critical backend services must use the standard error handling mechanism defined in the architecture. Frontend should also implement the unified error handling strategy.
  * **State Updates:** Frontend state should never be mutated directly. Always use the proper state management patterns (e.g., Zustand's setters, React Query's invalidation/setQueryData).
  * **Database Interactions:** Backend services should interact with the database only through the defined data access layer (e.g., Repository Pattern). Direct ORM calls outside of the repository should be avoided.
  * **Logging:** Use the defined logging library and adhere to its standards (levels, format, required context). Avoid `console.log` in production code.

### Naming Conventions

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

## Error Handling Strategy

### Error Flow

This sequence diagram illustrates the unified error handling flow across the frontend and backend, from an error occurring to its logging and potential user notification.

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend (web)
    participant BE as Backend (api)
    participant OLLM as On-Premise LLM Service
    participant ExternalAI as External AI Models
    participant DB as Database
    participant Log as Logging Service (ELK)
    participant Mon as Monitoring (Prometheus/Grafana)

    User->>FE: Performs Action
    FE->>BE: API Request
    alt Error Occurs in Backend
        BE->>OLLM: Call (e.g., LLM inference fails)
        OLLM--xBE: LLM Error
        BE->>ExternalAI: Call (e.g., External AI API fails)
        ExternalAI--xBE: External AI Error
        BE->>DB: Query (e.g., DB connection issue)
        DB--xBE: Database Error
        BE->>Log: Log: Backend Error (details, correlation ID)
        BE->>Mon: Alert: Critical Error (if severe)
        BE--xFE: Error Response (standardized format)
        FE->>Log: Log: Frontend Error (API failure)
        FE->>User: Display: User-Friendly Error Message
    else Error Occurs in Frontend
        FE--xUser: Local UI Error (e.g., Validation error)
        FE->>Log: Log: Frontend UI Error (details)
        FE->>User: Display: User-Friendly Error Message
    end
```

*Rationale:* This diagram depicts a centralized error handling approach where backend errors are caught, logged, monitored, and then returned to the frontend in a standardized, user-friendly format. Frontend-specific errors are also logged.

### Error Response Format

To ensure consistency, all error responses from the backend API will adhere to a standardized format.

```typescript
interface ApiError {
  error: {
    code: string;       // Unique error code (e.g., "AUTH_001", "DB_003", "LLM_GEN_FAILED")
    message: string;    // User-friendly error message
    details?: Record<string, any>; // Optional: more technical details for debugging (e.g., validation errors)
    timestamp: string;  // ISO 8601 timestamp of when the error occurred
    requestId: string;  // Unique request ID for tracing across services
  };
}
```

*Rationale:* This format provides both a user-friendly message and structured details for debugging, crucial for effective error diagnosis and resolution. `requestId` is vital for tracing distributed transactions.

### Frontend Error Handling

The frontend will implement a global error handling strategy to gracefully manage API errors and local UI issues.

```typescript
// apps/web/src/utils/errorHandler.ts (Conceptual)
import { ApiError } from '@shared/types'; // Assuming shared error interface

export const handleApiError = (error: any): void => {
  if (error.response && error.response.data && error.response.data.error) {
    const apiError: ApiError = error.response.data;
    console.error('API Error:', apiError.error);
    // Display user-friendly message based on apiError.error.message or code
    // E.g., show a toast notification, redirect to an error page
    alert(`Error: ${apiError.error.message} (Code: ${apiError.error.code})`);
  } else {
    console.error('Unexpected error:', error);
    alert('An unexpected error occurred. Please try again.');
  }
  // Log frontend error to centralized logging (e.g., Sentry, custom logging endpoint)
};

// Global error boundary for React components
// (apps/web/src/components/ErrorBoundary/ErrorBoundary.tsx)
// Catches errors in React component tree and displays fallback UI
```

*Rationale:* Centralizing API error handling ensures consistent user feedback and logging. Global error boundaries prevent UI crashes from unhandled component errors.

### Backend Error Handling

The backend will implement a robust error handling middleware or interceptors to catch, process, and log errors, and return standardized responses.

```typescript
// apps/api/src/common/filters/all-exceptions.filter.ts (NestJS Example)
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'; // For request ID

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'] || uuidv4(); // Use existing or generate new

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'SERVER_ERROR_001';
    let details: Record<string, any> | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // NestJS validation pipe errors usually have 'message' array
        if (Array.isArray((exceptionResponse as any).message)) {
          message = (exceptionResponse as any).message.join(', ');
          code = 'VALIDATION_ERROR';
          details = { validationErrors: (exceptionResponse as any).message };
        } else {
          message = (exceptionResponse as any).message || message;
          code = (exceptionResponse as any).code || code; // Custom error code
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // You can implement custom error types and map them to codes
    }

    // Log the error to ELK/CloudWatch
    console.error(`[${requestId}] - ${request.method} ${request.url} - Status: ${status} - Code: ${code} - Message: ${message}`, {
      stack: (exception instanceof Error) ? exception.stack : undefined,
      details: details,
      user: (request as any).user ? (request as any).user.id : 'anonymous',
      // Add more context like LLM/External AI specific errors if available
    });

    response.status(status).json({
      error: {
        code,
        message,
        details, // Include details only in dev/staging or for specific error types
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }
}
```

*Rationale:* A global exception filter in NestJS catches all unhandled errors, logs them with context (including a `requestId` for tracing), and transforms them into the standardized `ApiError` format before sending back to the client. This ensures sensitive stack traces are not exposed in production and provides consistent error payloads.

## Monitoring and Observability

### Monitoring Stack

Our monitoring strategy will leverage the **Prometheus & Grafana** stack for collecting and visualizing metrics, and the **ELK Stack (Elasticsearch, Logstash, Kibana)** for centralized logging.

  * **Frontend Monitoring:**
      * **Tooling:** Integrated with Prometheus for custom application metrics (e.g., component render times, API call durations from the user's perspective). Error tracking via **Sentry** (or similar solution) for client-side errors and performance issues (Core Web Vitals).
      * **Purpose:** To track user experience, client-side performance, and JavaScript errors.
  * **Backend Monitoring:**
      * **Tooling:** Prometheus for system and application metrics (CPU, memory, request rates, response times, database query performance). Grafana for dashboards.
      * **Purpose:** To monitor service health, API performance, resource utilization, and identify bottlenecks.
  * **On-Premise LLM Monitoring:**
      * **Tooling:** Prometheus exporters for the LLM service (e.g., Python application metrics, GPU utilization, inference latency).
      * **Purpose:** To track LLM performance, resource consumption, and availability.
  * **Error Tracking:** **Sentry** (for frontend errors) and ELK (for backend errors) will capture and centralize all application errors, providing detailed stack traces and context.
  * **Performance Monitoring (APM):** Consider integrating an Application Performance Monitoring (APM) tool (e.g., **Jaeger for distributed tracing** for complex backend interactions, or **New Relic/Datadog** if a commercial solution is preferred) to get deeper insights into transaction flows and latency across services.

### Key Metrics

We will define key metrics for both frontend and backend to provide a comprehensive view of application health and performance.

  * **Frontend Metrics:**
      * **Core Web Vitals:** Largest Contentful Paint (LCP), First Input Delay (FID), Cumulative Layout Shift (CLS) for perceived loading performance, interactivity, and visual stability.
      * **JavaScript errors:** Number and rate of uncaught JavaScript errors.
      * **API response times (client-side):** Latency of API calls from the user's browser.
      * **User interactions:** Custom events for critical user actions (e.g., successful content generation, export completions).
      * **Bundle Size:** Track the size of loaded JavaScript and CSS bundles.
  * **Backend Metrics:**
      * **Request rate:** Number of requests per second for key API endpoints.
      * **Error rate:** Percentage of requests resulting in server errors (5xx).
      * **Response time:** Average and percentile (e.g., P95, P99) latency for API responses.
      * **Database query performance:** Latency and success rate of database operations.
      * **Resource utilization:** CPU, memory, disk I/O, network I/O for VMs/containers.
      * **LLM inference latency:** Time taken for the on-premise LLM to generate content.
      * **External AI API call success/failure rate:** Monitoring of third-party service reliability.

## Checklist Results Report

## Next Steps

### Architect Prompt

This section will contain the prompt for the Architect, keep it short and to the point to initiate create architecture mode using this document as input.