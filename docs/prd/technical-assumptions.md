# Technical Assumptions

## Repository Structure: Monorepo

*Rationale: A monorepo structure will simplify code sharing between frontend and backend components (e.g., shared types, utility functions) and streamline full-stack development. This aligns with the integrated nature of the application, especially given the planned conversion from a long blog post to various social media formats.*

## Service Architecture

*Service Architecture: Hybrid (Monolith for Core LLM, Microservices/Serverless for External Integrations & Ancillary Services)*
*Rationale: The core on-premise LLM and content generation logic will likely benefit from a more monolithic, tightly coupled architecture for performance and localized control. External AI integrations and potentially other ancillary services (e.g., analytics processing, social media posting integrations) can be implemented as smaller, decoupled microservices or serverless functions to ensure flexibility, scalability, and independent deployment without impacting the core LLM. This balances the need for robust core functionality with the agility for external integrations.*

## Testing Requirements

*Testing Requirements: Full Testing Pyramid (Unit + Integration + E2E + Manual testing convenience methods)*
*Rationale: Given the critical nature of content accuracy, brand compliance, and integration with multiple external APIs, a comprehensive testing strategy is essential. Unit tests will validate individual components, integration tests will confirm seamless data flow between internal and external services, and E2E tests will ensure the entire user journey functions as expected. Manual testing convenience methods will support the human-in-the-loop review processes.*

## Additional Technical Assumptions and Requests

* **Language & Runtime:** TypeScript with Node.js for backend services due to its prevalence in modern full-stack development and strong typing benefits. For the on-premise LLM, the choice of language/framework will be dictated by the specific open-source model chosen (e.g., Python for many ML frameworks).
* **Database:** A flexible, scalable database solution will be needed to store blog content, social posts, user configurations, and analytics data. A NoSQL database (e.g., MongoDB, DynamoDB) could offer schema flexibility suitable for varying content structures, while a relational database (e.g., PostgreSQL) might be preferred for structured user and analytics data. A hybrid approach could also be considered.
* **API Communication:** Internal API communication between frontend and backend will likely be RESTful or gRPC for efficient data exchange.
* **Authentication:** A secure authentication mechanism will be required for internal marketing team users.
* **Hosting/Infrastructure:** Cloud platform (e.g., AWS, GCP, Azure) for hosting frontend, backend services, external integrations, and potentially supporting the on-premise LLM's infrastructure needs (GPU instances etc.).
