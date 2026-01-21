-- AI Farm - 教程表扩展脚本
-- 执行此脚本以支持多种内容类型和工具关联
-- 在 Supabase SQL Editor 中执行

-- ============================================
-- Step 1: 添加新字段
-- ============================================

-- 添加内容类型字段（默认为 markdown 保持向后兼容）
ALTER TABLE tutorials 
  ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'markdown';

-- 添加外部链接字段（用于 URL 和视频类型）
ALTER TABLE tutorials 
  ADD COLUMN IF NOT EXISTS external_url TEXT;

-- 添加工具关联字段
ALTER TABLE tutorials 
  ADD COLUMN IF NOT EXISTS tool_id UUID;

-- ============================================
-- Step 2: 修改现有字段约束
-- ============================================

-- 将 content_md 改为可空（URL/视频类型时为空）
ALTER TABLE tutorials 
  ALTER COLUMN content_md DROP NOT NULL;

-- ============================================
-- Step 3: 添加数据完整性约束
-- ============================================

-- 约束1: content_type 必须是有效值
ALTER TABLE tutorials 
  DROP CONSTRAINT IF EXISTS check_content_type;

ALTER TABLE tutorials 
  ADD CONSTRAINT check_content_type 
    CHECK (content_type IN ('markdown', 'url', 'video'));

-- 约束2: 内容一致性检查
-- Markdown 类型：content_md 必填，external_url 为空
-- URL/Video 类型：external_url 必填，content_md 为空
ALTER TABLE tutorials 
  DROP CONSTRAINT IF EXISTS check_content_consistency;

ALTER TABLE tutorials 
  ADD CONSTRAINT check_content_consistency 
    CHECK (
      (content_type = 'markdown' AND content_md IS NOT NULL AND external_url IS NULL) OR
      (content_type IN ('url', 'video') AND external_url IS NOT NULL AND content_md IS NULL)
    );

-- ============================================
-- Step 4: 添加外键关联
-- ============================================

-- 关联到 ai_tools 表（工具删除时教程保留）
ALTER TABLE tutorials 
  DROP CONSTRAINT IF EXISTS fk_tutorial_tool;

ALTER TABLE tutorials 
  ADD CONSTRAINT fk_tutorial_tool 
    FOREIGN KEY (tool_id) 
    REFERENCES ai_tools(id) 
    ON DELETE SET NULL;

-- ============================================
-- Step 5: 创建索引优化查询
-- ============================================

-- 按工具 ID 查询索引
CREATE INDEX IF NOT EXISTS idx_tutorials_tool_id 
  ON tutorials(tool_id);

-- 按内容类型查询索引
CREATE INDEX IF NOT EXISTS idx_tutorials_content_type 
  ON tutorials(content_type);

-- 复合索引：类型 + 推荐状态
CREATE INDEX IF NOT EXISTS idx_tutorials_type_featured 
  ON tutorials(content_type, is_featured);

-- ============================================
-- Step 6: 数据迁移验证
-- ============================================

-- 验证现有教程都已设置为 markdown 类型
DO $$
BEGIN
  -- 确保所有现有教程都是 markdown 类型
  UPDATE tutorials 
  SET content_type = 'markdown'
  WHERE content_type IS NULL OR content_type = '';
  
  RAISE NOTICE '数据迁移完成：% 个教程已设置为 markdown 类型', 
    (SELECT COUNT(*) FROM tutorials WHERE content_type = 'markdown');
END $$;

-- ============================================
-- Step 7: 插入测试数据（演示新功能）
-- ============================================

-- 插入一个 URL 类型教程示例
INSERT INTO tutorials (
  title, 
  author, 
  cover_image, 
  summary, 
  content_type,
  external_url,
  tags, 
  is_featured
) VALUES (
  'OpenAI 官方文档', 
  'OpenAI', 
  'https://via.placeholder.com/800x400?text=OpenAI+Docs',
  '访问 OpenAI 官方文档，了解最新的 API 功能和最佳实践。',
  'url',
  'https://platform.openai.com/docs',
  ARRAY['OpenAI', 'API', '文档'],
  false
);

-- 插入一个视频类型教程示例  
INSERT INTO tutorials (
  title, 
  author, 
  cover_image, 
  summary, 
  content_type,
  external_url,
  tags, 
  is_featured
) VALUES (
  'ChatGPT 使用视频教程', 
  '李明', 
  'https://via.placeholder.com/800x400?text=ChatGPT+Video',
  '观看这个视频，快速掌握 ChatGPT 的核心功能和使用技巧。',
  'video',
  'https://www.youtube.com/watch?v=example',
  ARRAY['ChatGPT', '视频教程', '入门'],
  true
);

-- ============================================
-- Step 8: 验证查询
-- ============================================

-- 查询各类型教程数量
SELECT 
  content_type,
  COUNT(*) as 教程数量,
  SUM(CASE WHEN is_featured THEN 1 ELSE 0 END) as 推荐数量
FROM tutorials
GROUP BY content_type
ORDER BY content_type;

-- 查询关联了工具的教程
SELECT 
  t.title as 教程标题,
  t.content_type as 类型,
  a.name as 关联工具
FROM tutorials t
LEFT JOIN ai_tools a ON t.tool_id = a.id
WHERE t.tool_id IS NOT NULL;

-- 查询所有教程及其关联工具（用于前端展示）
SELECT 
  t.*,
  a.name as tool_name,
  a.image_url as tool_logo
FROM tutorials t
LEFT JOIN ai_tools a ON t.tool_id = a.id
ORDER BY t.created_at DESC
LIMIT 10;

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '教程表扩展完成！';
  RAISE NOTICE '新增功能：';
  RAISE NOTICE '  ✓ 支持 Markdown/URL/Video 三种内容类型';
  RAISE NOTICE '  ✓ 支持关联 AI 工具';
  RAISE NOTICE '  ✓ 添加数据完整性约束';
  RAISE NOTICE '  ✓ 创建查询优化索引';
  RAISE NOTICE '';
  RAISE NOTICE '下一步：在管理后台添加教程管理功能';
END $$;
