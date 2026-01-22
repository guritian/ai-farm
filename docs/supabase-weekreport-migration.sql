-- =====================================================
-- AI 周报功能 - 数据库迁移脚本
-- 创建 weekreports 表用于存储 AI 周报数据
-- =====================================================

-- 1. 创建 weekreports 表
CREATE TABLE IF NOT EXISTS weekreports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    content_md TEXT,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 添加注释
COMMENT ON TABLE weekreports IS 'AI 周报数据表';
COMMENT ON COLUMN weekreports.id IS '周报唯一标识';
COMMENT ON COLUMN weekreports.title IS '周报标题';
COMMENT ON COLUMN weekreports.video_url IS '视频嵌入链接（YouTube、Bilibili 等）';
COMMENT ON COLUMN weekreports.content_md IS 'Markdown 格式的周报内容';
COMMENT ON COLUMN weekreports.published_at IS '发布时间';
COMMENT ON COLUMN weekreports.created_at IS '创建时间';
COMMENT ON COLUMN weekreports.updated_at IS '更新时间';

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_weekreports_published_at 
ON weekreports(published_at DESC);

-- 4. 启用 Row Level Security
ALTER TABLE weekreports ENABLE ROW LEVEL SECURITY;

-- 5. RLS 策略 - 公开读取
CREATE POLICY "weekreports_public_read" ON weekreports
    FOR SELECT
    USING (true);

-- 6. RLS 策略 - 允许插入（管理后台使用 service_role）
CREATE POLICY "weekreports_insert" ON weekreports
    FOR INSERT
    WITH CHECK (true);

-- 7. RLS 策略 - 允许更新
CREATE POLICY "weekreports_update" ON weekreports
    FOR UPDATE
    USING (true);

-- 8. RLS 策略 - 允许删除
CREATE POLICY "weekreports_delete" ON weekreports
    FOR DELETE
    USING (true);

-- 9. 创建更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. 绑定触发器到表
DROP TRIGGER IF EXISTS weekreports_updated_at ON weekreports;
CREATE TRIGGER weekreports_updated_at
    BEFORE UPDATE ON weekreports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 测试数据（可选，用于开发测试）
-- =====================================================

-- INSERT INTO weekreports (title, video_url, content_md, published_at) VALUES
-- (
--     'AI 周报 #1 - 2026年1月第三周',
--     'https://www.youtube.com/embed/dQw4w9WgXcQ',
--     '## 本周 AI 热点

-- ### 1. ChatGPT 最新更新
-- 本周 OpenAI 发布了...

-- ### 2. 新工具推荐
-- - **工具名称**: 简短描述
-- - **工具名称**: 简短描述

-- ### 3. 学习资源
-- 推荐的学习资源列表...',
--     '2026-01-20 10:00:00+08'
-- );
