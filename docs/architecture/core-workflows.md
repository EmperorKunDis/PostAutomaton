# Core Workflows

## 1\. Company Identification & Context Gathering Workflow

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

## 2\. Annual Content Plan & Blog Post Generation Workflow

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

## 3\. Blog Post to Social Media Adaptation & Preview Workflow

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
