# Netlify 部署指南

> 本文档说明如何将 AI Farm 项目部署到 Netlify，包括新增的教程管理功能和管理后台。

## 📋 部署前检查清单

### 1. ✅ 静态文件配置

所有新增功能都是纯静态文件，无需额外配置：

- ✅ `admin.html` - 管理后台页面
- ✅ `scripts/admin.js` - 工具管理逻辑
- ✅ `scripts/admin-tutorials.js` - 教程管理逻辑
- ✅ `scripts/tutorials.js` - 教程前台展示
- ✅ `styles/light-blue-theme.css` - 浅蓝色主题
- ✅ `styles/admin.css` - 管理后台样式
- ✅ `styles/admin-tabs.css` - 标签页样式

**当前 `netlify.toml` 配置已足够**（发布目录为项目根目录）。

---

## 🔧 必需配置：环境变量

### 在 Netlify 控制台配置

1. 登录 Netlify Dashboard
2. 进入你的项目 → **Site settings** → **Environment variables**
3. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `SUPABASE_URL` | `https://lczgabazrjlkhmthlvhi.supabase.co` | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase Anon Key |

> **📌 注意**: 
> - 这些环境变量在 `scripts/supabase-client.js` 中通过 `getConfig()` 函数读取
> - 如果未配置，将使用代码中的默认值（当前已硬编码）
> - **重要**: 对于生产环境，强烈建议通过环境变量配置，避免凭据泄露

### 配置方法选项

#### 选项 A：使用 Netlify 环境变量（推荐）

在 Netlify 控制台添加环境变量后，在 `index.html` 和 `admin.html` 的 `<head>` 中注入：

```html
<script>
  // 从 Netlify 环境变量中读取（需要构建时注入）
  window.SUPABASE_URL = '{{ SUPABASE_URL }}';
  window.SUPABASE_ANON_KEY = '{{ SUPABASE_ANON_KEY }}';
</script>
```

#### 选项 B：使用 Meta 标签

在 HTML 中添加 meta 标签：

```html
<meta name="SUPABASE_URL" content="https://lczgabazrjlkhmthlvhi.supabase.co">
<meta name="SUPABASE_ANON_KEY" content="your-anon-key-here">
```

#### 选项 C：使用默认值（当前方式）

`scripts/supabase-client.js` 中已硬编码默认值，无需额外配置。

**⚠️ 风险**: 凭据暴露在客户端代码中。

---

## 🗄️ 数据库迁移

部署后需要在 Supabase 中执行数据库迁移：

### 执行迁移脚本

1. 登录 Supabase Dashboard: https://supabase.com/dashboard
2. 进入你的项目 → **SQL Editor**
3. 执行迁移脚本：`docs/supabase-tutorials-migration.sql`

**迁移内容**：
- 为 `tutorials` 表添加 `content_type`、`external_url`、`tool_id` 字段
- 添加外键约束、CHECK 约束、索引
- 创建测试数据（可选）

### 验证迁移

执行以下 SQL 验证表结构：

```sql
-- 查看 tutorials 表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tutorials'
ORDER BY ordinal_position;

-- 查看外键约束
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'tutorials';
```

---

## 🚀 部署流程

### 方式一：Git 自动部署（推荐）

1. 将代码推送到 GitHub：
   ```bash
   git push origin main
   ```

2. Netlify 将自动检测到推送并开始构建

3. 构建完成后，访问部署的 URL

### 方式二：手动部署

1. 在 Netlify Dashboard 中点击 **Deploys** → **Trigger deploy** → **Deploy site**

2. 等待构建完成

---

## 🧪 部署后验证

### 前台功能

访问 `https://your-site.netlify.app/`

1. **标签切换**: 点击"AI 工具"和"教程分享"标签
2. **教程列表**: 查看教程卡片，检查：
   - 内容类型徽章（📄 MD / 🔗 链接 / ▶️ 视频）
   - 关联工具徽章
   - 点击行为（Markdown 打开详情，URL/视频打开新标签）
3. **搜索功能**: 测试搜索和筛选
4. **响应式设计**: 在移动设备上查看

### 管理后台

访问 `https://your-site.netlify.app/admin.html`

1. **工具管理**: 添加/编辑/删除 AI 工具
2. **教程管理**: 
   - 添加不同类型的教程（Markdown、URL、视频）
   - 关联教程与 AI 工具
   - 编辑和删除教程
   - 搜索和筛选功能

### 控制台检查

打开浏览器开发者工具，检查：

- ✅ `✅ Supabase 客户端已初始化`
- ✅ `📡 Supabase URL: https://lczgabazrjlkhmthlvhi.supabase.co`
- ❌ 无错误信息

---

## 🎨 主题验证

确认浅蓝色主题已正确应用：

- 渐变背景（天蓝色）
- 玻璃拟态效果（卡片、头部）
- 悬浮动画和阴影效果
- 琥珀色 CTA 按钮

---

## 🔒 安全建议

### 生产环境

1. **Row Level Security (RLS)**
   - 在 Supabase 中为 `tutorials` 和 `ai_tools` 表启用 RLS
   - 配置策略：
     - 公开读取权限
     - 仅管理员可写入/编辑/删除

2. **管理员认证**
   - 当前 `admin.html` 无认证保护
   - 建议添加 Supabase Auth 或基本认证
   - 或配置 Netlify Identity/Auth0

3. **API Key 管理**
   - 考虑使用 Supabase Service Key（仅在服务端）
   - 当前使用的 Anon Key 在客户端暴露是正常的（如果启用了 RLS）

---

## 📊 性能优化（可选）

### Netlify 优化配置

在 `netlify.toml` 中添加：

```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/admin"
  to = "/admin.html"
  status = 200
```

---

## ❓ FAQ

### Q: 部署后看不到教程数据？
**A**: 检查：
1. Supabase 迁移脚本是否已执行
2. 控制台是否有 Supabase 连接错误
3. Supabase 表中是否有测试数据

### Q: 管理后台无法添加数据？
**A**: 检查：
1. Supabase RLS 策略（如果启用）
2. 控制台错误信息
3. Supabase API Key 是否正确

### Q: 主题样式未生效？
**A**: 检查：
1. `styles/light-blue-theme.css` 是否正确加载
2. 浏览器缓存（强制刷新：Ctrl+Shift+R）
3. 控制台是否有 CSS 加载错误

### Q: 需要重新构建吗？
**A**: 不需要！这是纯静态站点，Netlify 会自动分发文件。只需：
- Git push 触发自动部署
- 或手动触发部署

---

## 📝 总结

✅ **无需额外 Netlify 配置** - 当前配置已足够

✅ **建议配置环境变量** - 提高安全性（可选）

✅ **必需执行数据库迁移** - 在 Supabase 中执行 SQL

✅ **部署即用** - Git push 后立即可用

🎉 **享受全新的教程管理功能和美观的浅蓝色主题！**
