-- ============================================
-- Guestbook Schema Documentation
-- ============================================
-- This file documents the guestbook table structure
-- for reference and development purposes
-- ============================================

-- Table: guestbook
-- Purpose: Store visitor messages/guestbook entries
-- ============================================

CREATE TABLE IF NOT EXISTS guestbook (
    -- Primary identifier
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Author information
    author VARCHAR(100) NOT NULL,           -- Visitor name (required)
    email VARCHAR(255),                     -- Optional contact email
    
    -- Message content
    content TEXT NOT NULL,                  -- Message text (required)
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,  -- When message was submitted
    
    -- Engagement metrics
    likes_count INTEGER DEFAULT 0 NOT NULL, -- Number of likes received
    
    -- Moderation flags
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,  -- Whether admin approved
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,  -- Whether pinned/highlighted
    
    -- Constraints
    CONSTRAINT guestbook_author_length CHECK (LENGTH(author) >= 1 AND LENGTH(author) <= 100),
    CONSTRAINT guestbook_content_length CHECK (LENGTH(content) >= 1),
    CONSTRAINT guestbook_likes_non_negative CHECK (likes_count >= 0)
);

-- Indexes
CREATE INDEX idx_guestbook_created_at ON guestbook(created_at DESC);
CREATE INDEX idx_guestbook_approved ON guestbook(is_approved) WHERE is_approved = true;
CREATE INDEX idx_guestbook_likes ON guestbook(likes_count DESC);
CREATE INDEX idx_guestbook_featured ON guestbook(is_featured) WHERE is_featured = true;
CREATE INDEX idx_guestbook_admin ON guestbook(is_approved, created_at DESC);

-- ============================================
-- Field Descriptions
-- ============================================

-- id: Unique identifier (UUID v4)
--   - Auto-generated on insert
--   - Used for likes tracking and admin operations

-- author: Visitor's name
--   - Required field
--   - Max 100 characters
--   - Displayed publicly on guestbook

-- email: Contact email (optional)
--   - Max 255 characters
--   - Not displayed publicly
--   - Used for follow-up if needed

-- content: Message text
--   - Required field
--   - No max length at database level
--   - Frontend validates max 2000 characters

-- created_at: Submission timestamp
--   - Auto-set to current time
--   - Displayed as relative time ("2 hours ago")
--   - Used for sorting (newest first by default)

-- likes_count: Engagement metric
--   - Starts at 0
--   - Incremented when users like
--   - Used for "most liked" sorting

-- is_approved: Moderation status
--   - Defaults to FALSE (requires approval)
--   - Only TRUE messages visible on public page
--   - Admin can toggle via admin panel

-- is_featured: Highlight status
--   - Defaults to FALSE
--   - Featured messages shown at top
--   - Admin can pin important messages

-- ============================================
-- Common Queries
-- ============================================

-- Get approved messages (newest first)
SELECT id, author, content, created_at, likes_count
FROM guestbook
WHERE is_approved = true
ORDER BY created_at DESC
LIMIT 20;

-- Get most liked messages
SELECT id, author, LEFT(content, 100) as preview, likes_count
FROM guestbook
WHERE is_approved = true
ORDER BY likes_count DESC
LIMIT 10;

-- Admin: Get pending approval
SELECT id, author, LEFT(content, 50) as preview, created_at
FROM guestbook
WHERE is_approved = false
ORDER BY created_at DESC;

-- Admin: Search messages
SELECT id, author, LEFT(content, 100) as preview, is_approved
FROM guestbook
WHERE author ILIKE '%search_term%' 
   OR content ILIKE '%search_term%'
ORDER BY created_at DESC;

-- Increment likes (use helper function)
SELECT increment_guestbook_likes('message-uuid-here');

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Public can read approved messages only
CREATE POLICY "public_read_approved_guestbook"
ON guestbook FOR SELECT
USING (is_approved = true);

-- Public can insert new messages
CREATE POLICY "public_insert_guestbook"
ON guestbook FOR INSERT
WITH CHECK (true);

-- Admins have full access
CREATE POLICY "admin_full_access_guestbook"
ON guestbook FOR ALL
USING (auth.role() = 'authenticated');
