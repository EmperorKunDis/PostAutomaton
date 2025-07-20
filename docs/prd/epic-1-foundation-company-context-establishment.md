# Epic 1: Foundation & Company Context Establishment

**Epic Goal:** Establish the core application infrastructure, implement secure user authentication, and enable robust company identification and context gathering, laying the groundwork for all subsequent content generation. This epic will also include an initial piece of demonstrable functionality, such as a basic dashboard or confirmation screen once a company is identified.

**Story 1.1: Core Application Setup & User Authentication**

As a **marketing team member**,
I want to **securely log into the internal content generation app**,
so that I can **access its features and manage my content without unauthorized access**.

**Acceptance Criteria**
1.1: Users can register and log in with their existing company credentials (e.g., SSO integration).
1.2: The application securely handles user authentication and session management.
1.3: Unauthorized users are prevented from accessing any application features.
1.4: A basic "Welcome" or "Dashboard" screen is displayed upon successful login.
1.5: The application's basic project structure (repositories, build tools, core dependencies) is initialized.
1.6: Local testability is established for core authentication components.

**Story 1.2: Company Name Input & Initial Validation**

As a **marketing team member**,
I want to **input a company name into the application**,
so that the **system can begin identifying the target company for content generation**.

**Acceptance Criteria**
1.1: The system provides an input field for the company name.
1.2: Upon input, the system performs a preliminary search for the most likely company.
1.3: The system displays a small company card with name, logo, location, and short description (e.g., "Innovate Corp (Berlin, software development startup) – Is this the one you meant?").
1.4: If the company name is ambiguous, the system displays a list of 3-5 possible companies with additional metadata (industry, location, logo) for user selection.
1.5: The user can select the correct company from the suggested list.

**Story 1.3: Manual Company Specification & Context Provision**

As a **marketing team member**,
I want to **manually specify company details or provide additional context**,
so that the **system accurately identifies the target company, even if it's not publicly listed or is a specific entity (e.g., department, non-profit)**.

**Acceptance Criteria**
1.1: The user can access an option to manually input company details if their company is not found in search.
1.2: The system allows the user to create a new entity with basic information (name, industry, location).
1.3: The system provides an "Additional Context" field for free-form notes (e.g., "CSR department of XYZ Corp," "regional office").
1.4: The user can provide brief descriptions, industry/business type, location, or a website URL to refine company identification before or during the deep survey.
