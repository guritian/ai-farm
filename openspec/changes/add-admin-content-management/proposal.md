# 添加本地后台内容管理页面

## Why
当前 AI Farm 项目缺少内容管理功能，所有 AI 工具数据都需要通过直接操作 Supabase 数据库来添加、编辑或删除。这对于非技术人员来说非常不便，也增加了数据维护的复杂度和出错风险。需要一个简单易用的**本地管理页面**，让开发者可以在本地环境通过网页界面进行工具的增删改查（CRUD）操作。

### 关键问题
1. **缺少 Web UI**: 目前没有任何前端界面来管理 AI 工具数据
2. **需要技术能力**: 必须懂 SQL 和 Supabase 才能添加新工具
3. **工作流繁琐**: 添加一个工具需要手动编写 SQL INSERT 语句

### 设计理念：本地工具 vs 在线服务
**决策：管理页面仅在本地运行，不部署到生产环境**

理由：
- ✅ **安全性更高**: 无需复杂的认证机制，不暴露在公网
- ✅ **实现更简单**: 无需处理认证、权限、部署等复杂性
- ✅ **维护成本低**: 只有开发者使用，无需考虑多用户场景
- ✅ **符合项目定位**: 这是一个个人/小团队项目，不需要在线内容管理

## What Changes

### 新增能力
1. **admin-ui** - 本地管理界面
   - 工具列表页（展示所有工具，支持搜索和筛选）
   - 添加/编辑工具表单
   - 删除工具确认对话框
   - **仅在本地访问** (`http://localhost:8000/admin.html`)

### 修改现有能力
- **database-integration** - 更新 RLS 策略支持 Service Key 写操作（已有配置）

### 实现范围
- ✅ 基础 CRUD 操作（创建、读取、更新、删除）
- ✅ 表单验证（必填字段、URL 格式等）
- ✅ 响应式设计（支持桌面和平板）
- ✅ 使用 Supabase Service Key 直接操作（本地环境变量）
- ❌ ~~Web 认证机制~~（不需要，仅本地访问）
- ❌ ~~部署到生产环境~~（不需要，仅本地工具）
- ❌ 图片上传功能（暂时使用 URL 链接）
- ❌ 批量操作（后期功能）

## Impact

### 能力影响
- **admin-ui** (新增) - 提供本地工具管理界面
- **database-integration** (无修改) - 使用现有 RLS 策略和 Service Key

### 代码影响
- 新增文件：
  - `admin.html` - 本地管理页面（**不部署到 Netlify**）
  - `styles/admin.css` - 管理页面样式
  - `scripts/admin.js` - 管理页面逻辑
  - 可选：`.gitignore` 添加本地配置文件
- 修改文件：
  - **无需修改现有文件**
  - Supabase RLS 策略已支持 Service Key 写操作

### 用户影响
- **开发者**:
  - 可以在本地通过友好的 Web 界面管理工具
  - 降低了内容维护的技术门槛
  - 减少了数据录入错误的可能性
- **终端用户**: 无影响（管理页面不部署到生产环境）

## Open Questions

1. **图片管理**:
   - 选项 A: 仅支持图片 URL 输入（最简单）✅ **采纳**
   - 选项 B: 集成图片上传服务（如 Cloudinary、Supabase Storage）

2. **标签管理**:
   - 选项 A: 输入框手动输入（逗号分隔）✅ **采纳**
   - 选项 B: 输入框 + 自动补全（显示已有标签）- 可后期优化

3. **部署排除**:
   - 是否需要在 `.gitignore` 或 Netlify 配置中明确排除 `admin.html`？
   - **建议**: 保留在 Git 中（方便团队使用），但确保不被 Netlify 部署为公开页面

## Dependencies

### 依赖能力
- `database-integration` - 使用现有 Service Key 配置（无需修改）

### 外部依赖
- Supabase Service Key（已有，通过 `.env` 或环境变量配置）
- 本地开发服务器（如 `python3 -m http.server`）

## Architecture Notes

### 本地访问模式
```
1. 开发者启动本地服务器（如 python3 -m http.server 8000）
2. 访问 http://localhost:8000/admin.html
3. 页面加载时从本地环境变量或配置文件读取 Supabase Service Key
4. 直接使用 Service Key 操作 Supabase 数据库（完全权限）
```

### 安全考虑（本地环境）
- **Service Key 保护**: 
  - 存储在本地 `.env` 文件中（已在 `.gitignore` 中）
  - 或硬编码在 `admin.js` 的独立配置区域（注释提醒不要提交）
- **无需公网认证**: 管理页面仅在 localhost 访问，不暴露在互联网
- **RLS 策略**: Supabase Service Key 默认绕过 RLS，拥有完全权限
- **Git 管理**: `admin.html` 可提交到 Git，但需确保不包含敏感信息

### 技术选型
- **前端**: 纯 HTML/CSS/JavaScript（与现有技术栈一致）
- **数据库访问**: Supabase JavaScript Client SDK + Service Key
- **认证**: 无需认证（本地环境访问）
- **部署**: 不部署到 Netlify（可在 `netlify.toml` 中排除或不影响）

### 数据流
```
本地 Admin Page (localhost:8000/admin.html)
        ↓
Supabase Client SDK (with Service Key from .env)
        ↓
Supabase Database (完全访问权限)
```

## Validation Plan

### 功能验证
1. 添加工具：填写表单 -> 提交 -> 数据库验证
2. 编辑工具：点击编辑 -> 修改字段 -> 保存 -> 验证更新
3. 删除工具：点击删除 -> 确认对话框 -> 删除 -> 验证移除
4. 认证：错误密码被拒绝，正确密码通过

### 非功能验证
- 表单验证（必填字段、URL 格式、数组格式）
- 响应式布局（1024px+ 桌面，768px 平板）
- 错误处理（网络失败、数据库错误）

## Risks

- **安全风险**（中等）: 简单密码验证方案不如 OAuth 安全，但对于初期单管理员场景可接受
- **技术债**（低）: 后期可能需要升级到 Supabase Auth
- **实现复杂度**（低）: 功能范围清晰，技术栈熟悉

## Alternatives Considered

### 备选方案 1: 使用 Supabase Studio
- **优点**: Supabase 自带管理界面
- **缺点**: 需要给管理员开放 Supabase 项目访问权限，不符合"简化"原则

### 备选方案 2: 使用现成的 Headless CMS（如 Strapi、Sanity）
- **优点**: 功能完整，开箱即用
- **缺点**: 增加系统复杂度，部署成本高，不符合"单文件夹部署"约束
