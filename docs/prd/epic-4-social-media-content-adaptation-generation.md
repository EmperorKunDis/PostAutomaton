# Epic 4: Social Media Content Adaptation & Generation

**Epic Goal:** Implement the complex logic for transforming the long blog posts into platform-specific and writer-specific social media content, including visual concept suggestions for relevant platforms, and providing a comprehensive preview and export mechanism.

**Story 4.1: Blog Post to Social Media Content Conversion**

As a **marketing team member**,
I want the **system to automatically convert a finalized blog post into multiple social media posts**,
so that I can **efficiently repurpose long-form content for various platforms**.

**Acceptance Criteria**
4.1: The system performs semantic analysis on the approved long blog post to identify key insights, takeaways, and quotes.
4.2: The system extracts relevant segments (paragraphs, sentences) from the blog post that have standalone value for social media.
4.3: The system generates angle variations for social media content, highlighting different perspectives (e.g., technical, emotional, news-oriented) from the blog post.
4.4: The system generates initial social media post drafts for each selected platform (e.g., X, LinkedIn, Instagram, TikTok) based on the blog content.
4.5: The system automatically includes relevant hashtags, emojis, and calls to action (CTAs) appropriate for each platform.

**Story 4.2: Visual Concept Suggestions for Social Posts**

As a **marketing team member**,
I want the **system to suggest visual concepts for social media posts, especially for visually-driven platforms**,
so that I can **create engaging content that includes appropriate imagery or video ideas**.

**Acceptance Criteria**
4.1: For Instagram and Pinterest, the system suggests carousel content ideas (e.g., "Top 5 insights from the blog").
4.2: For Instagram and Pinterest, the system provides image prompts suitable for AI art tools (e.g., "flat lay of eco-friendly packaging") based on the post content.
4.3: For Instagram and Pinterest, the system generates mockup descriptions for visual elements like quote cards, charts, or team photos.
4.4: For TikTok and YouTube Shorts, the system generates 15-30 second video script snippets derived from blog takeaways.
4.5: For TikTok and YouTube Shorts, the system suggests visual scene ideas (e.g., "voiceover of this paragraph + B-roll from workspace").
4.6: The system suggests relevant CTAs for visual content (e.g., "Follow us for more tips like this," "Read the full story on our blog," "Watch now").
4.7: (Optional Future Integration): The system provides a 1-click option to generate images via integrated AI art tools (e.g., DALL·E, Midjourney, Canva, Adobe Express).

**Story 4.3: Comprehensive Content Plan Preview & Export**

As a **marketing team member**,
I want to **preview the full generated content plan before finalizing**,
so that I can **review, make final edits, and easily export the content for scheduling and publishing**.

**Acceptance Criteria**
4.1: The system presents a "Summary View" of the content plan, including selected networks, selected writer profiles, publishing frequency, and number of posts per platform.
4.2: The "Blog Preview" shows the title, outline (H1–H3), and a summary of the full blog article, with an option to edit or regenerate the blog content.
4.3: The system provides a "Post Preview" section, displaying an example post for each selected platform and each writer profile, with editable content.
4.4: The "Post Preview" section includes suggested visuals or video prompts where applicable.
4.5: The system offers a "Final Confirmation" step with a "Generate full content plan" button.
4.6: The system provides export options for the full content plan in various formats (CSV, Notion / Google Sheet).
4.7: The system provides integration options for direct export to publishing tools (e.g., Buffer, Hootsuite).
