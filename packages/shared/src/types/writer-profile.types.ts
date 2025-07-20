export type WriterTone = 'Professional' | 'Casual' | 'Technical' | 'Inspirational' | 'Friendly';
export type WriterStyle = 'Informative' | 'Persuasive' | 'Educational' | 'Entertaining' | 'Analytical';
export type CompanySizeIndicator = 'Startup' | 'SMB' | 'Enterprise' | 'Corporation';
export type TargetMarket = 'B2B' | 'B2C' | 'B2B2C';

export interface WriterProfile {
  id: string;
  companyId: string;
  userId: string;
  name: string; // e.g., "Marketing Director Voice"
  position: string;
  tone: WriterTone;
  style: WriterStyle;
  targetAudience: string;
  contentFocusAreas: string[];
  socialPlatforms: string[]; // Platform IDs
  companyFocusTips: string[];
  isCustom: boolean; // true if user-created/modified
  isActive: boolean; // false if user deactivated
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyContext {
  id: string;
  companyId: string;
  industryVertical: string;
  companySizeIndicator: CompanySizeIndicator;
  targetMarket: TargetMarket;
  contentThemes: string[];
  keyDifferentiators: string[];
  competitivePosition: string;
  brandPersonality: string[];
  generatedInsights: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialPlatform {
  id: string;
  name: string; // Internal identifier (e.g., 'linkedin', 'twitter')
  displayName: string; // User-facing name (e.g., 'LinkedIn', 'X (Twitter)')
  description: string;
  characterLimit?: number;
  mediaSupport: string[]; // ['image', 'video', 'audio', 'document']
  audienceType: string; // 'Professional', 'General', 'Creative', etc.
  contentFormats: string[]; // ['post', 'article', 'story', 'reel']
  isActive: boolean;
  platformColor?: string; // For UI theming
  iconUrl?: string;
  category: 'professional' | 'social' | 'visual' | 'video' | 'blogging';
}

export interface CreateWriterProfileRequest {
  companyId: string;
  name: string;
  position: string;
  tone: WriterTone;
  style: WriterStyle;
  targetAudience: string;
  contentFocusAreas: string[];
  socialPlatforms?: string[];
}

export interface UpdateWriterProfileRequest {
  name?: string;
  position?: string;
  tone?: WriterTone;
  style?: WriterStyle;
  targetAudience?: string;
  contentFocusAreas?: string[];
  socialPlatforms?: string[];
  isActive?: boolean;
}

export interface GenerateWriterProfilesRequest {
  companyId: string;
  count?: number; // Default 3
  includeCustomization?: boolean;
}

export interface WriterProfileGeneration {
  profiles: WriterProfile[];
  companyContext: CompanyContext;
  suggestedPlatforms: SocialPlatform[];
}

export interface WriterProfileTemplate {
  industry: string;
  profiles: {
    name: string;
    position: string;
    tone: WriterTone;
    style: WriterStyle;
    targetAudience: string;
    contentFocusAreas: string[];
    tipTemplates: string[];
  }[];
}