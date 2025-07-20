# Deployment Architecture

## Deployment Strategy

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

## CI/CD Pipeline

The CI/CD pipeline will be instrumental in automating the build, test, and deployment processes. We'll outline a conceptual pipeline using GitLab CI/CD (as an example given its popularity for self-hosted solutions and integration with monorepos) or Jenkins.

```yaml