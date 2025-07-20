# Database Schema

The following SQL DDL defines the schema for our PostgreSQL database. This schema is designed to support the data models we discussed, ensuring data integrity, relationships, and efficient querying.

```sql
-- Table: companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    location VARCHAR(255),
    short_description TEXT,
    industry VARCHAR(100),
    sub_industry VARCHAR(100),
    mission TEXT,
    values TEXT[], -- Array of strings
    product_categories TEXT[], -- Array of strings
    target_customers TEXT[], -- Array of strings
    communication_tone VARCHAR(50),
    recent_news TEXT[], -- Array of URLs or summaries
    website_url VARCHAR(255),
    social_profiles JSONB, -- Store as JSONB for flexible key-value pairs (e.g., {"linkedin": "url"})
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient company lookups by name
CREATE INDEX idx_companies_name ON companies(name);

-- Table: writer_profiles
CREATE TABLE writer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tone VARCHAR(50) NOT NULL,
    writing_style VARCHAR(50) NOT NULL,
    target_audience VARCHAR(100) NOT NULL,
    content_focus_areas TEXT[], -- Array of strings
    assigned_social_networks TEXT[], -- Array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick retrieval of writer profiles for a company
CREATE INDEX idx_writer_profiles_company_id ON writer_profiles(company_id);

-- Table: content_plans
CREATE TABLE content_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    frequency_settings JSONB NOT NULL, -- Store as JSONB for flexible frequency options
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Approved', 'Active', 'Archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, year) -- Ensure only one content plan per company per year
);

-- Table: content_plan_topics (A junction table for topics within a content plan)
CREATE TABLE content_plan_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_plan_id UUID NOT NULL REFERENCES content_plans(id) ON DELETE CASCADE,
    month INTEGER, -- Optional, for monthly topics
    topic VARCHAR(500) NOT NULL,
    keywords TEXT[], -- Array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient topic retrieval for a content plan
CREATE INDEX idx_content_plan_topics_plan_id ON content_plan_topics(content_plan_id);

-- Table: blog_posts
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_plan_id UUID NOT NULL REFERENCES content_plans(id) ON DELETE CASCADE,
    topic VARCHAR(500) NOT NULL,
    writer_profile_id UUID NOT NULL REFERENCES writer_profiles(id) ON DELETE RESTRICT, -- Do not delete writer profile if linked to blog posts
    title VARCHAR(500) NOT NULL,
    outline JSONB, -- Store outline structure as JSONB
    full_content_markdown TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'AwaitingReview', 'Approved', 'Published', 'Archived'
    utm_parameters JSONB, -- Store UTM parameters as JSONB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick retrieval of blog posts by content plan and writer
CREATE INDEX idx_blog_posts_content_plan_id ON blog_posts(content_plan_id);
CREATE INDEX idx_blog_posts_writer_profile_id ON blog_posts(writer_profile_id);

-- Table: blog_post_version_history
CREATE TABLE blog_post_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    editor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to users table
    type VARCHAR(10) NOT NULL, -- 'AI' or 'Human'
    changes_summary TEXT,
    snapshot_content_markdown TEXT NOT NULL -- Store the full content of this version
);

-- Index for retrieving versions of a specific blog post
CREATE INDEX idx_blog_post_version_history_post_id ON blog_post_version_history(blog_post_id);

-- Table: social_media_posts
CREATE TABLE social_media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    writer_profile_id UUID NOT NULL REFERENCES writer_profiles(id) ON DELETE RESTRICT,
    platform VARCHAR(50) NOT NULL, -- e.g., 'LinkedIn', 'Instagram', 'X'
    content TEXT NOT NULL,
    visual_concept_prompt TEXT,
    media_asset_url VARCHAR(255),
    hashtags TEXT[], -- Array of strings
    call_to_action VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'AwaitingApproval', 'Approved', 'Scheduled', 'Published', 'Rejected'
    publish_date TIMESTAMP WITH TIME ZONE,
    performance_metrics JSONB, -- Store analytics metrics as JSONB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blog_post_id, writer_profile_id, platform, publish_date) -- Prevent duplicate scheduled posts
);

-- Index for quick retrieval of social media posts
CREATE INDEX idx_social_media_posts_blog_post_id ON social_media_posts(blog_post_id);
CREATE INDEX idx_social_media_posts_writer_platform ON social_media_posts(writer_profile_id, platform);
CREATE INDEX idx_social_media_posts_publish_date ON social_media_posts(publish_date);

-- Table: social_media_post_version_history (similar to blog_post_version_history)
CREATE TABLE social_media_post_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_media_post_id UUID NOT NULL REFERENCES social_media_posts(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    editor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(10) NOT NULL, -- 'AI' or 'Human'
    changes_summary TEXT,
    snapshot_content TEXT NOT NULL -- Store the full content of this version
);

-- Index for retrieving versions of a specific social media post
CREATE INDEX idx_social_media_post_version_history_post_id ON social_media_post_version_history(social_media_post_id);

-- Table: users (for authentication and authorization)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255), -- For local authentication if not using SSO exclusively
    role VARCHAR(50) NOT NULL, -- 'Admin', 'Editor', 'Reviewer', 'Guest'
    platform_access_rights JSONB, -- Store flexible access rights as JSONB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick user lookup by email
CREATE UNIQUE INDEX idx_users_email ON users(email);


-- Function to update updated_at columns automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for tables that need updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_writer_profiles_updated_at
BEFORE UPDATE ON writer_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_plans_updated_at
BEFORE UPDATE ON content_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_posts_updated_at
BEFORE UPDATE ON social_media_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
