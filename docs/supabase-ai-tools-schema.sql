-- AI Farm - AI 工具数据表创建脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 创建 ai_tools 表
CREATE TABLE IF NOT EXISTS ai_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  pricing TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_tools_updated_at 
BEFORE UPDATE ON ai_tools
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用 Row Level Security
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有人可以读取
CREATE POLICY "public_read_ai_tools"
ON ai_tools FOR SELECT
TO public
USING (true);

-- RLS 策略：仅认证用户可以插入（可选，或使用 Service Key）
CREATE POLICY "authenticated_insert_ai_tools"
ON ai_tools FOR INSERT
TO authenticated
WITH CHECK (true);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_ai_tools_tags ON ai_tools USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ai_tools_created_at ON ai_tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tools_is_featured ON ai_tools(is_featured);

-- 插入示例数据

-- 文本生成类
INSERT INTO ai_tools (name, description, url, image_url, tags, features, pricing, is_featured) VALUES
('ChatGPT', 'OpenAI 开发的对话式 AI，能够进行自然对话、写作、编程等多种任务', 'https://chat.openai.com', 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', 
 ARRAY['文本生成', '对话', 'AI助手', '热门'], 
 ARRAY['自然语言对话', '内容创作和编辑', '代码生成和解释', '问答和知识查询', '多语言支持'],
 'Freemium (免费版 + Plus $20/月)', true),

('Claude', 'Anthropic 开发的 AI 助手，擅长长文本分析和代码辅助', 'https://claude.ai', 'https://www.anthropic.com/_next/image?url=%2Fimages%2Ficons%2Fclaude-app-icon.png&w=256&q=75',
 ARRAY['文本生成', '对话', 'AI助手', '代码'],
 ARRAY['长文本处理（100K tokens）', '文档分析', '代码辅助', '专业写作', '数据分析'],
 'Freemium (免费版 + Pro $20/月)', true),

('Gemini', 'Google 开发的多模态 AI，支持文本、图像、视频理解', 'https://gemini.google.com', 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
 ARRAY['文本生成', '图像理解', '多模态', '热门'],
 ARRAY['文本对话', '图像理解和分析', '多模态处理', 'Google 生态整合', '实时网络搜索'],
 'Freemium (免费版 + Advanced $19.99/月)', true);

-- 图像生成类
INSERT INTO ai_tools (name, description, url, image_url, tags, features, pricing, is_featured) VALUES
('Midjourney', '最流行的 AI 图像生成工具，以艺术性和质量著称', 'https://www.midjourney.com', 'https://www.midjourney.com/apple-touch-icon.png',
 ARRAY['图像生成', 'AI绘画', '热门'],
 ARRAY['高质量艺术图像生成', '多种艺术风格', 'Discord 集成', '图像升级和变化', '社区画廊'],
 '付费 ($10-60/月)', true),

('DALL-E 3', 'OpenAI 的图像生成模型，文本理解能力强', 'https://openai.com/dall-e-3', 'https://openaicom.imgix.net/cf717bdb-0c8c-428a-b82b-3c3add87a600/dall-e-3.jpg',
 ARRAY['图像生成', 'AI绘画'], 
 ARRAY['精确的文本理解', '高分辨率图像', '安全内容过滤', 'ChatGPT Plus 集成'],
 'ChatGPT Plus 会员 ($20/月)', false),

('Stable Diffusion', '开源的图像生成模型，可本地运行', 'https://stability.ai', 'https://stability.ai/favicon.ico',
 ARRAY['图像生成', 'AI绘画', '开源', '免费'],
 ARRAY['开源免费', '本地部署', '社区模型丰富', '高度可定制', 'API 接入'],
 '免费（开源）', false);

-- 视频生成类  
INSERT INTO ai_tools (name, description, url, image_url, tags, features, pricing, is_featured) VALUES
('Sora', 'OpenAI 的视频生成模型，能生成高质量长视频', 'https://openai.com/sora', 'https://cdn.openai.com/sora/images/sora-share.png',
 ARRAY['视频生成', '热门'],
 ARRAY['60秒高质量视频', '精确的物理模拟', '复杂场景生成', '多角度镜头', '文本转视频'],
 '敬请期待', true),

('Runway Gen-2', '专业的 AI 视频生成和编辑工具', 'https://runwayml.com', 'https://runwayml.com/favicon.ico',
 ARRAY['视频生成', '视频编辑'],
 ARRAY['文本转视频', '图像转视频', '视频编辑', '绿幕移除', '运动追踪'],
 'Freemium ($12-76/月)', false),

('HeyGen', 'AI 虚拟主播视频生成工具', 'https://www.heygen.com', 'https://www.heygen.com/favicon.ico',
 ARRAY['视频生成', '虚拟主播'],
 ARRAY['AI 数字人生成', '多语言配音', '批量视频制作', '自定义虚拟形象', '营销视频制作'],
 'Freemium ($29-89/月)', false);

-- 代码辅助类
INSERT INTO ai_tools (name, description, url, image_url, tags, features, pricing, is_featured) VALUES
('GitHub Copilot', 'GitHub 官方 AI 编程助手，基于 OpenAI Codex', 'https://github.com/features/copilot', 'https://github.githubassets.com/favicons/favicon.png',
 ARRAY['代码', 'AI助手', '开发工具', '热门'],
 ARRAY['代码自动补全', '函数生成', '单元测试编写', '多语言支持', 'IDE 深度集成'],
 '$10/月（学生免费）', true),

('Cursor', 'AI 优先的代码编辑器，深度集成 AI 辅助', 'https://cursor.sh', 'https://cursor.sh/favicon.ico',
 ARRAY['代码', 'AI助手', '开发工具', '编辑器'],
 ARRAY['AI 代码生成', '对话式编程', '代码解释', '重构建议', '基于 VSCode'],
 'Freemium (Pro $20/月)', false),

('Codeium', '免费的 AI 代码补全工具', 'https://codeium.com', 'https://codeium.com/favicon.ico',
 ARRAY['代码', 'AI助手', '开发工具', '免费'],
 ARRAY['免费无限使用', 'AI 代码补全', '40+ 编程语言', '多 IDE 支持', '本地模型'],
 '免费', false);

-- 其他实用工具
INSERT INTO ai_tools (name, description, url, image_url, tags, features, pricing, is_featured) VALUES
('Notion AI', 'Notion 内置的 AI 写作和整理助手', 'https://www.notion.so/product/ai', 'https://www.notion.so/images/favicon.ico',
 ARRAY['办公', 'AI助手', '写作'],
 ARRAY['智能写作', '内容总结', '翻译', '头脑风暴', '无缝 Notion 集成'],
 'Notion 会员 ($10/月)', false),

('Perplexity', 'AI 驱动的搜索引擎，提供带引用的答案', 'https://www.perplexity.ai', 'https://www.perplexity.ai/favicon.ico',
 ARRAY['搜索', 'AI助手', '研究'],
 ARRAY['实时网络搜索', '引用来源', '对话式查询', '多模型支持', '无广告'],
 'Freemium (Pro $20/月)', false),

('ElevenLabs', '最先进的 AI 语音合成工具', 'https://elevenlabs.io', 'https://elevenlabs.io/favicon.ico',
 ARRAY['音频', '语音合成'],
 ARRAY['逼真的语音克隆', '多语言支持', '情感控制', 'API 接入', '配音制作'],
 'Freemium ($5-330/月)', false);

-- 查询验证
SELECT name, array_length(tags, 1) as tag_count, pricing 
FROM ai_tools 
ORDER BY is_featured DESC, created_at DESC;
