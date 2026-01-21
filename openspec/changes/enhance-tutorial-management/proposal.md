# 增强教程管理功能

## Why

当前教程功能（`add-tutorial-sharing-feature`）仅支持 Markdown 格式的教程内容，并且管理后台缺少教程管理界面。需要增强教程系统以支持：

1. **多种内容类型**：除了 Markdown，还需支持外部网站链接和视频链接
2. **管理后台支持**：admin.html 需要提供教程的完整 CRUD 功能
3. **精选教程**：关联 AI 工具和教程，推荐相关教程

### 关键问题

1. **内容类型受限**：只能添加 Markdown 文本，无法引用外部资源
2. **无管理界面**：后台没有教程管理功能，只能直接操作数据库
3. **工具与教程割裂**：AI 工具和教程没有关联，用户找不到相关教程
4. **内容录入不便**：需支持简便的 URL 贴入方式

## What Changes

### 新增能力

1. **tutorial-admin** - 后台教程管理
   - 教程列表展示（表格形式）
   - 添加教程表单（支持 Markdown/URL/Video）
   - 编辑教程功能
   - 删除教程确认
   - 教程类型切换（Markdown/外部链接/视频）

### 修改现有能力

2. **tutorial-data** - 教程数据扩展
   - 添加 `content_type` 字段（markdown | url | video）
   - 添加 `external_url` 字段（存储外部链接）
   - 添加 `tool_id` 字段（关联 AI 工具）
   - 更新现有 `tutorials` 表结构

3. **tutorial-ui** - 前台展示优化
   - 根据 `content_type` 渲染不同内容
   - 外部链接卡片显示"访问链接"按钮
   - 视频类型显示视频播放器或跳转按钮
   - 显示关联的 AI 工具信息

### 实现范围

- ✅ 扩展 tutorials 表支持多种类型
- ✅ 管理后台 CRUD 界面
- ✅ 内容类型切换（Markdown/URL/Video）
- ✅ 工具与教程关联
- ❌ 自动从 URL 抓取标题/描述（后期优化）
- ❌ 视频内嵌播放（初期仅外链跳转）

## Impact

### 能力影响

- **tutorial-admin** (新增) - 提供完整的教程后台管理
- **tutorial-data** (修改) - 扩展为支持多种内容类型
- **tutorial-ui** (修改) - 适配不同内容类型显示

### 数据库影响

**修改表**: `tutorials`
- 新增字段：
  - `content_type` TEXT NOT NULL DEFAULT 'markdown'
  - `external_url` TEXT
  - `tool_id` UUID (外键关联 ai_tools)
- 字段约束：
  - `content_md` 改为可空（当 type='url' 或 'video' 时）
  - `external_url` 当 type!='markdown' 时必填

### 代码影响

**新增文件**：
- `scripts/admin-tutorials.js` - 教程管理逻辑

**修改文件**：
- `admin.html` - 添加教程管理 Tab
- `docs/supabase-tutorials-schema.sql` - 更新表结构
- `scripts/tutorials.js` - 适配多种内容类型显示
- `styles/admin.css` - 教程管理样式（复用现有）

### 用户影响

**正面**：
- 管理员可以方便地管理教程
- 支持引用外部优质教程资源
- 用户可以发现与工具相关的教程

**中性**：
- 需要学习新的教程类型选择方式

## Open Questions

1. **视频播放方式**：
   - 选项 A: 直接跳转到视频网站 ✅ **推荐**（简单）
   - 选项 B: 内嵌播放器（需要支持 YouTube/Bilibili 等）

2. **URL 内容展示**：
   - 选项 A: 仅显示链接卡片 ✅ **推荐**
   - 选项 B: 自动抓取网页元信息（标题、描述、图片）

3. **工具教程关联**：
   - 选项 A: 单向关联（教程 -> 工具）✅ **推荐**
   - 选项 B: 双向关联（工具详情也显示教程列表）

4. **安全性**：
   - 外部 URL 是否需要白名单验证？
   - **建议**：初期不限制，后期可添加域名白名单

## Dependencies

### 依赖能力

- `add-admin-content-management` (已完成) - 依赖现有的管理后台框架
- `add-tutorial-sharing-feature` (31/40) - 依赖现有教程表和前台展示

### 外部依赖

- Supabase 外键约束（tutorials.tool_id -> ai_tools.id）
- 现有的 Supabase client 和 admin.js 架构

## Architecture Notes

### 数据库扩展

```sql
-- 修改 tutorials 表
ALTER TABLE tutorials 
  ADD COLUMN content_type TEXT NOT NULL DEFAULT 'markdown',
  ADD COLUMN external_url TEXT,
  ADD COLUMN tool_id UUID REFERENCES ai_tools(id) ON DELETE SET NULL,
  ALTER COLUMN content_md DROP NOT NULL;

-- 添加检查约束
ALTER TABLE tutorials 
  ADD CONSTRAINT check_content_type 
    CHECK (content_type IN ('markdown', 'url', 'video'));

-- 添加约束：非 markdown 类型必须有 external_url
ALTER TABLE tutorials 
  ADD CONSTRAINT check_external_url 
    CHECK (
      (content_type = 'markdown' AND external_url IS NULL) OR
      (content_type IN ('url', 'video') AND external_url IS NOT NULL)
    );
```

### 管理后台布局

```
Admin Page (admin.html)
  ├── Tab 导航
  │   ├── AI 工具管理 (现有)
  │   └── 教程管理 (新增)
  └── 内容区域
      ├── #admin-tools (现有)
      └── #admin-tutorials (新增)
          ├── 工具栏（添加教程按钮、搜索）
          ├── 教程列表表格
          └── 表单模态框
              ├── 内容类型选择（Markdown/URL/Video）
              ├── 基础信息（标题、作者、标签）
              └── 内容输入
                  ├── Markdown 编辑器 (type=markdown)
                  ├── URL 输入框 (type=url|video)
                  └── 关联工具下拉选择
```

### 前台显示逻辑

```javascript
function renderTutorialCard(tutorial) {
  switch (tutorial.content_type) {
    case 'markdown':
      return renderMarkdownCard(tutorial);
    case 'url':
      return renderExternalLinkCard(tutorial);
    case 'video':
      return renderVideoCard(tutorial);
  }
}
```

## Validation Plan

### 功能验证

1. 数据库迁移：现有 Markdown 教程正常显示
2. 添加教程：
   - Markdown 类型正常保存和渲染
   - URL 类型显示"访问链接"按钮
   - Video 类型显示视频图标和跳转
3. 编辑教程：类型切换时表单正确更新
4. 删除教程：确认对话框正常，数据正确删除
5. 工具关联：教程卡片显示关联的工具名称

### 非功能验证

- 管理后台 UI 与现有工具管理风格一致
- 表单验证：URL 格式检查
- 响应式：移动端管理后台可用

## Risks

- **数据迁移风险**（低）：现有教程需要添加默认 `content_type='markdown'`
- **URL 有效性**（中）：无法保证外部链接长期有效
- **安全风险**（低）：恶意 URL 跳转，可通过提示解决

## Alternatives Considered

### 备选方案 1: 使用 iframe 内嵌外部内容

- **优点**：用户无需跳转
- **缺点**：很多网站禁止 iframe，体验不一定好

### 备选方案 2: 完全分离的视频平台集成

- **优点**：专业的视频播放体验
- **缺点**：增加复杂度，与单文件夹部署冲突

---

## 变更层次

**Tier 1 - 核心变更**（必须完成）：
- 数据库表结构扩展
- 管理后台教程 CRUD

**Tier 2 - 增强功能**（建议完成）：
- 工具与教程关联
- 内容类型判断显示

**Tier 3 - 优化功能**（可选）：
- URL 元信息自动抓取
- 视频内嵌播放
