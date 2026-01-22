-- ============================================
-- Guestbook Feature - Database Migration
-- ============================================
-- Purpose: Create guestbook table for storing visitor messages
-- Author: AI Farm Team
-- Date: 2026-01-21
-- ============================================

-- Drop existing table if exists (for development only)
DROP TABLE IF EXISTS guestbook CASCADE;

-- ============================================
-- 1. Create Guestbook Table
-- ============================================

CREATE TABLE guestbook (
    -- Primary Key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User Information
    author VARCHAR(100) NOT NULL,
    
    -- Message Content
    content TEXT NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    likes_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Constraints
    CONSTRAINT guestbook_author_length CHECK (LENGTH(author) >= 1 AND LENGTH(author) <= 100),
    CONSTRAINT guestbook_content_length CHECK (LENGTH(content) >= 1),
    CONSTRAINT guestbook_likes_non_negative CHECK (likes_count >= 0)
);

-- ============================================
-- 2. Create Indexes for Performance
-- ============================================

-- Index for time-based sorting (most common query)
CREATE INDEX idx_guestbook_created_at ON guestbook(created_at DESC);

-- Index for filtering approved messages
CREATE INDEX idx_guestbook_approved ON guestbook(is_approved) 
WHERE is_approved = true;

-- Index for sorting by popularity
CREATE INDEX idx_guestbook_likes ON guestbook(likes_count DESC);

-- Index for featured messages
CREATE INDEX idx_guestbook_featured ON guestbook(is_featured) 
WHERE is_featured = true;

-- Composite index for common admin queries
CREATE INDEX idx_guestbook_admin ON guestbook(is_approved, created_at DESC);

-- ============================================
-- 3. Row Level Security (Optional but Recommended)
-- ============================================

-- Enable RLS
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to read approved messages
CREATE POLICY "public_read_approved_guestbook"
ON guestbook FOR SELECT
USING (is_approved = true);

-- Policy: Allow public to insert new messages (submissions)
CREATE POLICY "public_insert_guestbook"
ON guestbook FOR INSERT
WITH CHECK (true);

-- Policy: Allow authenticated users (admins) full access
-- Note: This assumes you're using Supabase Service Key for admin operations
CREATE POLICY "admin_full_access_guestbook"
ON guestbook FOR ALL
USING (auth.role() = 'authenticated');

-- ============================================
-- 4. Helper Functions
-- ============================================

-- Function to increment likes (atomic operation)
CREATE OR REPLACE FUNCTION increment_guestbook_likes(message_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE guestbook
    SET likes_count = likes_count + 1
    WHERE id = message_id
    RETURNING likes_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Insert Test Data
-- ============================================

-- Clear existing test data
DELETE FROM guestbook WHERE author IN ('张三', '李四', '王五', '赵六', '小明', '小红', '大牛', '阿强');

-- Insert sample messages
INSERT INTO guestbook (author, content, is_approved, likes_count, is_featured, created_at) VALUES
-- Featured & Approved
('张三', '这个 AI Farm 网站太棒了！不仅有实用的 AI 工具,还有详细的教程分享。特别喜欢文本生成工具,帮我节省了很多时间。希望能继续看到更多优质内容!', true, 25, true, NOW() - INTERVAL '2 days'),

-- Approved messages
('李四', '教程分享功能很实用,特别是 Markdown 编辑器的介绍写得很详细。建议能否增加一些关于图像处理 AI 工具的教程?期待更新!', true, 18, false, NOW() - INTERVAL '1 day 5 hours'),

('王五', '界面设计非常漂亮,浅蓝色主题看起来很舒服,玻璃拟态效果也很赞!用户体验做得很好,加载速度也很快。👍', true, 15, false, NOW() - INTERVAL '20 hours'),

('赵六', 'AI 工具库很全面,涵盖了文本、图像、视频等多个领域。我经常使用文本摘要功能,准确度很高。希望能添加一个代码生成的 AI 工具。', true, 12, false, NOW() - INTERVAL '12 hours'),

('小红', '刚发现这个网站,感觉是个宝藏!作为 AI 初学者,这里的教程对我帮助很大。能不能出一期关于 Prompt 工程的教程?', true, 9, false, NOW() - INTERVAL '8 hours'),

('大牛', '留言板功能做得不错,终于可以和其他用户交流了!建议增加留言回复功能,这样可以形成更好的社区氛围。', true, 6, false, NOW() - INTERVAL '4 hours'),

-- Pending approval (not visible to public)
('小明', '这是一条测试留言,等待管理员审核。希望能尽快通过!', false, 0, false, NOW() - INTERVAL '2 hours'),

('阿强', '网站功能很强大,但是移动端的体验还可以再优化一下。比如搜索按钮在手机上有点小,点击不太方便。', false, 0, false, NOW() - INTERVAL '1 hour');

-- ============================================
-- 6. Verification Queries
-- ============================================

-- Check table structure
COMMENT ON TABLE guestbook IS 'Guestbook table for storing visitor messages';
COMMENT ON COLUMN guestbook.author IS '留言者姓名';
COMMENT ON COLUMN guestbook.content IS '留言内容';
COMMENT ON COLUMN guestbook.likes_count IS '点赞数';
COMMENT ON COLUMN guestbook.is_approved IS '是否已审核';
COMMENT ON COLUMN guestbook.is_featured IS '是否置顶';

-- Query examples for testing
-- SELECT * FROM guestbook WHERE is_approved = true ORDER BY created_at DESC;
-- SELECT * FROM guestbook ORDER BY likes_count DESC LIMIT 10;
-- SELECT author, LEFT(content, 50) as content_preview, is_approved FROM guestbook;

-- ============================================
-- Migration Complete
-- ============================================

-- Display summary
DO $$
DECLARE
    total_count INTEGER;
    approved_count INTEGER;
    pending_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM guestbook;
    SELECT COUNT(*) INTO approved_count FROM guestbook WHERE is_approved = true;
    SELECT COUNT(*) INTO pending_count FROM guestbook WHERE is_approved = false;
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Guestbook Migration Complete!';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Total messages: %', total_count;
    RAISE NOTICE 'Approved messages: %', approved_count;
    RAISE NOTICE 'Pending approval: %', pending_count;
    RAISE NOTICE '====================================';
END $$;
