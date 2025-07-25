# Data Models

## Company Profile

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


## Writer Profile

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

## Content Plan

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

## Blog Post

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

## Social Media Post

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

## User

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
