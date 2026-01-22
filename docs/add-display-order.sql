-- ============================================
-- 添加展示顺序字段 - 数据库迁移脚本
-- ============================================
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- ============================================
-- 1. 为 ai_tools 表添加 display_order 字段
-- ============================================

ALTER TABLE ai_tools 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 创建索引优化排序查询
CREATE INDEX IF NOT EXISTS idx_ai_tools_display_order 
ON ai_tools(display_order ASC);

-- 初始化现有记录的排序值（按创建时间）
WITH ordered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY is_featured DESC, created_at DESC) as rn
    FROM ai_tools
)
UPDATE ai_tools 
SET display_order = ordered.rn
FROM ordered 
WHERE ai_tools.id = ordered.id;

-- ============================================
-- 2. 为 tutorials 表添加 display_order 字段
-- ============================================

ALTER TABLE tutorials 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 创建索引优化排序查询
CREATE INDEX IF NOT EXISTS idx_tutorials_display_order 
ON tutorials(display_order ASC);

-- 初始化现有记录的排序值（按创建时间）
WITH ordered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY is_featured DESC, created_at DESC) as rn
    FROM tutorials
)
UPDATE tutorials 
SET display_order = ordered.rn
FROM ordered 
WHERE tutorials.id = ordered.id;

-- ============================================
-- 3. 添加 RLS 策略允许更新 display_order
-- ============================================

-- ai_tools 更新策略
DROP POLICY IF EXISTS "public_update_ai_tools" ON ai_tools;
CREATE POLICY "public_update_ai_tools"
ON ai_tools FOR UPDATE
USING (true);

-- tutorials 更新策略
DROP POLICY IF EXISTS "public_update_tutorials" ON tutorials;
CREATE POLICY "public_update_tutorials"
ON tutorials FOR UPDATE
USING (true);

-- ============================================
-- 4. 验证
-- ============================================

-- 验证 ai_tools 排序
SELECT name, display_order, is_featured 
FROM ai_tools 
ORDER BY display_order ASC 
LIMIT 10;

-- 验证 tutorials 排序
SELECT title, display_order, is_featured 
FROM tutorials 
ORDER BY display_order ASC 
LIMIT 10;

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '==================================';
  RAISE NOTICE '展示顺序字段添加完成！';
  RAISE NOTICE '==================================';
  RAISE NOTICE '✓ ai_tools.display_order 已添加';
  RAISE NOTICE '✓ tutorials.display_order 已添加';
  RAISE NOTICE '✓ 现有记录已初始化排序值';
  RAISE NOTICE '✓ 更新策略已创建';
  RAISE NOTICE '==================================';
END $$;
