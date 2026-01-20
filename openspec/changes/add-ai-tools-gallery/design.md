# 设计文档：AI 工具展示页面

## Context
AI Farm 需要展示各种 AI 工具和网站，帮助用户发现优质资源。当前只有首页，缺少实际内容。

### 用户需求
- 浏览 AI 工具列表
- 按类别/标签筛选工具
- 搜索特定工具
- 查看工具详细信息（功能、截图、网址）
- 快速访问工具官网

## Goals / Non-Goals

### Goals
- 创建美观的工具展示页面
- 支持标签筛选和搜索
- 响应式设计（移动端友好）
- 数据存储在 Supabase
- 易于添加新工具

### Non-Goals
- 不实现用户评论功能（后续添加）
- 不实现用户收藏功能（后续添加）
- 不实现工具评分系统（后续添加）
- 不实现后台管理界面（可直接在 Supabase 添加数据）

## Decisions

### 1. 数据库 Schema 设计

**决定**: 创建两个表

#### `ai_tools` 表
```sql
CREATE TABLE ai_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,  -- 工具截图/Logo URL
  tags TEXT[],     -- 标签数组：['文本生成', '图像', '免费']
  features TEXT[], -- 功能列表
  pricing TEXT,    -- 定价信息：'免费', '付费', 'Freemium'
  is_featured BOOLEAN DEFAULT false,  -- 是否推荐
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**理由**:
- 使用 `TEXT[]` 数组存储标签，便于筛选
- `is_featured` 用于标记推荐工具
- `pricing` 帮助用户快速了解成本

**替代方案**: 创建单独的 tags 表 → 拒绝，对于简单场景，数组更方便

#### `tool_categories`（可选，暂不实现）
后续如果标签过多，可以创建分类表。

---

### 2. 页面布局设计

**决定**: 采用卡片网格布局

```
┌────────────────────────────────────┐
│  Header  (AI 工具库)                │
├────────────────────────────────────┤
│  Filters: [搜索框] [标签筛选器]    │
├──────────┬──────────┬──────────────┤
│ Tool卡片 │ Tool卡片 │  Tool卡片    │
│ [截图]   │ [截图]   │  [截图]      │
│ 名称     │ 名称     │   名称       │
│ 简介     │ 简介     │   简介       │
│ [标签]   │ [标签]   │  [标签]      │
│ [访问]   │ [访问]   │  [访问]      │
├──────────┼──────────┼──────────────┤
│ ...      │ ...      │  ...         │
└──────────┴──────────┴──────────────┘
```

**响应式**:
- 桌面：3-4 列
- 平板：2 列
- 手机：1 列

---

### 3. 标签筛选机制

**决定**: 多标签 OR 筛选（选中任一标签即可）

**交互流程**:
1. 页面加载时显示所有工具
2. 用户点击标签（如"文本生成"）
3. 仅显示包含该标签的工具
4. 用户可选择多个标签（OR 关系，满足任一即可）
5. 点击"清除筛选"恢复全部

**替代方案**: AND 筛选（必须同时满足所有标签）→ 拒绝，用户很少同时需要多个条件

---

### 4. 工具详情展示方式

**决定**: 使用模态框（Modal）

**触发**: 点击工具卡片上的"详情"按钮或卡片本身

**显示内容**:
- 大图截图
- 完整描述
- 功能列表（Bullet Points）
- 标签
- 定价信息
- 访问按钮（新标签页打开）

**理由**: 模态框不需要额外页面，用户体验更流畅

**替代方案**: 跳转到新页面 → 拒绝，对于简单信息展示太重

---

### 5. 数据加载策略

**决定**: 一次性加载所有工具（适用于< 100 个工具）

```javascript
async function loadTools() {
  const { data, error } = await supabaseClient
    .from('ai_tools')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('加载失败:', error);
    return [];
  }
  
  return data;
}
```

**筛选逻辑**: 前端筛选（数据已全部加载）

**当工具数量 > 100 时**: 改为分页加载或按需加载

---

### 6. 工具数据内容充实

**推荐的 AI 工具分类和示例**:

#### 文本生成
- ChatGPT
- Claude
- Gemini
- 文心一言

#### 图像生成
- Midjourney
- DALL-E
- Stable Diffusion
- Leonardo.ai

#### 视频生成
- Sora (OpenAI)
- Runway Gen-2
- Pika
- HeyGen

#### 代码辅助
- GitHub Copilot
- Cursor
- Codeium
- Tabnine

#### 音频/音乐
- ElevenLabs
- Suno
- Mubert

#### 办公/生产力
- Notion AI
- Gamma（AI PPT）
- Beautiful.ai
- Canva AI

#### 搜索/研究
- Perplexity
- Phind
- You.com

#### 设计/创意
- Figma AI
- Uizard
- Framer AI

**每个工具包含的字段**:
- **名称**: 如 "ChatGPT"
- **描述**: "OpenAI 开发的对话式 AI，能够进行自然对话、写作、编程等"
- **网址**: https://chat.openai.com
- **截图 URL**: (使用工具的 Logo 或截图)
- **标签**: `['文本生成', '对话', '付费', '热门']`
- **功能**:
  ```
  - 自然语言对话
  - 内容创作和编辑
  - 代码生成和解释
  - 问答和知识查询
  ```
- **定价**: "Freemium (免费版 + Plus $20/月)"

---

## Risks / Trade-offs

### 风险 1: 工具信息过时
- **风险**: AI 工具更新快，信息容易过时
- **缓解**: 
  - 在 Supabase 添加 `updated_at` 字段
  - 定期审查和更新（每月一次）
  - 未来可添加"报告过期"功能

### 风险 2: 图片加载慢
- **风险**: 外部图片 URL 可能加载慢或失效
- **缓解**:
  - 使用占位图（Placeholder）
  - 可选：将图片上传到 Supabase Storage
  - 添加懒加载（Lazy Loading）

### 风险 3: 标签泛滥
- **风险**: 标签太多导致筛选器混乱
- **缓解**:
  - 限制常用标签（10-15 个）
  - 标签标准化（统一命名）

---

## Migration Plan
无需迁移，这是新功能。

**部署步骤**:
1. 在 Supabase 创建表并插入初始数据
2. 创建前端页面和逻辑
3. 本地测试
4. 推送到 GitHub，Netlify 自动部署

---

## Open Questions

1. **是否需要工具评分功能？** → 暂不实现，后续根据需要添加
2. **是否允许用户提交工具？** → 暂不实现，当前由管理员添加
3. **图片存储方式？** → 先使用外部 URL，后续可迁移到 Supabase Storage
4. **是否需要工具对比功能？** → 暂不需要

---

## UI 设计参考

### 工具卡片样式
```css
.tool-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.tool-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.tool-info {
  padding: 1rem;
}

.tool-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #f0f0f0;
  border-radius: 16px;
  font-size: 0.875rem;
}
```

### 颜色方案
- 主色：蓝色（#3b82f6）
- 辅助色：紫色（#8b5cf6）
- 标签背景：浅灰（#f0f0f0）
- 卡片背景：白色
- 悬浮效果：阴影加深

---

## 技术实现要点

### Supabase 查询优化
```javascript
// 带筛选的查询
async function loadToolsByTags(tags) {
  const { data, error } = await supabaseClient
    .from('ai_tools')
    .select('*')
    .overlaps('tags', tags)  // 检查数组重叠
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });
  
  return data;
}
```

### RLS 策略
```sql
-- 所有人可以读取工具
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_tools"
ON ai_tools FOR SELECT
TO public
USING (true);
```

未来如果添加管理功能，可以限制写权限。
