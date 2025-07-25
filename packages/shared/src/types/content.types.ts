export interface ContentTopic {
  id: string;
  title: string;
  description: string;
  category: TopicCategory;
  keywords: string[];
  plannedMonth: number; // 1-12
  plannedYear: number;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  writerProfileId?: string;
  companyId: string;
  userId: string;
  contentGoals: ContentGoal[];
  seasonalEvents?: string[];
  seasonalRelevance?: string[];
  targetAudience?: string;
  seoKeywords?: string[];
  estimatedReadTime?: number;
  estimatedReadingTime?: number;
  competitorKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentPlan {
  id: string;
  name: string;
  description?: string;
  year: number;
  companyId: string;
  userId: string;
  topics: ContentTopic[];
  goals: ContentGoal[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface TopicCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface SeasonalEvent {
  id: string;
  name: string;
  date: string; // ISO date string
  type: 'holiday' | 'industry_event' | 'product_cycle' | 'awareness_day';
  description?: string;
  relevantIndustries?: string[];
}

export type ContentGoal = 
  | 'brand_awareness' 
  | 'thought_leadership' 
  | 'product_promotion' 
  | 'lead_generation' 
  | 'recruitment' 
  | 'customer_education' 
  | 'industry_insights' 
  | 'company_culture';

// Request/Response types for API
export interface GenerateContentTopicsRequest {
  companyId: string;
  year: number;
  monthlyTopicCount: number;
  categories: TopicCategory[];
  contentGoals: ContentGoal[];
  includeSeasonal: boolean;
  focusKeywords: string[];
  additionalInstructions: string;
}

export interface GenerateContentTopicsResponse {
  topics: ContentTopic[];
  plan: Omit<ContentPlan, 'id' | 'createdAt' | 'updatedAt'>;
  suggestions: {
    recommendedCategories: TopicCategory[];
    seasonalOpportunities: SeasonalEvent[];
    keywordOpportunities: string[];
  };
}

export interface UpdateContentTopicRequest {
  title?: string;
  description?: string;
  category?: TopicCategory;
  keywords?: string[];
  plannedMonth?: number;
  plannedYear?: number;
  priority?: 'high' | 'medium' | 'low';
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  writerProfileId?: string;
  contentGoals?: ContentGoal[];
  seasonalEvents?: string[];
  seasonalRelevance?: string[];
  targetAudience?: string;
  seoKeywords?: string[];
  estimatedReadTime?: number;
  estimatedReadingTime?: number;
  competitorKeywords?: string[];
}

export interface CreateContentPlanRequest {
  name: string;
  description?: string;
  year: number;
  companyId: string;
  goals: ContentGoal[];
}

export interface UpdateContentPlanRequest {
  name?: string;
  description?: string;
  goals?: ContentGoal[];
  status?: 'draft' | 'active' | 'completed' | 'archived';
}

// Default topic categories
export const DEFAULT_TOPIC_CATEGORIES: TopicCategory[] = [
  { id: 'product', name: 'Product Updates', description: 'Features, releases, and product announcements', color: '#3B82F6' },
  { id: 'behind-scenes', name: 'Behind the Scenes', description: 'Company culture, team insights, and processes', color: '#8B5CF6' },
  { id: 'thought-leadership', name: 'Thought Leadership', description: 'Industry insights, trends, and expert opinions', color: '#10B981' },
  { id: 'customer-success', name: 'Customer Success', description: 'Case studies, testimonials, and success stories', color: '#F59E0B' },
  { id: 'education', name: 'Educational', description: 'How-to guides, tutorials, and knowledge sharing', color: '#EF4444' },
  { id: 'company-news', name: 'Company News', description: 'Announcements, milestones, and corporate updates', color: '#6B7280' }
];

// Blog Post Types for Story 3.2
export interface BlogPostSection {
  id: string;
  title: string;
  content: string;
  purpose: string; // e.g., "Introduction to challenge", "Case study/example"
  order: number;
  status: 'pending' | 'approved' | 'needs_revision';
  wordCount?: number;
  suggestions?: string[];
}

export interface BlogPostOutline {
  id: string;
  title: string;
  sections: BlogPostSection[];
  estimatedWordCount: number;
  estimatedReadTime: number; // in minutes
  keyTakeaways: string[];
  targetAudience: string;
  seoFocusKeywords: string[];
}

export interface BlogPost {
  id: string;
  contentTopicId: string;
  companyId: string;
  userId: string;
  writerProfileId?: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  outline: BlogPostOutline;
  fullContent: string;
  status: 'draft' | 'outline_review' | 'content_review' | 'approved' | 'published';
  sections: BlogPostSection[];
  wordCount: number;
  targetWordCount: number;
  estimatedReadTime: number;
  seoMetadata: {
    metaTitle: string;
    metaDescription: string;
    focusKeywords: string[];
    slug: string;
  };
  tags: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types for Story 3.2
export interface GenerateBlogPostRequest {
  contentTopicId: string;
  writerProfileId?: string;
  additionalInstructions?: string;
  targetWordCount?: number; // default: 2000-3000 words for 5-6 A4 pages
  includeOutline?: boolean; // default: true
}

export interface GenerateBlogPostResponse {
  blogPost: BlogPost;
  outline: BlogPostOutline;
  suggestions: {
    alternativeTitles: string[];
    additionalSections: string[];
    relatedTopics: string[];
  };
}

export interface UpdateBlogPostSectionRequest {
  sectionId: string;
  title?: string;
  content?: string;
  purpose?: string;
  status?: 'pending' | 'approved' | 'needs_revision';
  suggestions?: string[];
}

export interface RegenerateBlogPostSectionRequest {
  sectionId: string;
  instructions?: string;
  tone?: string;
  length?: 'shorter' | 'longer' | 'same';
}

export interface UpdateBlogPostSectionResponse {
  section: BlogPostSection;
  message?: string;
}

export interface RegenerateBlogPostSectionResponse {
  section: BlogPostSection;
  message?: string;
}

export interface DeleteBlogPostSectionRequest {
  sectionId: string;
}

export interface DeleteBlogPostSectionResponse {
  success: boolean;
  message?: string;
}

export interface ApproveBlogPostRequest {
  blogPostId: string;
  status: 'approved' | 'published';
}

// Default content goals
export const CONTENT_GOALS: ContentGoal[] = [
  'brand_awareness',
  'thought_leadership', 
  'product_promotion',
  'lead_generation',
  'recruitment',
  'customer_education',
  'industry_insights',
  'company_culture'
];

// Social Media Post Types for Story 4.1
export type SocialMediaPlatform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | 'threads' | 'reddit';

export interface SocialMediaPost {
  id: string;
  blogPostId: string;
  platform: SocialMediaPlatform;
  writerProfileId: string;
  content: string;
  hashtags: string[];
  emojis: string[];
  callToAction?: string;
  characterCount: number;
  mediaType: 'text' | 'image' | 'video' | 'carousel';
  visualConcepts?: VisualConcept[];
  angle: 'technical' | 'emotional' | 'news' | 'educational' | 'inspirational';
  status: 'draft' | 'approved' | 'scheduled' | 'published';
  scheduledFor?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisualConcept {
  id: string;
  type: 'image' | 'video' | 'carousel' | 'quote_card' | 'chart' | 'infographic';
  description: string;
  aiPrompt?: string; // For AI image generation tools (DALL·E, Midjourney, etc.)
  sceneIdeas?: string[]; // For video content - step-by-step scene breakdown
  duration?: number; // For video content in seconds
  script?: string; // Video script text for TikTok/YouTube
  suggestedCTAs?: string[]; // Platform-specific call-to-action suggestions
}

export interface SocialMediaContentPlan {
  id: string;
  blogPostId: string;
  companyId: string;
  userId: string;
  posts: SocialMediaPost[];
  selectedPlatforms: SocialMediaPlatform[];
  selectedWriterProfiles: string[];
  publishingFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  status: 'draft' | 'approved' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types for Story 4.1
export interface GenerateSocialPostsRequest {
  blogPostId: string;
  platforms: SocialMediaPlatform[];
  writerProfileIds?: string[];
  includeVisuals?: boolean;
  postsPerPlatform?: number; // Default: 3-5 posts per platform
}

export interface GenerateSocialPostsResponse {
  contentPlan: SocialMediaContentPlan;
  posts: SocialMediaPost[];
  insights: {
    keyTakeaways: string[];
    quotableSegments: string[];
    angleVariations: string[];
  };
}

export interface UpdateSocialPostRequest {
  postId: string;
  content?: string;
  hashtags?: string[];
  emojis?: string[];
  callToAction?: string;
  visualConcepts?: VisualConcept[];
  status?: 'draft' | 'approved' | 'scheduled';
  scheduledFor?: Date;
}

export interface RegenerateSocialPostRequest {
  postId: string;
  angle?: 'technical' | 'emotional' | 'news' | 'educational' | 'inspirational';
  tone?: string;
  includeMoreEmojis?: boolean;
  focusOn?: string; // Specific aspect to focus on
}

// Platform-specific constraints

// ================================================
// EPIC 5: CONTENT MANAGEMENT & ORGANIZATION TYPES
// ================================================

// Story 5.1: Centralized Content Library Types

export type ContentAssetType = 'blog_post' | 'social_post' | 'reusable_snippet' | 'visual_asset' | 'media_asset';

export type ContentStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export interface ContentTag {
  id: string;
  name: string;
  type: 'topic' | 'audience' | 'product' | 'campaign' | 'custom';
  color?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentAsset {
  id: string;
  title: string;
  description?: string;
  type: ContentAssetType;
  status: ContentStatus;
  
  // Content references
  blogPostId?: string;
  socialPostId?: string;
  contentSnippetId?: string;
  mediaAssetId?: string;
  
  // Organization
  tags: string[]; // Array of tag IDs
  category?: string;
  
  // Metadata
  companyId: string;
  userId: string; // Creator
  createdAt: Date;
  updatedAt: Date;
  
  // Usage tracking
  timesUsed?: number;
  lastUsed?: Date;
  usageHistory?: AssetUsage[];
  
  // File info (for media assets)
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  url?: string;
  thumbnailUrl?: string;
}

export interface AssetUsage {
  id: string;
  assetId: string;
  usedInType: 'blog_post' | 'social_post' | 'campaign';
  usedInId: string;
  usedAt: Date;
  usedBy: string; // User ID
  platform?: string; // For social posts
}

export interface ReusableSnippet {
  id: string;
  title: string;
  content: string;
  type: 'intro' | 'conclusion' | 'cta' | 'quote' | 'statistic' | 'custom';
  tags: string[];
  companyId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  timesUsed: number;
  lastUsed?: Date;
}

export interface MediaAsset {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  
  // Media-specific metadata
  width?: number;
  height?: number;
  duration?: number; // For videos
  
  // Organization
  tags: string[];
  category?: string;
  
  // Metadata
  companyId: string;
  userId: string;
  uploadedAt: Date;
  updatedAt: Date;
  
  // Usage tracking
  timesUsed: number;
  lastUsed?: Date;
  usageHistory: AssetUsage[];
}

// Content Library API Types
export interface ContentLibraryFilter {
  type?: ContentAssetType | ContentAssetType[];
  status?: ContentStatus | ContentStatus[];
  tags?: string[]; // Tag IDs
  category?: string;
  companyId?: string;
  userId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  search?: string;
}

export interface ContentLibrarySearchRequest {
  filters: ContentLibraryFilter;
  sort?: {
    field: 'createdAt' | 'updatedAt' | 'title' | 'timesUsed' | 'lastUsed';
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface ContentLibrarySearchResponse {
  assets: ContentAsset[];
  snippets: ReusableSnippet[];
  mediaAssets: MediaAsset[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  tags: ContentTag[]; // Available tags for filtering
}

export interface CreateContentTagRequest {
  name: string;
  type: 'topic' | 'audience' | 'product' | 'campaign' | 'custom';
  color?: string;
  description?: string;
}

export interface UpdateContentAssetRequest {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  status?: ContentStatus;
}

export interface CreateReusableSnippetRequest {
  title: string;
  content: string;
  type: 'intro' | 'conclusion' | 'cta' | 'quote' | 'statistic' | 'custom';
  tags?: string[];
}

export interface UpdateReusableSnippetRequest {
  id: string;
  title?: string;
  content?: string;
  type?: 'intro' | 'conclusion' | 'cta' | 'quote' | 'statistic' | 'custom';
  tags?: string[];
}

// Version Control Types
export type ChangeSource = 'ai_generated' | 'human_edit' | 'system' | 'import';
export type ChangeType = 'create' | 'update' | 'delete' | 'restore';
export type ContentEntityType = 'blog_post' | 'blog_post_section' | 'social_post' | 'snippet';

export interface ContentVersion {
  id: string;
  entityType: ContentEntityType;
  entityId: string;
  versionNumber: number;
  changeType: ChangeType;
  changeSource: ChangeSource;
  
  // Change metadata
  changedBy: string; // User ID
  changedAt: Date;
  changeDescription?: string;
  
  // Content snapshot
  contentSnapshot: any; // Full content at this version
  contentDiff?: any; // JSON diff from previous version
  
  // Relations
  previousVersionId?: string;
  nextVersionId?: string;
  
  // Additional metadata
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ContentRevision {
  id: string;
  blogPostId?: string;
  socialPostId?: string;
  snippetId?: string;
  
  // Paragraph-level tracking for blog posts
  sectionId?: string;
  paragraphIndex?: number;
  
  // Version info
  fromVersion: number;
  toVersion: number;
  
  // Change details
  changeType: ChangeType;
  changeSource: ChangeSource;
  changedBy: string;
  changedAt: Date;
  
  // Content changes
  previousContent: string;
  newContent: string;
  contentDiff: any; // Structured diff
  
  // Metadata
  changeNotes?: string;
  aiPrompt?: string; // If AI-generated
  aiModel?: string;
}

export interface VersionComparisonRequest {
  entityType: ContentEntityType;
  entityId: string;
  fromVersion: number;
  toVersion: number;
}

export interface VersionComparisonResponse {
  entityType: ContentEntityType;
  entityId: string;
  entityTitle: string;
  
  fromVersion: ContentVersion;
  toVersion: ContentVersion;
  
  // Computed differences
  additions: number;
  deletions: number;
  modifications: number;
  
  // Detailed diff
  diff: {
    type: 'added' | 'removed' | 'modified' | 'unchanged';
    field?: string;
    oldValue?: any;
    newValue?: any;
    lineChanges?: {
      oldLine?: number;
      newLine?: number;
      content: string;
      type: 'added' | 'removed' | 'unchanged';
    }[];
  }[];
  
  // Summary
  summary: {
    totalChanges: number;
    changesBySource: Record<ChangeSource, number>;
    changesByUser: Record<string, number>;
  };
}

export interface RestoreVersionRequest {
  entityType: ContentEntityType;
  entityId: string;
  targetVersion: number;
  restoreNotes?: string;
}

export interface ContentHistoryRequest {
  entityType: ContentEntityType;
  entityId: string;
  sectionId?: string; // For paragraph-level history
  paragraphIndex?: number;
  
  filters?: {
    changeSource?: ChangeSource[];
    changedBy?: string[];
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
  
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface ContentHistoryResponse {
  entityType: ContentEntityType;
  entityId: string;
  entityTitle: string;
  
  versions: ContentVersion[];
  revisions: ContentRevision[];
  
  totalVersions: number;
  totalPages: number;
  currentPage: number;
  
  // Summary stats
  summary: {
    firstVersion: Date;
    lastModified: Date;
    totalChanges: number;
    aiChanges: number;
    humanChanges: number;
    contributors: {
      userId: string;
      userName: string;
      changeCount: number;
      lastChange: Date;
    }[];
  };
}

// Comments & Notifications Types
export type CommentEntityType = 'blog_post' | 'blog_post_section' | 'social_post';
export type CommentStatus = 'active' | 'edited' | 'deleted' | 'resolved';
export type NotificationType = 'comment' | 'mention' | 'status_change' | 'approval_request' | 'approval_response';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Comment {
  id: string;
  entityType: CommentEntityType;
  entityId: string;
  
  // For blog post sections and paragraphs
  sectionId?: string;
  paragraphIndex?: number;
  
  // Comment content
  content: string;
  status: CommentStatus;
  
  // User and metadata
  userId: string;
  userName: string;
  userRole: string;
  
  // Threading
  parentCommentId?: string;
  replies?: Comment[];
  replyCount: number;
  
  // Mentions
  mentions: string[]; // User IDs mentioned in the comment
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  
  // Position (for inline comments)
  selectionStart?: number;
  selectionEnd?: number;
  selectedText?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  
  // Target user
  userId: string;
  
  // Source information
  triggeredBy: string; // User ID who triggered the notification
  triggeredByName: string;
  
  // Content reference
  entityType: CommentEntityType;
  entityId: string;
  entityTitle: string;
  
  // Notification content
  title: string;
  message: string;
  
  // Related comment (for comment/mention notifications)
  commentId?: string;
  commentContent?: string;
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface CreateCommentRequest {
  entityType: CommentEntityType;
  entityId: string;
  sectionId?: string;
  paragraphIndex?: number;
  content: string;
  parentCommentId?: string;
  selectionStart?: number;
  selectionEnd?: number;
  selectedText?: string;
}

export interface UpdateCommentRequest {
  id: string;
  content: string;
}

export interface ResolveCommentRequest {
  id: string;
  resolved: boolean;
}

export interface CommentsRequest {
  entityType: CommentEntityType;
  entityId: string;
  sectionId?: string;
  paragraphIndex?: number;
  includeResolved?: boolean;
  
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface CommentsResponse {
  comments: Comment[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface NotificationsRequest {
  status?: NotificationStatus;
  type?: NotificationType;
  entityType?: CommentEntityType;
  
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  unreadCount: number;
}

export interface MarkNotificationsRequest {
  notificationIds: string[];
  status: NotificationStatus;
}

export interface CommentThread {
  parentComment: Comment;
  replies: Comment[];
  totalReplies: number;
  hasMore: boolean;
}

export interface MentionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CommentMentionRequest {
  query: string;
  entityType: CommentEntityType;
  entityId: string;
  companyId?: string;
}

export interface CommentMentionResponse {
  users: MentionUser[];
}

// Real-time events for comments
export interface CommentEvent {
  type: 'comment_created' | 'comment_updated' | 'comment_deleted' | 'comment_resolved';
  comment: Comment;
  entityType: CommentEntityType;
  entityId: string;
  userId: string;
}

export interface NotificationEvent {
  type: 'notification_created' | 'notification_read' | 'notification_deleted';
  notification: Notification;
  userId: string;
}

// Story 5.5: User Approval Workflows Types
export type ApprovalWorkflowStatus = 'draft' | 'pending_review' | 'in_review' | 'approved' | 'rejected' | 'published' | 'archived';
export type ApprovalAction = 'submit_for_review' | 'approve' | 'reject' | 'request_changes' | 'publish' | 'archive';
export type ApprovalEntityType = 'blog_post' | 'social_post' | 'content_plan' | 'content_topic';

export interface ApprovalWorkflow {
  id: string;
  entityType: ApprovalEntityType;
  entityId: string;
  entityTitle: string;
  
  // Current status
  status: ApprovalWorkflowStatus;
  currentStage: number;
  totalStages: number;
  
  // Author information
  authorId: string;
  authorName: string;
  companyId: string;
  
  // Assignment
  assignedReviewers: string[]; // User IDs
  currentReviewer?: string;
  
  // Approval rules and requirements
  requiresSequentialApproval: boolean; // If true, reviewers must approve in order
  minimumApprovals: number; // Number of approvals needed
  currentApprovals: number;
  
  // Timestamps
  submittedAt?: Date;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Metadata
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ApprovalStep {
  id: string;
  workflowId: string;
  stepNumber: number;
  
  // Step details
  name: string;
  description?: string;
  
  // Reviewer assignment
  assignedReviewers: string[]; // User IDs for this step
  reviewerNames: string[]; // Cached names for display
  
  // Requirements
  requiresAllReviewers: boolean; // If false, any one reviewer can approve
  allowParallelReview: boolean; // Can multiple reviewers review simultaneously
  
  // Status
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  
  // Results
  approvals: ApprovalDecision[];
  finalDecision?: 'approved' | 'rejected';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalDecision {
  id: string;
  workflowId: string;
  stepId: string;
  
  // Decision details
  action: ApprovalAction;
  decision: 'approved' | 'rejected' | 'changes_requested';
  
  // Reviewer information
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  
  // Feedback
  comment?: string;
  changeRequests?: string[];
  attachments?: string[];
  
  // Timing
  decidedAt: Date;
  timeSpentMinutes?: number;
  
  // References
  originalContent?: any; // Snapshot of content at time of review
  suggestedChanges?: any; // Specific change suggestions
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalRule {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  
  // Rule conditions
  entityType: ApprovalEntityType;
  conditions: ApprovalRuleCondition[];
  
  // Workflow configuration
  steps: ApprovalRuleStep[];
  
  // Settings
  isActive: boolean;
  priority: number; // Higher number = higher priority when multiple rules match
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalRuleCondition {
  field: string; // e.g., 'author.role', 'content.wordCount', 'tags'
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface ApprovalRuleStep {
  stepNumber: number;
  name: string;
  description?: string;
  
  // Reviewer assignment
  assignmentType: 'specific_users' | 'role_based' | 'department' | 'random' | 'author_choice';
  assignmentValue: string[]; // User IDs, roles, or departments
  
  // Requirements
  requiresAllReviewers: boolean;
  allowParallelReview: boolean;
  maxReviewTime: number; // Hours until escalation
  
  // Escalation
  escalationEnabled: boolean;
  escalationTo?: string[]; // User IDs to escalate to
  escalationAfterHours?: number;
}

export interface ApprovalTemplate {
  id: string;
  name: string;
  description?: string;
  entityType: ApprovalEntityType;
  companyId: string;
  
  // Template steps
  steps: ApprovalRuleStep[];
  
  // Default settings
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
  defaultDueDate?: number; // Days from submission
  
  // Usage
  isDefault: boolean;
  timesUsed: number;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface CreateApprovalWorkflowRequest {
  entityType: ApprovalEntityType;
  entityId: string;
  entityTitle: string;
  templateId?: string; // Use a template
  customSteps?: ApprovalRuleStep[]; // Or define custom steps
  assignedReviewers?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateApprovalWorkflowRequest {
  id: string;
  assignedReviewers?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  metadata?: Record<string, any>;
}

export interface SubmitForApprovalRequest {
  workflowId: string;
  message?: string; // Optional message to reviewers
}

export interface MakeApprovalDecisionRequest {
  workflowId: string;
  stepId: string;
  decision: 'approved' | 'rejected' | 'changes_requested';
  comment?: string;
  changeRequests?: string[];
  suggestedChanges?: any;
}

export interface BulkApprovalRequest {
  workflowIds: string[];
  decision: 'approved' | 'rejected';
  comment?: string;
}

export interface ApprovalWorkflowsRequest {
  status?: ApprovalWorkflowStatus | ApprovalWorkflowStatus[];
  entityType?: ApprovalEntityType;
  assignedToMe?: boolean;
  authoredByMe?: boolean;
  companyId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  tags?: string[];
  
  sort?: {
    field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status';
    direction: 'asc' | 'desc';
  };
  
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface ApprovalWorkflowsResponse {
  workflows: ApprovalWorkflow[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  
  // Summary statistics
  summary: {
    byStatus: Record<ApprovalWorkflowStatus, number>;
    byPriority: Record<string, number>;
    overdueCount: number;
    dueSoonCount: number; // Due within 24 hours
  };
}

export interface ApprovalWorkflowDetailsResponse {
  workflow: ApprovalWorkflow;
  steps: ApprovalStep[];
  decisions: ApprovalDecision[];
  entityData: any; // The actual content being reviewed
  
  // Permissions for current user
  canApprove: boolean;
  canReject: boolean;
  canEdit: boolean;
  canReassign: boolean;
  
  // Activity timeline
  timeline: ApprovalTimelineEvent[];
}

export interface ApprovalTimelineEvent {
  id: string;
  type: 'created' | 'submitted' | 'assigned' | 'reviewed' | 'approved' | 'rejected' | 'published' | 'commented';
  title: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ApprovalDashboardStats {
  totalWorkflows: number;
  pendingReview: number;
  awaitingMyReview: number;
  approvedToday: number;
  rejectedToday: number;
  overdueItems: number;
  
  // Charts data
  approvalTrends: {
    date: string;
    approved: number;
    rejected: number;
    pending: number;
  }[];
  
  reviewerPerformance: {
    reviewerId: string;
    reviewerName: string;
    totalReviews: number;
    averageTimeHours: number;
    approvalRate: number;
  }[];
  
  contentTypeBreakdown: {
    entityType: ApprovalEntityType;
    count: number;
    averageApprovalTime: number;
  }[];
}

export interface CreateApprovalRuleRequest {
  name: string;
  description?: string;
  entityType: ApprovalEntityType;
  conditions: ApprovalRuleCondition[];
  steps: ApprovalRuleStep[];
  priority?: number;
}

export interface UpdateApprovalRuleRequest {
  id: string;
  name?: string;
  description?: string;
  conditions?: ApprovalRuleCondition[];
  steps?: ApprovalRuleStep[];
  isActive?: boolean;
  priority?: number;
}

export interface ApprovalRulesResponse {
  rules: ApprovalRule[];
  totalCount: number;
}

export interface CreateApprovalTemplateRequest {
  name: string;
  description?: string;
  entityType: ApprovalEntityType;
  steps: ApprovalRuleStep[];
  defaultPriority?: 'low' | 'medium' | 'high' | 'urgent';
  defaultDueDate?: number;
  isDefault?: boolean;
}

export interface ApprovalTemplatesResponse {
  templates: ApprovalTemplate[];
  totalCount: number;
}

// Approval workflow events for real-time updates
export interface ApprovalWorkflowEvent {
  type: 'workflow_created' | 'workflow_submitted' | 'workflow_assigned' | 'decision_made' | 'workflow_completed';
  workflowId: string;
  entityType: ApprovalEntityType;
  entityId: string;
  userId: string;
  data?: any;
  timestamp: Date;
}

// ====================================
// EPIC 6: ANALYTICS & PERFORMANCE INSIGHTS TYPES
// ====================================

// Story 6.1: Content Performance Analytics Types
export type MetricType = 'views' | 'clicks' | 'shares' | 'comments' | 'likes' | 'saves' | 'downloads' | 'engagement_rate' | 'reach' | 'impressions' | 'ctr' | 'conversion_rate' | 'time_spent' | 'bounce_rate';
export type ContentAnalyticsEntityType = 'blog_post' | 'social_post' | 'content_plan' | 'campaign';
export type AnalyticsTimeframe = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
export type AnalyticsSource = 'platform_native' | 'google_analytics' | 'social_platform' | 'email_platform' | 'manual' | 'estimated';

export interface ContentMetric {
  id: string;
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  entityTitle: string;
  
  // Platform information
  platform?: string; // 'linkedin', 'twitter', 'website', etc.
  source: AnalyticsSource;
  
  // Metric details
  metricType: MetricType;
  value: number;
  previousValue?: number; // For comparison
  changePercentage?: number;
  
  // Time information
  measuredAt: Date;
  timeframe: AnalyticsTimeframe;
  periodStart: Date;
  periodEnd: Date;
  
  // Context
  companyId: string;
  userId?: string; // User who recorded/imported the metric
  
  // Metadata
  metadata?: {
    demographicBreakdown?: Record<string, number>;
    geographicBreakdown?: Record<string, number>;
    deviceBreakdown?: Record<string, number>;
    trafficSource?: Record<string, number>;
    referrerData?: any;
    platformSpecificData?: any;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentPerformanceSnapshot {
  id: string;
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  entityTitle: string;
  companyId: string;
  
  // Performance summary
  totalViews: number;
  totalClicks: number;
  totalShares: number;
  totalComments: number;
  totalLikes: number;
  engagementRate: number;
  conversionRate: number;
  
  // Platform breakdown
  platformMetrics: {
    platform: string;
    views: number;
    clicks: number;
    engagement: number;
    reach?: number;
    impressions?: number;
  }[];
  
  // Time series data (last 30 days)
  timeSeriesData: {
    date: string;
    views: number;
    clicks: number;
    engagement: number;
  }[];
  
  // Benchmarks and comparisons
  industryBenchmark?: {
    metric: MetricType;
    benchmarkValue: number;
    percentile: number;
  }[];
  
  companyAverage?: {
    metric: MetricType;
    avgValue: number;
    rank: number; // Rank among company content
  }[];
  
  // Performance insights
  insights: ContentInsight[];
  
  lastUpdated: Date;
  dataFreshness: Date; // When the underlying data was last refreshed
}

export interface ContentInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'opportunity' | 'warning';
  category: 'performance' | 'engagement' | 'reach' | 'conversion' | 'trend' | 'anomaly';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  
  // Data supporting the insight
  metrics: {
    metricType: MetricType;
    value: number;
    change?: number;
    benchmark?: number;
  }[];
  
  // Actionable recommendations
  recommendations?: string[];
  
  // Confidence and reliability
  confidence: number; // 0-100
  dataQuality: 'high' | 'medium' | 'low';
  
  generatedAt: Date;
  validUntil?: Date;
}

export interface AnalyticsQuery {
  entityTypes?: ContentAnalyticsEntityType[];
  entityIds?: string[];
  platforms?: string[];
  metrics: MetricType[];
  
  // Time filtering
  timeframe: AnalyticsTimeframe;
  startDate: Date;
  endDate: Date;
  
  // Grouping and aggregation
  groupBy?: ('platform' | 'entityType' | 'date' | 'author')[];
  aggregation?: 'sum' | 'avg' | 'max' | 'min' | 'count';
  
  // Filtering
  filters?: {
    minViews?: number;
    minEngagement?: number;
    authorIds?: string[];
    tags?: string[];
    status?: string[];
  };
  
  // Comparison
  compareWith?: {
    startDate: Date;
    endDate: Date;
    label: string;
  };
  
  // Pagination and sorting
  pagination?: {
    page: number;
    limit: number;
  };
  
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface AnalyticsResponse {
  data: ContentMetric[];
  aggregatedData: {
    totalViews: number;
    totalClicks: number;
    totalEngagement: number;
    avgEngagementRate: number;
    topPerformingContent: {
      entityId: string;
      entityTitle: string;
      metric: string;
      value: number;
    }[];
  };
  
  // Time series data for charts
  timeSeries: {
    date: string;
    metrics: Record<MetricType, number>;
  }[];
  
  // Comparison data if requested
  comparison?: {
    label: string;
    data: ContentMetric[];
    changePercentage: Record<MetricType, number>;
  };
  
  // Insights and recommendations
  insights: ContentInsight[];
  
  // Metadata
  totalCount: number;
  totalPages: number;
  currentPage: number;
  dataFreshness: Date;
  queryExecutedAt: Date;
}

export interface PlatformIntegration {
  id: string;
  platform: string; // 'google_analytics', 'linkedin', 'twitter', etc.
  companyId: string;
  
  // Connection details
  isConnected: boolean;
  connectionStatus: 'active' | 'expired' | 'error' | 'pending';
  
  // API credentials (encrypted)
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    clientId?: string;
    accountId?: string;
    profileId?: string;
  };
  
  // Sync configuration
  syncEnabled: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  
  // Data mapping
  metricMapping: {
    platformMetric: string;
    internalMetric: MetricType;
    transformFunction?: string;
  }[];
  
  // Error handling
  lastError?: string;
  errorCount: number;
  
  // Settings
  settings: {
    includeHistoricalData: boolean;
    historicalDataRange: number; // days
    enableRealTimeSync: boolean;
    notifyOnErrors: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Story 6.2: Engagement Metrics Dashboard Types
export interface EngagementDashboard {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  userId: string; // Dashboard owner
  
  // Dashboard configuration
  layout: DashboardWidget[];
  
  // Sharing and permissions
  isPublic: boolean;
  sharedWith: string[]; // User IDs
  permissions: {
    canView: string[];
    canEdit: string[];
  };
  
  // Auto-refresh settings
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  
  // Filters applied to entire dashboard
  globalFilters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    platforms?: string[];
    authors?: string[];
    tags?: string[];
  };
  
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'metric_card' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'table' | 'heatmap' | 'funnel' | 'gauge';
  title: string;
  description?: string;
  
  // Layout
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Data configuration
  dataQuery: AnalyticsQuery;
  
  // Visualization settings
  config: {
    showLegend?: boolean;
    showDataLabels?: boolean;
    colors?: string[];
    thresholds?: {
      good: number;
      warning: number;
      critical: number;
    };
    displayFormat?: 'number' | 'percentage' | 'currency' | 'duration';
    aggregationType?: 'sum' | 'avg' | 'max' | 'min';
  };
  
  // Refresh settings
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  lastRefreshedAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface EngagementAlert {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  userId: string; // Alert owner
  
  // Alert conditions
  conditions: {
    metric: MetricType;
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'increases_by' | 'decreases_by';
    threshold: number;
    timeframe: AnalyticsTimeframe;
    platform?: string;
    entityType?: ContentAnalyticsEntityType;
  }[];
  
  // Alert settings
  isActive: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  
  // Notification settings
  notificationChannels: {
    email: boolean;
    inApp: boolean;
    slack?: {
      webhookUrl: string;
      channel: string;
    };
  };
  
  // Recipients
  recipients: string[]; // User IDs
  
  // Alert history
  lastTriggeredAt?: Date;
  triggerCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Story 6.3: A/B Testing Framework Types
export type ABTestStatus = 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
export type ABTestType = 'content_variation' | 'timing' | 'platform' | 'audience' | 'creative';

export interface ABTest {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  userId: string; // Test creator
  
  // Test configuration
  type: ABTestType;
  status: ABTestStatus;
  
  // Test variants
  variants: ABTestVariant[];
  
  // Traffic allocation
  trafficAllocation: {
    variantId: string;
    percentage: number;
  }[];
  
  // Success metrics
  primaryMetric: MetricType;
  secondaryMetrics: MetricType[];
  minimumDetectableEffect: number; // percentage
  confidenceLevel: number; // 95, 99, etc.
  
  // Test duration
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Audience targeting
  targetAudience?: {
    platforms?: string[];
    demographics?: Record<string, any>;
    behaviors?: Record<string, any>;
    customSegments?: string[];
  };
  
  // Results
  results?: ABTestResults;
  
  // Settings
  settings: {
    autoStop: boolean;
    autoStopThreshold: number; // confidence threshold
    excludeWeekends: boolean;
    excludeHolidays: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description?: string;
  isControl: boolean;
  
  // Content configuration
  content: {
    entityType: ContentAnalyticsEntityType;
    entityId: string;
    variations?: {
      title?: string;
      content?: string;
      images?: string[];
      cta?: string;
      publishTime?: Date;
      platform?: string;
    };
  };
  
  // Metrics
  metrics: {
    participants: number;
    conversions: number;
    primaryMetricValue: number;
    secondaryMetrics: Record<MetricType, number>;
  };
}

export interface ABTestResults {
  winner?: string; // variantId
  confidence: number;
  pValue: number;
  effect: number; // percentage improvement
  
  // Detailed results per variant
  variantResults: {
    variantId: string;
    variantName: string;
    participants: number;
    conversionRate: number;
    primaryMetricValue: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    isSignificant: boolean;
  }[];
  
  // Statistical analysis
  statisticalPower: number;
  minimumSampleSize: number;
  actualSampleSize: number;
  
  // Insights and recommendations
  insights: string[];
  recommendations: string[];
  
  generatedAt: Date;
}

// Story 6.4: ROI & Conversion Tracking Types
export type ConversionEventType = 'page_view' | 'click' | 'form_submit' | 'download' | 'purchase' | 'signup' | 'trial_start' | 'subscription' | 'custom';

export interface ConversionEvent {
  id: string;
  name: string;
  type: ConversionEventType;
  companyId: string;
  
  // Event configuration
  value: number; // monetary value
  currency: string;
  
  // Tracking configuration
  trackingMethod: 'pixel' | 'api' | 'manual' | 'utm' | 'webhook';
  trackingCode?: string;
  webhookUrl?: string;
  
  // Attribution settings
  attributionModel: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
  attributionWindow: number; // days
  
  // Event properties
  properties: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
  }[];
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversionTracking {
  id: string;
  eventId: string;
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  entityTitle: string;
  companyId: string;
  
  // Conversion details
  conversionValue: number;
  currency: string;
  quantity: number;
  
  // Attribution
  touchpoints: ConversionTouchpoint[];
  attributedTouchpoint: ConversionTouchpoint;
  
  // User information
  userId?: string;
  sessionId?: string;
  visitorId: string;
  
  // Device and context
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  
  // Event properties
  eventProperties: Record<string, any>;
  
  convertedAt: Date;
  createdAt: Date;
}

export interface ConversionTouchpoint {
  id: string;
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  entityTitle: string;
  platform: string;
  
  // Interaction details
  interactionType: 'view' | 'click' | 'share' | 'comment' | 'like' | 'download';
  touchpointPosition: number; // 1st, 2nd, 3rd touch, etc.
  
  // Attribution
  attributionWeight: number; // 0-1
  
  // Timing
  interactedAt: Date;
  timeSinceLastTouch?: number; // minutes
  timeToConversion?: number; // minutes
}

export interface ROIReport {
  id: string;
  name: string;
  companyId: string;
  
  // Report scope
  dateRange: {
    start: Date;
    end: Date;
  };
  
  entityTypes?: ContentAnalyticsEntityType[];
  platforms?: string[];
  campaigns?: string[];
  
  // Financial metrics
  totalInvestment: number;
  totalRevenue: number;
  roi: number; // percentage
  roas: number; // return on ad spend
  
  // Conversion metrics
  totalConversions: number;
  conversionRate: number;
  averageOrderValue: number;
  customerLifetimeValue?: number;
  
  // Content performance
  contentMetrics: {
    entityId: string;
    entityTitle: string;
    entityType: ContentAnalyticsEntityType;
    investment: number;
    revenue: number;
    conversions: number;
    roi: number;
    roas: number;
  }[];
  
  // Channel performance
  channelMetrics: {
    platform: string;
    investment: number;
    revenue: number;
    conversions: number;
    roi: number;
    roas: number;
  }[];
  
  // Insights
  insights: {
    type: 'top_performer' | 'underperformer' | 'opportunity' | 'trend';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    recommendation?: string;
  }[];
  
  generatedAt: Date;
  validUntil: Date;
}

// Story 6.5: Automated Reporting Types
export type ReportFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html';
export type ReportDeliveryMethod = 'email' | 'slack' | 'download' | 'api_webhook';

export interface AutomatedReport {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  userId: string; // Report creator
  
  // Report configuration
  reportType: 'performance' | 'engagement' | 'roi' | 'ab_test' | 'conversion' | 'custom';
  
  // Content scope
  scope: {
    entityTypes?: ContentAnalyticsEntityType[];
    entityIds?: string[];
    platforms?: string[];
    authors?: string[];
    tags?: string[];
    dateRange: 'last_7_days' | 'last_30_days' | 'last_quarter' | 'custom';
    customDateRange?: {
      start: Date;
      end: Date;
    };
  };
  
  // Metrics to include
  metrics: MetricType[];
  includeComparisons: boolean;
  includeBenchmarks: boolean;
  includeInsights: boolean;
  
  // Schedule settings
  frequency: ReportFrequency;
  nextRunAt: Date;
  timezone: string;
  
  // Delivery settings
  deliveryMethod: ReportDeliveryMethod[];
  recipients: string[]; // Email addresses or user IDs
  
  // Format settings
  format: ReportFormat;
  template?: string;
  customizations?: {
    logo?: string;
    branding?: any;
    customSections?: any[];
  };
  
  // Status
  isActive: boolean;
  lastRunAt?: Date;
  lastRunStatus?: 'success' | 'error' | 'running';
  lastRunError?: string;
  runCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  companyId: string;
  
  // Execution details
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // seconds
  
  // Report data
  reportData?: any;
  reportUrl?: string; // URL to download the report
  
  // Delivery status
  deliveryStatus: {
    method: ReportDeliveryMethod;
    status: 'pending' | 'sent' | 'failed';
    recipient?: string;
    error?: string;
    deliveredAt?: Date;
  }[];
  
  // Error information
  error?: string;
  errorDetails?: any;
  
  // Metrics
  recordsProcessed?: number;
  dataPoints?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types for Analytics
export interface CreateAnalyticsQueryRequest {
  query: AnalyticsQuery;
  saveAs?: string; // Save query for reuse
}

export interface CreateDashboardRequest {
  name: string;
  description?: string;
  layout: Omit<DashboardWidget, 'id' | 'createdAt' | 'updatedAt'>[];
  isPublic?: boolean;
  sharedWith?: string[];
}

export interface CreateABTestRequest {
  name: string;
  description?: string;
  type: ABTestType;
  variants: Omit<ABTestVariant, 'id' | 'metrics'>[];
  trafficAllocation: { percentage: number }[]; // matches variants order
  primaryMetric: MetricType;
  secondaryMetrics?: MetricType[];
  startDate: Date;
  endDate: Date;
  targetAudience?: any;
}

export interface CreateConversionEventRequest {
  name: string;
  type: ConversionEventType;
  value: number;
  currency: string;
  trackingMethod: 'pixel' | 'api' | 'manual' | 'utm' | 'webhook';
  attributionModel?: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
  attributionWindow?: number;
}

export interface CreateAutomatedReportRequest {
  name: string;
  description?: string;
  reportType: 'performance' | 'engagement' | 'roi' | 'ab_test' | 'conversion' | 'custom';
  scope: any;
  metrics: MetricType[];
  frequency: ReportFrequency;
  deliveryMethod: ReportDeliveryMethod[];
  recipients: string[];
  format: ReportFormat;
}

// ====================================
// EPIC 7: AI TRAINING & OPTIMIZATION TYPES
// ====================================

// Story 7.1: Content Performance Learning System Types
export type LearningDataType = 'performance' | 'engagement' | 'conversion' | 'audience' | 'content_features' | 'temporal' | 'competitive';
export type FeatureType = 'categorical' | 'numerical' | 'text' | 'temporal' | 'boolean' | 'embedding';
export type ModelType = 'regression' | 'classification' | 'clustering' | 'recommendation' | 'forecasting' | 'optimization';

export interface LearningDataPoint {
  id: string;
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  companyId: string;
  
  // Feature data
  features: {
    [key: string]: any;
  };
  
  // Target variables (what we're learning to predict)
  targets: {
    performance: number; // Overall performance score
    engagement_rate: number;
    conversion_rate: number;
    virality_score: number;
    retention_score: number;
  };
  
  // Context and metadata
  context: {
    platform: string;
    audience_segment?: string;
    campaign_id?: string;
    author_id: string;
    publish_time: Date;
    content_type: string;
    industry: string;
    competitive_landscape?: any;
  };
  
  // Data quality indicators
  dataQuality: {
    completeness: number; // 0-1
    accuracy: number; // 0-1
    recency: number; // days since data point
    reliability: 'high' | 'medium' | 'low';
  };
  
  // Learning metadata
  isTrainingData: boolean;
  isValidationData: boolean;
  isTestData: boolean;
  weight: number; // importance weight for training
  
  collectedAt: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  type: FeatureType;
  category: string;
  
  // Feature extraction configuration
  extraction: {
    source: 'content' | 'metadata' | 'performance' | 'engagement' | 'external' | 'computed';
    method: string; // e.g., 'word_count', 'sentiment_analysis', 'readability_score'
    parameters?: Record<string, any>;
    dependencies?: string[]; // other features this depends on
  };
  
  // Feature properties
  isRequired: boolean;
  defaultValue?: any;
  
  // Statistics and validation
  statistics?: {
    min?: number;
    max?: number;
    mean?: number;
    std?: number;
    nullCount: number;
    uniqueCount: number;
    distribution?: any;
  };
  
  // Importance and impact
  importance: number; // 0-1, learned from model training
  impact: 'positive' | 'negative' | 'neutral';
  
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentInsightModel {
  id: string;
  name: string;
  description: string;
  companyId: string;
  
  // Model configuration
  modelType: ModelType;
  algorithm: string; // 'random_forest', 'gradient_boosting', 'neural_network', etc.
  version: string;
  
  // Training configuration
  features: string[]; // feature IDs
  targets: string[]; // target variable names
  hyperparameters: Record<string, any>;
  
  // Model performance
  performance: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    mse?: number;
    r2Score?: number;
    crossValidationScore: number;
  };
  
  // Training metadata
  trainingData: {
    sampleCount: number;
    featureCount: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    dataQuality: number;
  };
  
  // Model artifacts
  modelPath: string; // path to saved model
  featureImportance: {
    feature: string;
    importance: number;
  }[];
  
  // Deployment
  status: 'training' | 'ready' | 'deployed' | 'deprecated' | 'failed';
  deployedAt?: Date;
  lastTrainedAt: Date;
  nextTrainingAt?: Date;
  
  // Usage statistics
  predictionCount: number;
  averageLatency: number; // ms
  errorRate: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Story 7.2: AI Model Training Pipeline Types
export type TrainingJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type TrainingStage = 'data_preparation' | 'feature_engineering' | 'model_training' | 'validation' | 'deployment';

export interface TrainingJob {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  userId: string;
  
  // Job configuration
  modelId: string;
  trainingConfig: {
    algorithm: string;
    hyperparameters: Record<string, any>;
    crossValidationFolds: number;
    testSplitRatio: number;
    randomSeed: number;
  };
  
  // Data configuration
  dataConfig: {
    startDate: Date;
    endDate: Date;
    minSamples: number;
    features: string[];
    targets: string[];
    filters?: Record<string, any>;
  };
  
  // Job status
  status: TrainingJobStatus;
  currentStage: TrainingStage;
  progress: number; // 0-100
  
  // Results
  results?: {
    modelPerformance: any;
    featureImportance: any[];
    validationResults: any;
    modelArtifacts: {
      modelPath: string;
      metadataPath: string;
      weightsPath?: string;
    };
  };
  
  // Execution details
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // seconds
  computeResources?: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  
  // Error handling
  error?: string;
  errorDetails?: any;
  retryCount: number;
  maxRetries: number;
  
  // Scheduling
  scheduledAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingPipeline {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  
  // Pipeline configuration
  stages: {
    name: string;
    type: TrainingStage;
    config: Record<string, any>;
    dependencies?: string[];
    timeout?: number; // seconds
    retryPolicy?: {
      maxRetries: number;
      backoffMultiplier: number;
    };
  }[];
  
  // Triggers
  triggers: {
    type: 'schedule' | 'data_threshold' | 'performance_degradation' | 'manual';
    config: Record<string, any>;
    isActive: boolean;
  }[];
  
  // Resource requirements
  resources: {
    defaultCpu: number;
    defaultMemory: number;
    defaultGpu?: number;
    maxConcurrentJobs: number;
  };
  
  // Monitoring
  healthChecks: {
    dataQuality: boolean;
    modelPerformance: boolean;
    resourceUsage: boolean;
  };
  
  // Status
  isActive: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  runCount: number;
  successRate: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Story 7.3: Personalized Content Recommendations Types
export type RecommendationType = 'content_topic' | 'writing_style' | 'posting_time' | 'platform' | 'audience_segment' | 'content_format';
export type RecommendationContext = 'creation' | 'optimization' | 'distribution' | 'strategy';

export interface ContentRecommendation {
  id: string;
  type: RecommendationType;
  context: RecommendationContext;
  companyId: string;
  userId: string;
  
  // Recommendation details
  title: string;
  description: string;
  recommendation: any; // specific recommendation data
  
  // Confidence and reasoning
  confidence: number; // 0-1
  reasoning: string[];
  supportingData: {
    metric: string;
    value: number;
    benchmark?: number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  
  // Impact prediction
  predictedImpact: {
    metric: MetricType;
    expectedImprovement: number; // percentage
    confidenceInterval: {
      lower: number;
      upper: number;
    };
  }[];
  
  // Priority and urgency
  priority: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'low' | 'medium' | 'high';
  
  // Implementation
  actionable: boolean;
  implementationSteps?: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  
  // Personalization
  personalizedFor: {
    userId: string;
    userName: string;
    role: string;
    preferences?: Record<string, any>;
  };
  
  // Lifecycle
  status: 'active' | 'accepted' | 'dismissed' | 'implemented' | 'expired';
  expiresAt?: Date;
  implementedAt?: Date;
  feedback?: {
    rating: number; // 1-5
    comment?: string;
    wasHelpful: boolean;
  };
  
  // Source model
  generatedBy: {
    modelId: string;
    modelVersion: string;
    algorithm: string;
  };
  
  generatedAt: Date;
  updatedAt: Date;
}

export interface RecommendationEngine {
  id: string;
  name: string;
  description: string;
  companyId: string;
  
  // Engine configuration
  type: RecommendationType;
  algorithm: 'collaborative_filtering' | 'content_based' | 'hybrid' | 'deep_learning' | 'rule_based';
  
  // Model configuration
  modelIds: string[]; // underlying models used
  weights: Record<string, number>; // weights for different models
  
  // Personalization settings
  personalizationLevel: 'none' | 'basic' | 'advanced' | 'deep';
  userFeatures: string[]; // user features to consider
  contextFeatures: string[]; // contextual features
  
  // Filtering and ranking
  filters: {
    minConfidence: number;
    maxRecommendations: number;
    diversificationWeight: number;
    noveltyWeight: number;
    popularityWeight: number;
  };
  
  // Performance tracking
  performance: {
    clickThroughRate: number;
    acceptanceRate: number;
    implementationRate: number;
    averageRating: number;
    userSatisfaction: number;
  };
  
  // Status
  isActive: boolean;
  isDefault: boolean;
  lastTrainedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// Story 7.4: Predictive Analytics Engine Types
export type PredictionType = 'performance' | 'engagement' | 'virality' | 'conversion' | 'trend' | 'anomaly' | 'lifecycle';
export type PredictionHorizon = 'short_term' | 'medium_term' | 'long_term'; // 1 week, 1 month, 3+ months

export interface ContentPrediction {
  id: string;
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  entityTitle: string;
  companyId: string;
  
  // Prediction details
  predictionType: PredictionType;
  horizon: PredictionHorizon;
  
  // Predicted values
  predictions: {
    metric: MetricType;
    predictedValue: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    probability?: number; // for classification predictions
  }[];
  
  // Model information
  modelId: string;
  modelVersion: string;
  modelConfidence: number;
  
  // Input features used
  inputFeatures: Record<string, any>;
  featureImportance: {
    feature: string;
    importance: number;
  }[];
  
  // Scenario analysis
  scenarios?: {
    name: string;
    description: string;
    modifications: Record<string, any>;
    predictedOutcome: any;
    likelihood: number;
  }[];
  
  // Validation and accuracy
  actualValue?: number; // filled in after the prediction period
  accuracy?: number; // how accurate was the prediction
  validated: boolean;
  validatedAt?: Date;
  
  // Metadata
  predictedAt: Date;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrendAnalysis {
  id: string;
  companyId: string;
  
  // Trend identification
  trendType: 'content_performance' | 'audience_behavior' | 'platform_changes' | 'competitive' | 'seasonal';
  category: string;
  description: string;
  
  // Trend data
  trendData: {
    period: string;
    value: number;
    change: number;
    significance: number;
  }[];
  
  // Statistical analysis
  statistics: {
    direction: 'up' | 'down' | 'stable' | 'volatile';
    strength: number; // 0-1
    significance: number; // p-value
    r2Score: number;
    seasonality?: {
      detected: boolean;
      period?: number;
      strength?: number;
    };
  };
  
  // Predictions
  forecast: {
    period: string;
    predictedValue: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
  }[];
  
  // Impact assessment
  impact: {
    affectedEntities: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    opportunityLevel: 'low' | 'medium' | 'high';
    recommendedActions: string[];
  };
  
  // Validation
  isValidated: boolean;
  validationScore?: number;
  
  detectedAt: Date;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Story 7.5: Automated Content Optimization Types
export type OptimizationType = 'title' | 'content' | 'timing' | 'platform' | 'audience' | 'hashtags' | 'cta' | 'format';
export type OptimizationStrategy = 'maximize_engagement' | 'maximize_reach' | 'maximize_conversions' | 'minimize_cost' | 'balance_metrics';

export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  companyId: string;
  
  // Rule configuration
  type: OptimizationType;
  strategy: OptimizationStrategy;
  
  // Trigger conditions
  triggers: {
    condition: string; // e.g., 'engagement_rate < 0.02'
    threshold: number;
    timeWindow: number; // minutes
    minSamples: number;
  }[];
  
  // Optimization logic
  optimization: {
    method: 'rule_based' | 'ml_based' | 'ab_test' | 'genetic_algorithm';
    parameters: Record<string, any>;
    constraints?: Record<string, any>;
  };
  
  // Implementation
  isActive: boolean;
  autoApply: boolean; // if true, applies changes automatically
  requiresApproval: boolean;
  
  // Performance tracking
  appliedCount: number;
  successRate: number;
  averageImprovement: number;
  
  // Limits and safety
  maxChangesPerDay: number;
  cooldownPeriod: number; // minutes between optimizations
  rollbackEnabled: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface OptimizationJob {
  id: string;
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  companyId: string;
  
  // Job configuration
  ruleId: string;
  type: OptimizationType;
  strategy: OptimizationStrategy;
  
  // Current and target states
  originalState: any;
  currentState: any;
  targetMetrics: {
    metric: MetricType;
    targetValue: number;
    currentValue: number;
  }[];
  
  // Optimization process
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'rolled_back';
  progress: number; // 0-100
  
  // Generated optimizations
  suggestions: {
    type: OptimizationType;
    original: any;
    optimized: any;
    predictedImprovement: number;
    confidence: number;
    reasoning: string;
  }[];
  
  // Implementation
  appliedSuggestions: string[]; // IDs of applied suggestions
  appliedAt?: Date;
  approvedBy?: string;
  
  // Results tracking
  results?: {
    actualImprovement: Record<MetricType, number>;
    measurementPeriod: {
      start: Date;
      end: Date;
    };
    significance: number;
  };
  
  // Safety and rollback
  rollbackPlan?: {
    enabled: boolean;
    trigger: string;
    automaticRollback: boolean;
  };
  rolledBackAt?: Date;
  rollbackReason?: string;
  
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MLExperiment {
  id: string;
  name: string;
  description: string;
  companyId: string;
  userId: string;
  
  // Experiment configuration
  hypothesis: string;
  objective: string;
  type: 'model_comparison' | 'feature_importance' | 'hyperparameter_tuning' | 'data_augmentation';
  
  // Experiment design
  design: {
    algorithm: string;
    features: string[];
    targets: string[];
    trainingData: {
      startDate: Date;
      endDate: Date;
      sampleSize: number;
    };
    validationStrategy: 'holdout' | 'cross_validation' | 'time_series_split';
  };
  
  // Variables and parameters
  variables: {
    name: string;
    type: 'hyperparameter' | 'feature' | 'data' | 'architecture';
    values: any[];
    isControlled: boolean;
  }[];
  
  // Results
  results?: {
    bestConfiguration: Record<string, any>;
    bestScore: number;
    allResults: {
      configuration: Record<string, any>;
      score: number;
      metrics: Record<string, number>;
    }[];
    insights: string[];
    recommendations: string[];
  };
  
  // Status
  status: 'draft' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  
  // Execution
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  computeResources?: any;
  
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types for AI Training
export interface CreateLearningDataRequest {
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  features: Record<string, any>;
  targets: Record<string, number>;
  context: any;
  weight?: number;
}

export interface CreateTrainingJobRequest {
  modelId: string;
  trainingConfig: any;
  dataConfig: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: Date;
}

export interface CreateRecommendationEngineRequest {
  name: string;
  description: string;
  type: RecommendationType;
  algorithm: string;
  personalizationLevel: 'none' | 'basic' | 'advanced' | 'deep';
  filters: any;
}

export interface CreateOptimizationRuleRequest {
  name: string;
  description: string;
  type: OptimizationType;
  strategy: OptimizationStrategy;
  triggers: any[];
  optimization: any;
  autoApply?: boolean;
  requiresApproval?: boolean;
}

export interface PredictionRequest {
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  predictionType: PredictionType;
  horizon: PredictionHorizon;
  includeScenarios?: boolean;
}

export interface OptimizationRequest {
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  type: OptimizationType;
  strategy: OptimizationStrategy;
  constraints?: Record<string, any>;
  autoApply?: boolean;
}

// ====================================
// EPIC 8: SECURITY & COMPLIANCE TYPES
// ====================================

// Story 8.1: Data Privacy & GDPR Compliance Types
export type DataSubjectRightType = 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection' | 'automated_decision_making';
export type ConsentType = 'marketing' | 'analytics' | 'personalization' | 'data_processing' | 'third_party_sharing' | 'ai_training';
export type ConsentStatus = 'given' | 'withdrawn' | 'pending' | 'expired' | 'not_required';
export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted' | 'personal' | 'sensitive';

export interface DataSubjectRequest {
  id: string;
  requestType: DataSubjectRightType;
  companyId: string;
  
  // Requester information
  requesterEmail: string;
  requesterName?: string;
  requesterUserId?: string;
  isVerified: boolean;
  verificationMethod?: 'email' | 'identity_document' | 'sso' | 'manual';
  
  // Request details
  description: string;
  scopeEntities?: string[]; // specific content/data requested
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  // Legal basis
  legalBasis: string;
  jurisdiction: 'gdpr' | 'ccpa' | 'lgpd' | 'pipeda' | 'other';
  
  // Processing status
  status: 'received' | 'in_review' | 'processing' | 'completed' | 'rejected' | 'partially_completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Response details
  responseData?: {
    dataExported?: string; // file path or URL
    actionsPerformed?: string[];
    dataDeleted?: string[];
    explanation?: string;
  };
  
  // Compliance tracking
  receivedAt: Date;
  acknowledgedAt?: Date;
  dueDate: Date; // typically 30 days for GDPR
  completedAt?: Date;
  
  // Assignment and workflow
  assignedTo?: string;
  reviewedBy?: string;
  approvedBy?: string;
  
  // Communication
  communicationLog: {
    timestamp: Date;
    type: 'email' | 'phone' | 'portal' | 'letter';
    direction: 'inbound' | 'outbound';
    content: string;
    sentBy?: string;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  companyId: string;
  
  // Consent details
  consentType: ConsentType;
  status: ConsentStatus;
  purpose: string;
  description: string;
  
  // Legal basis
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataCategories: string[]; // types of data this consent covers
  
  // Granular permissions
  permissions: {
    category: string;
    granted: boolean;
    timestamp: Date;
  }[];
  
  // Consent lifecycle
  givenAt?: Date;
  withdrawnAt?: Date;
  expiresAt?: Date;
  lastUpdatedAt?: Date;
  
  // Method and context
  consentMethod: 'explicit' | 'implicit' | 'opt_in' | 'opt_out' | 'pre_ticked' | 'inferred';
  consentInterface: 'web' | 'mobile' | 'api' | 'import' | 'manual';
  
  // Evidence and proof
  evidenceData: {
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    interfaceVersion?: string;
    consentText?: string;
    witnessedBy?: string;
  };
  
  // Withdrawal tracking
  withdrawalMethod?: 'user_portal' | 'email' | 'support_request' | 'automated' | 'admin';
  withdrawalReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DataInventory {
  id: string;
  companyId: string;
  
  // Data identification
  dataCategory: string;
  dataType: string;
  classification: DataClassification;
  description: string;
  
  // Data location and storage
  storageLocation: {
    system: string;
    database?: string;
    table?: string;
    field?: string;
    region?: string;
    cloudProvider?: string;
  }[];
  
  // Data sources and flow
  dataSources: {
    source: string;
    method: string;
    frequency: string;
    lastUpdate?: Date;
  }[];
  
  dataRecipients: {
    recipient: string;
    purpose: string;
    legalBasis: string;
    country?: string;
  }[];
  
  // Retention and lifecycle
  retentionPeriod: number; // days
  retentionReason: string;
  disposalMethod: string;
  archiveDate?: Date;
  deletionDate?: Date;
  
  // Privacy and security
  encryptionStatus: boolean;
  accessControls: string[];
  anonymizationApplied: boolean;
  pseudonymizationApplied: boolean;
  
  // Compliance mapping
  gdprArticle?: string;
  ccpaCategory?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Ownership and governance
  dataController: string;
  dataProcessor?: string;
  dataProtectionOfficer?: string;
  
  lastAuditedAt?: Date;
  nextAuditDue?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Story 8.2: Security Audit & Monitoring Types
export type SecurityEventType = 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system_access' | 'api_access' | 'export' | 'import' | 'admin_action' | 'security_incident';
export type ThreatLevel = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type SecurityAction = 'allow' | 'deny' | 'warn' | 'block' | 'quarantine' | 'escalate';

export interface SecurityEvent {
  id: string;
  eventType: SecurityEventType;
  threatLevel: ThreatLevel;
  companyId: string;
  
  // Event details
  timestamp: Date;
  source: string; // IP address or system identifier
  userId?: string;
  sessionId?: string;
  
  // Request information
  requestMethod?: string;
  requestUrl?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseStatus?: number;
  
  // Security context
  riskScore: number; // 0-100
  anomalyScore?: number; // 0-100 if using ML detection
  geoLocation?: {
    country: string;
    region: string;
    city: string;
    coordinates?: [number, number];
  };
  
  // Device and environment
  userAgent?: string;
  deviceFingerprint?: string;
  isKnownDevice: boolean;
  isTrustedNetwork: boolean;
  
  // Action taken
  action: SecurityAction;
  actionReason: string;
  blockedBy?: string; // rule or system that triggered the block
  
  // Additional context
  metadata: Record<string, any>;
  tags: string[];
  
  // Investigation
  isInvestigated: boolean;
  investigatedBy?: string;
  investigationNotes?: string;
  isFalsePositive?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  companyId: string;
  
  // Rule configuration
  eventTypes: SecurityEventType[];
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'regex';
    value: any;
    caseSensitive?: boolean;
  }[];
  
  // Threat assessment
  baseThreatLevel: ThreatLevel;
  riskMultiplier: number;
  
  // Actions and responses
  actions: {
    action: SecurityAction;
    conditions?: any[];
    notification?: {
      email: boolean;
      slack: boolean;
      sms: boolean;
      recipients: string[];
    };
    quarantineDuration?: number; // minutes
    escalationDelay?: number; // minutes
  }[];
  
  // Rule lifecycle
  isActive: boolean;
  priority: number;
  
  // Performance tracking
  triggeredCount: number;
  falsePositiveCount: number;
  lastTriggeredAt?: Date;
  
  // Compliance
  complianceFrameworks: string[]; // SOX, PCI-DSS, ISO27001, etc.
  auditTrail: {
    timestamp: Date;
    action: string;
    changedBy: string;
    changes: any;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  companyId: string;
  
  // Incident classification
  incidentType: 'data_breach' | 'unauthorized_access' | 'malware' | 'phishing' | 'insider_threat' | 'system_compromise' | 'ddos' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
  
  // Status and workflow
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Assignment
  assignedTo: string;
  reportedBy: string;
  approvedBy?: string;
  
  // Timeline
  detectedAt: Date;
  reportedAt: Date;
  acknowledgedAt?: Date;
  containedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  
  // Impact assessment
  impactAssessment: {
    usersAffected: number;
    dataRecordsAffected: number;
    systemsAffected: string[];
    businessImpact: 'minimal' | 'minor' | 'moderate' | 'major' | 'severe';
    financialImpact?: number;
    reputationalImpact: 'none' | 'low' | 'medium' | 'high';
  };
  
  // Response actions
  responseActions: {
    timestamp: Date;
    action: string;
    performedBy: string;
    outcome: string;
    evidence?: string[];
  }[];
  
  // Evidence and investigation
  evidence: {
    type: 'log' | 'screenshot' | 'document' | 'forensic_image' | 'other';
    description: string;
    filePath: string;
    hash?: string;
    collectedBy: string;
    collectedAt: Date;
  }[];
  
  // Root cause analysis
  rootCause?: string;
  contributingFactors: string[];
  
  // Remediation
  remediationSteps: {
    step: string;
    responsible: string;
    dueDate?: Date;
    completedAt?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  }[];
  
  // Communication
  communicationLog: {
    timestamp: Date;
    type: 'internal' | 'external' | 'regulatory' | 'customer';
    recipient: string;
    message: string;
    sentBy: string;
  }[];
  
  // Regulatory reporting
  regulatoryReporting: {
    required: boolean;
    submitted: boolean;
    authority: string;
    submittedAt?: Date;
    referenceNumber?: string;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Story 8.3: Content Moderation & Safety Types
export type ContentSafetyCategory = 'appropriate' | 'inappropriate' | 'spam' | 'harassment' | 'hate_speech' | 'violence' | 'sexual_content' | 'dangerous_content' | 'copyright_violation' | 'brand_safety_risk';
export type ModerationAction = 'approve' | 'reject' | 'flag' | 'quarantine' | 'modify_required' | 'human_review';
export type SafetyLevel = 'safe' | 'caution' | 'unsafe' | 'blocked';

export interface ContentSafetyCheck {
  id: string;
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  companyId: string;
  
  // Content details
  contentText: string;
  contentImages?: string[];
  contentVideos?: string[];
  contentMetadata?: Record<string, any>;
  
  // Safety assessment
  overallSafety: SafetyLevel;
  confidenceScore: number; // 0-100
  
  // Category analysis
  categoryScores: {
    category: ContentSafetyCategory;
    score: number; // 0-100, higher means more likely to be this category
    confidence: number; // 0-100
    explanation?: string;
  }[];
  
  // Brand safety analysis
  brandSafety: {
    score: number; // 0-100, higher is safer
    risks: {
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }[];
    suitableFor: string[]; // target audiences this is suitable for
  };
  
  // AI analysis details
  aiModels: {
    modelName: string;
    modelVersion: string;
    confidence: number;
    predictions: any;
  }[];
  
  // Moderation decision
  recommendedAction: ModerationAction;
  actionReason: string;
  suggestedModifications?: string[];
  
  // Human review
  requiresHumanReview: boolean;
  humanReviewReason?: string;
  humanReviewer?: string;
  humanDecision?: ModerationAction;
  humanNotes?: string;
  reviewedAt?: Date;
  
  // Compliance and policy
  policyViolations: {
    policy: string;
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    description: string;
  }[];
  
  // Historical context
  authorHistory?: {
    totalContent: number;
    violationCount: number;
    lastViolation?: Date;
    riskScore: number;
  };
  
  checkedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentModerationRule {
  id: string;
  name: string;
  description: string;
  companyId: string;
  
  // Rule configuration
  contentTypes: ContentAnalyticsEntityType[];
  triggers: {
    category: ContentSafetyCategory;
    threshold: number; // score threshold to trigger
    action: ModerationAction;
  }[];
  
  // Brand guidelines
  brandGuidelines: {
    prohibitedWords: string[];
    requiredElements?: string[];
    toneRequirements?: string;
    visualGuidelines?: any;
  };
  
  // Audience considerations
  targetAudiences: {
    audience: string;
    safetyLevel: SafetyLevel;
    customRules?: any[];
  }[];
  
  // Workflow settings
  autoApply: boolean;
  requiresApproval: boolean;
  escalationRules: {
    condition: string;
    escalateTo: string;
    timeoutHours: number;
  }[];
  
  // Performance tracking
  appliedCount: number;
  overrideCount: number;
  falsePositiveRate: number;
  
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

// Story 8.4: Enterprise SSO & Identity Management Types
export type IdentityProvider = 'active_directory' | 'azure_ad' | 'google_workspace' | 'okta' | 'auth0' | 'ping_identity' | 'onelogin' | 'saml' | 'oidc' | 'ldap';
export type AuthenticationMethod = 'password' | 'mfa' | 'sso' | 'certificate' | 'biometric' | 'hardware_token';

export interface IdentityProviderConfig {
  id: string;
  name: string;
  provider: IdentityProvider;
  companyId: string;
  
  // Connection settings
  isActive: boolean;
  isPrimary: boolean;
  domain: string;
  
  // SSO configuration
  ssoConfig: {
    entityId: string;
    ssoUrl: string;
    logoutUrl?: string;
    certificate: string;
    signatureAlgorithm: string;
    nameIdFormat: string;
    attributeMapping: {
      email: string;
      firstName: string;
      lastName: string;
      role?: string;
      department?: string;
      groups?: string;
    };
  };
  
  // OIDC configuration (if applicable)
  oidcConfig?: {
    clientId: string;
    clientSecret: string;
    discoveryUrl: string;
    scopes: string[];
    additionalParams?: Record<string, string>;
  };
  
  // User provisioning
  provisioning: {
    autoProvision: boolean;
    autoDeprovision: boolean;
    updateExistingUsers: boolean;
    defaultRole: string;
    defaultPermissions: string[];
    groupMapping?: Record<string, string>; // external group -> internal role
  };
  
  // Security settings
  security: {
    requireMfa: boolean;
    allowedDomains?: string[];
    sessionTimeout: number; // minutes
    requireCertificate: boolean;
    encryptAssertion: boolean;
  };
  
  // Monitoring
  lastSyncAt?: Date;
  userCount: number;
  failedLoginCount: number;
  lastTestAt?: Date;
  testStatus?: 'success' | 'failed';
  testError?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticationSession {
  id: string;
  userId: string;
  companyId: string;
  
  // Session details
  sessionToken: string;
  refreshToken?: string;
  
  // Authentication context
  authenticationMethod: AuthenticationMethod[];
  identityProvider?: string;
  mfaVerified: boolean;
  
  // Device and location
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  geoLocation?: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  
  // Session lifecycle
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  isActive: boolean;
  
  // Security flags
  isHighRisk: boolean;
  riskFactors: string[];
  requiresReauthentication: boolean;
  
  // Usage tracking
  requestCount: number;
  lastRequestAt: Date;
  
  // Termination
  terminatedAt?: Date;
  terminationReason?: 'logout' | 'timeout' | 'security' | 'admin' | 'error';
  terminatedBy?: string;
  
  updatedAt: Date;
}

// Story 8.5: Compliance Reporting & Documentation Types
export type ComplianceFramework = 'gdpr' | 'ccpa' | 'sox' | 'hipaa' | 'pci_dss' | 'iso27001' | 'fedramp' | 'soc2' | 'nist';
export type AuditStatus = 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface ComplianceReport {
  id: string;
  name: string;
  companyId: string;
  
  // Report configuration
  framework: ComplianceFramework;
  reportType: 'periodic' | 'incident' | 'audit' | 'assessment' | 'certification';
  
  // Scope and period
  reportingPeriod: {
    start: Date;
    end: Date;
  };
  scope: {
    systems: string[];
    processes: string[];
    dataTypes: string[];
    locations: string[];
  };
  
  // Compliance assessment
  overallCompliance: {
    score: number; // 0-100
    status: 'compliant' | 'partially_compliant' | 'non_compliant';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Control assessments
  controls: {
    controlId: string;
    controlName: string;
    requirement: string;
    status: 'implemented' | 'partially_implemented' | 'not_implemented' | 'not_applicable';
    effectiveness: 'low' | 'medium' | 'high';
    evidence: string[];
    gaps?: string[];
    recommendations?: string[];
    riskRating: 'low' | 'medium' | 'high' | 'critical';
  }[];
  
  // Findings and issues
  findings: {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    impact: string;
    recommendation: string;
    status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
    dueDate?: Date;
    assignedTo?: string;
  }[];
  
  // Metrics and KPIs
  metrics: {
    metric: string;
    value: number;
    unit: string;
    trend: 'improving' | 'stable' | 'declining';
    benchmark?: number;
  }[];
  
  // Executive summary
  executiveSummary: {
    keyFindings: string[];
    riskSummary: string;
    recommendedActions: string[];
    resourceRequirements?: string;
  };
  
  // Approval and sign-off
  preparedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  approvalDate?: Date;
  
  // Distribution
  distributedTo: string[];
  distributedAt?: Date;
  
  // Attachments and evidence
  attachments: {
    name: string;
    type: string;
    path: string;
    size: number;
    uploadedAt: Date;
  }[];
  
  generatedAt: Date;
  nextReportDue?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditTrail {
  id: string;
  companyId: string;
  
  // Event identification
  eventType: string;
  category: 'data_access' | 'data_modification' | 'user_management' | 'system_config' | 'security' | 'compliance';
  
  // Actor information
  userId?: string;
  userEmail?: string;
  userRole?: string;
  actorType: 'user' | 'system' | 'api' | 'admin';
  
  // Action details
  action: string;
  resource: string;
  resourceId?: string;
  resourceType?: string;
  
  // Change tracking
  beforeState?: any;
  afterState?: any;
  changeSummary?: string;
  
  // Context
  sessionId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  
  // Business context
  businessJustification?: string;
  approvalReference?: string;
  complianceFramework?: ComplianceFramework[];
  
  // Result
  success: boolean;
  errorMessage?: string;
  
  // Metadata
  metadata: Record<string, any>;
  tags: string[];
  
  // Retention
  retentionPeriod: number; // days
  isArchived: boolean;
  archivedAt?: Date;
  
  timestamp: Date;
  createdAt: Date;
}

export interface CompliancePolicy {
  id: string;
  name: string;
  description: string;
  companyId: string;
  
  // Policy details
  framework: ComplianceFramework;
  version: string;
  effectiveDate: Date;
  expirationDate?: Date;
  
  // Policy content
  requirements: {
    id: string;
    title: string;
    description: string;
    mandatory: boolean;
    controls: string[];
    evidence: string[];
  }[];
  
  // Implementation
  implementationGuide: string;
  trainingRequired: boolean;
  certificationRequired: boolean;
  
  // Approval workflow
  status: 'draft' | 'review' | 'approved' | 'active' | 'superseded' | 'archived';
  approvalWorkflow?: string;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Monitoring and compliance
  complianceScore: number; // 0-100
  lastAssessmentAt?: Date;
  nextAssessmentDue?: Date;
  
  // Violations and exceptions
  violations: {
    date: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    remediation?: string;
    status: 'open' | 'resolved';
  }[];
  
  exceptions: {
    grantedTo: string;
    reason: string;
    approvedBy: string;
    expiresAt: Date;
    conditions?: string[];
  }[];
  
  // Ownership
  owner: string;
  stakeholders: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types for Security & Compliance
export interface CreateDataSubjectRequestRequest {
  requestType: DataSubjectRightType;
  requesterEmail: string;
  requesterName?: string;
  description: string;
  scopeEntities?: string[];
  dateRange?: { start: Date; end: Date };
}

export interface CreateSecurityRuleRequest {
  name: string;
  description: string;
  eventTypes: SecurityEventType[];
  conditions: any[];
  baseThreatLevel: ThreatLevel;
  actions: any[];
}

export interface CreateComplianceReportRequest {
  name: string;
  framework: ComplianceFramework;
  reportType: string;
  reportingPeriod: { start: Date; end: Date };
  scope: any;
}

export interface ContentSafetyCheckRequest {
  entityType: ContentAnalyticsEntityType;
  entityId: string;
  contentText: string;
  contentImages?: string[];
  checkTypes?: ContentSafetyCategory[];
}

export interface CreateIdentityProviderRequest {
  name: string;
  provider: IdentityProvider;
  domain: string;
  ssoConfig: any;
  provisioning: any;
  security: any;
}

// Platform-specific constraints
export const PLATFORM_CONSTRAINTS = {
  twitter: { maxChars: 280, supportsImages: true, supportsVideo: true, maxImages: 4, requiresMedia: false, requiresVideo: false, requiresImage: false },
  linkedin: { maxChars: 3000, supportsImages: true, supportsVideo: true, maxImages: 9, requiresMedia: false, requiresVideo: false, requiresImage: false },
  facebook: { maxChars: 63206, supportsImages: true, supportsVideo: true, maxImages: 10, requiresMedia: false, requiresVideo: false, requiresImage: false },
  instagram: { maxChars: 2200, supportsImages: true, supportsVideo: true, requiresMedia: true, requiresVideo: false, requiresImage: false, maxImages: 10 },
  tiktok: { maxChars: 2200, supportsVideo: true, requiresVideo: true, requiresMedia: false, requiresImage: false, supportsImages: false, maxVideoDuration: 180 },
  youtube: { maxChars: 5000, supportsVideo: true, requiresVideo: true, requiresMedia: false, requiresImage: false, supportsImages: false, maxVideoDuration: 60 }, // For Shorts
  pinterest: { maxChars: 500, supportsImages: true, requiresImage: true, requiresMedia: false, requiresVideo: false, supportsVideo: false },
  threads: { maxChars: 500, supportsImages: true, supportsVideo: true, maxImages: 10, requiresMedia: false, requiresVideo: false, requiresImage: false },
  reddit: { maxChars: 40000, supportsImages: true, supportsVideo: true, requiresMedia: false, requiresVideo: false, requiresImage: false }
} as const;