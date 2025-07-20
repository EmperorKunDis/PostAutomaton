# Epic 2: Writer Profile & Social Network Configuration

**Epic Goal:** Implement the ability for the system to generate and for users to customize writer profiles, and allow for the selection and configuration of social networks, ensuring the flexibility needed for tailored content generation.

**Story 2.1: Automated Company Context Determination**

As a **marketing team member**,
I want the **program to automatically determine the company's detailed context after initial identification**,
so that **writer profiles and content generation are accurately tailored**.

**Acceptance Criteria**
2.1: The system automatically gathers company context from diverse sources (website content, social profiles, press releases, structured databases) after initial company identification.
2.2: The system infers and categorizes relevant company data points, including industry, mission, values, products/services, target customers, and existing communication tone.
2.3: The system prioritizes user-provided context (e.g., "SaaS startup in education sector") when filtering and suggesting content and styles.

**Story 2.2: Generation & Customization of Writer Profiles**

As a **marketing team member**,
I want the **system to suggest writer profiles based on company context**,
so that I can **quickly select or customize personas for content generation**.

**Acceptance Criteria**
2.1: The system suggests 1-5 writer profiles (e.g., Marketing Manager, Founder, HR Lead) based on company industry, size, values, and competitor analysis.
2.3: Each suggested writer profile includes a profession/position, tone (e.g., inspirational, witty), writing style (e.g., short & punchy), target audience, and content focus areas.
2.4: Users can replace any suggested profile with a custom one.
2.5: Users can manually define new writer profiles, specifying name/title, tone, audience, style, and topic preferences.
2.6: Users can add or remove profiles, allowing for fewer or more than three, based on team needs.
2.7: Writer profiles include explicit tone of voice settings (e.g., formal, enthusiastic, humorous) that affect AI output.

**Story 2.3: Social Network Selection & Global Adaptation**

As a **marketing team member**,
I want to **select social networks for content distribution**,
so that **all generated content is adapted for the chosen platforms**.

**Acceptance Criteria**
2.1: The system provides a selection of core social platforms: LinkedIn, Facebook, Instagram, X (Twitter), TikTok, and YouTube.
2.2: The system provides a selection of optional social platforms: Pinterest, Threads, Reddit, Medium/Substack/Company Blog, and Newsletter platforms.
2.3: Users can select platforms for global content distribution across all writer profiles as a default.
2.4: The system adapts content for each selected social network based on platform-specific parameters (e.g., character limits, media types, hashtag usage, tone shifts, CTA formats).

**Story 2.4: Advanced Per-Writer Social Network Selection**

As a **power user**,
I want to **assign specific social networks to individual writer profiles**,
so that **content distribution aligns with real-world delegation and platform suitability for each persona**.

**Acceptance Criteria**
2.1: The system allows for an advanced option to assign specific social networks to individual writer profiles (e.g., CEO: LinkedIn + X).
