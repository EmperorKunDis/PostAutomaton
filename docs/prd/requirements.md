# Requirements

## Functional

1.  **FR1:** The system shall allow users to input a company name for social network content generation.
2.  **FR2:** The system shall perform a deep survey to identify the most likely company based on public information (e.g., business databases, user geolocation, industry, company size, language).
3.  **FR3:** The system shall display a company card with relevant details (name, logo, location, short description) for user validation.
4.  **FR4:** The system shall handle ambiguous company names by providing a list of possible companies with metadata (industry, location, logo) for user selection.
5.  **FR5:** The system shall allow users to manually specify company details or create a new entity if their company is not listed.
6.  **FR6:** The system shall allow users to provide additional context (brief description, industry, location, website URL) to narrow down company identification.
7.  **FR7:** The system shall determine company context by combining automated research (website scraping, social profiles, news, databases) and user input.
8.  **FR8:** The system shall generate three writer profiles per company context, including profession/position, tone, writing style, target audience, and content focus areas.
9.  **FR9:** The system shall allow users to replace, add, or remove suggested writer profiles, and manually define custom profiles.
10. **FR10:** The system shall provide "tips for company focus" tailored to each writer profile, guiding content generation.
11. **FR11:** The system shall allow users to select from a list of core and optional social networks (LinkedIn, Facebook, Instagram, X, TikTok, YouTube, Pinterest, Threads, Reddit, Medium/Substack, Newsletter platforms).
12. **FR12:** The system shall adapt content for each selected social network based on platform-specific parameters (character limits, format, hashtag style, tone, CTA formats, media requirements).
13. **FR13:** The system shall adapt content for each writer profile, interpreting the blog post with their unique perspective and voice.
14. **FR14:** The system shall support global selection of social networks (all writers generate for all selected platforms) and advanced per-writer platform selection.
15. **FR15:** The system shall generate visual concept suggestions for platforms with strong visual components (Instagram, TikTok, Pinterest), including image prompts and video script snippets.
16. **FR16:** The system shall provide a summary view, blog preview, and post preview per platform/writer before full-scale generation.
17. **FR17:** The system shall offer export options for the content plan (CSV, Notion/Google Sheet, publishing tools).
18. **FR18:** The system shall allow users to set content sharing frequency (Daily, Weekly, Bi-weekly, Monthly, Custom) per social network.
19. **FR19:** The system shall generate post topics for a year in advance, guided by company context, writer profiles, industry trends, seasonality, keyword research, and user goals.
20. **FR20:** The system shall generate long blog posts (5-6 A4 pages) based on selected topics, company context, writer persona, outline, and key points.
21. **FR21:** The system shall break down the long blog post content into adapted social media posts (semantic analysis, segment extraction, angle variation, post generation).
22. **FR22:** The system shall allow users to review and edit the blog post structure at a granular paragraph/section level before finalization.
23. **FR23:** The system shall include content performance dashboards for key metrics (engagement rate, follower growth, reach, impressions) and best-performing content categories.
24. **FR24:** The system shall support native API integrations with social platforms for analytics (LinkedIn, Meta, X).
25. **FR25:** The system shall support UTM tagging and Google Analytics integration for blog content tracking.
26. **FR26:** The system shall provide a centralized content library for generated blog posts (with versioning), social posts, reusable snippets, and visual/media assets.
27. **FR27:** The system shall support tagging and filtering of assets in the content library.
28. **FR28:** The system shall provide version control features, including tracking AI vs. human edits, viewing change history, restoring previous versions, and comparing revisions.
29. **FR29:** The system shall offer role-based permissions (Admin, Editor, Reviewer, Guest) and platform access rights.
30. **FR30:** The system shall include inline comments, @Mentions, notifications, and approval workflows.
31. **FR31:** The system shall support methods for training/onboarding the on-premise LLM, including uploading brand guidelines, example content, and structured prompt templates.
32. **FR32:** The system shall use Retrieval-Augmented Generation (RAG) and/or optionally fine-tune open-source models with internal data.
33. **FR33:** The system shall implement content validation rules (banned words, disclaimers), tone enforcement, and bias detection algorithms.
34. **FR34:** The system shall include automated checks for plagiarism, fact-checking (using external KBs), and sentiment analysis.
35. **FR35:** The system shall ensure data privacy and security through separate secure layers for private data, pseudonymized queries for external APIs, and logging external queries.
36. **FR36:** The system shall adhere to GDPR compliance and clear data retention policies.
37. **FR37:** The system shall provide API outputs or webhooks for connectivity with N8N server for automation.

## Non Functional

1.  **NFR1:** The system shall ensure the on-premise LLM operates with a response time of less than 3 seconds for content generation requests.
2.  **NFR2:** The system shall securely manage API keys and credentials for all integrated external AI models (Claude, Gemini, ChatGPT).
3.  **NFR3:** The system shall implement robust data privacy measures, including pseudonymization of sensitive company data before querying external AI models.
4.  **NFR4:** The system shall provide a user-friendly interface with an intuitive workflow for marketing team members.
5.  **NFR5:** The system shall be scalable to accommodate growth in content volume, number of users, and integrated social platforms.
6.  **NFR6:** The system shall maintain high availability for the on-premise LLM and core content generation services.
7.  **NFR7:** The system shall ensure all generated content adheres to defined brand guidelines and ethical AI considerations (accuracy, bias prevention).
8.  **NFR8:** The system shall provide a clear audit trail for all content generation, modification, and approval actions.
9.  **NFR9:** The system shall support efficient data storage and retrieval for the content library and historical versions.
10. **NFR10:** The system shall be maintainable and extensible, allowing for future integration of new social platforms and AI models.
11. **NFR11:** The system shall be designed to minimize operational overhead for the IT team supporting the on-premise LLM.
12. **NFR12:** The system shall ensure that all data handling is compliant with GDPR regulations.
