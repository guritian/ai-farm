# 添加教程分享功能

## Why
当前 AI Farm 项目仅提供 AI 工具展示功能，缺少教程内容分享能力。用户不仅需要查找 AI 工具，还需要学习如何使用这些工具。添加教程分享功能可以让网站成为一个更完整的 AI 学习平台，同时为未来拓展更多内容板块（如资讯、案例等）打下基础。

### 关键问题
1. **内容单一**: 仅有工具展示，缺少使用教程和学习资源
2. **无内容切换**: 用户无法在不同类型内容间切换
3. **Markdown 支持**: 需要支持 Markdown 格式的教程内容展示
4. **可拓展性**: 需要为未来增加更多板块预留架构空间

## What Changes

### 新增能力
1. **tutorial-ui** - 教程展示前端界面
   - Tab 切换系统（AI 工具 / 教程分享 / 未来可拓展）
   - 教程列表页（卡片展示：标题 + 作者 + 封面图）
   - 教程详情页（支持 Markdown 内容渲染）
   - 响应式设计

2. **tutorial-data** - 教程数据管理
   - Supabase 新增 `tutorials` 表
   - 教程字段：id, title, author, cover_image, content_md, tags, created_at 等
   - 管理后台支持教程 CRUD

### 修改现有能力
- **frontend-static** - 添加 Tab 切换导航
- **database-integration** - 创建 tutorials 表

### 实现范围
- ✅ Tab 切换系统（可拓展设计）
- ✅ 教程列表和详情页
- ✅ Markdown 渲染支持
- ✅ 管理后台教程管理
- ❌ 用户评论功能（后期）
- ❌ 点赞/收藏功能（后期）

## Impact

### 能力影响
- **tutorial-ui** (新增) - 提供教程浏览和详情展示
- **tutorial-data** (新增) - 提供教程数据存储
- **frontend-static** (修改) - 增加 Tab 导航系统
- **database-integration** (修改) - 新增 tutorials 表

### 代码影响
- 新增文件：
  - `tutorials.html` 或在 `index.html` 中添加教程区域
  - `tutorial-detail.html` - 教程详情页
  - `scripts/tutorials.js` - 教程逻辑
  - `styles/tutorials.css` - 教程样式（可选，可复用 main.css）
  - `docs/tutorials-schema.sql` - 数据库表结构
- 修改文件：
  - `index.html` - 添加 Tab 导航
  - `styles/main.css` - Tab 样式
  - `admin.html` - 添加教程管理功能

### 用户影响
- **正面**:
  - 用户可以浏览和学习 AI 工具使用教程
  - Tab 切换提供更好的内容组织
  - 为将来增加更多内容类型打下基础
- **中性**: 用户需要适应新的导航方式

## Open Questions

1. **内容布局**:
   - 选项 A: 单页 SPA（Tab 切换不刷新页面）✅ **推荐**
   - 选项 B: 多页应用（每个 Tab 独立 HTML 文件）

2. **Markdown 渲染库**:
   - 选项 A: marked.js (轻量，12KB) ✅ **推荐**
   - 选项 B: markdown-it (功能更强，但较大)

3. **教程详情页路由**:
   - 选项 A: URL hash (#/tutorial/:id) ✅ **推荐**
   - 选项 B: 独立 HTML 页面 (tutorial-detail.html?id=xxx)

4. **代码高亮**:
   - 是否需要代码高亮支持？
   - **建议**: 使用 highlight.js 或 Prism.js（初期可选）

## Dependencies

### 依赖能力
- `frontend-static` - 需要修改主页布局
- `database-integration` - 需要创建新表
- 现有的 Supabase 客户端配置

### 外部依赖
- Markdown 渲染库（marked.js CDN）
- 可选：代码高亮库（highlight.js CDN）

## Architecture Notes

### Tab 切换系统设计
```
主页 (index.html)
  ├── Header
  ├── Tab 导航
  │   ├── AI 工具 (默认激活)
  │   ├── 教程分享
  │   └── [未来板块] (预留)
  └── 内容区域
      ├── #tools-content (工具列表)
      ├── #tutorials-content (教程列表)
      └── #tutorial-detail (教程详情，单独页面或模态框)
```

### 数据库表设计
```sql
CREATE TABLE tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  author_avatar TEXT,  -- 可选
  cover_image TEXT NOT NULL,
  summary TEXT,  -- 简短摘要
  content_md TEXT NOT NULL,  -- Markdown 内容
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 技术选型
- **前端**: 纯 HTML/CSS/JavaScript（SPA 方式）
- **Markdown 渲染**: marked.js (CDN)
- **代码高亮**: highlight.js (可选，CDN)
- **路由**: URL hash (`#/tutorial/:id`)
- **数据库**: Supabase PostgreSQL

### 数据流
```
用户点击 Tab
  ↓
JavaScript 切换 display
  ↓
从 Supabase 加载教程列表
  ↓
渲染卡片
  ↓
点击卡片 → 加载详情 → Markdown 渲染
```

## Validation Plan

### 功能验证
1. Tab 切换：点击不同 Tab 正确显示对应内容
2. 教程列表：正确展示标题、作者、封面图
3. 教程详情：Markdown 正确渲染，样式美观
4. 管理后台：可以添加/编辑/删除教程

### 非功能验证
- Markdown 渲染性能（大文档测试）
- 响应式布局（移动端、平板、桌面）
- 浏览器兼容性

## Risks

- **性能风险**（低）: Markdown 渲染可能较慢，可通过缓存优化
- **XSS 风险**（中）: Markdown 内容需要做好 sanitize
- **内容管理**（低）: 管理后台的 Markdown 编辑器体验

## Alternatives Considered

### 备选方案 1: 使用现成的博客系统
- **优点**: 功能完整，开箱即用
- **缺点**: 不符合单文件夹部署约束，增加复杂度

### 备选方案 2: 外部链接到第三方教程平台
- **优点**: 无需开发
- **缺点**: 用户体验割裂，无法统一管理
