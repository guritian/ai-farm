# Netlify 部署指南

本指南将帮助您将 AI Farm 项目部署到 Netlify。

## 部署方式

Netlify 支持两种部署方式：
1. **Git 自动部署**（推荐）- 连接 Git 仓库，自动构建和部署
2. **手动上传部署** - 上传项目文件夹

---

## 方式 1: Git 自动部署（推荐）

### 前置条件
- 已将代码推送到 Git 仓库（GitHub、GitLab、Bitbucket）
- 拥有 Netlify 账号

### 步骤

#### 1. 准备 Git 仓库

```bash
# 初始化 Git 仓库（如果还未初始化）
cd /Users/guhao/Desktop/village/gitRepos/ai-farm
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 添加项目基础框架"

# 添加远程仓库（替换为您的仓库地址）
git remote add origin https://github.com/your-username/ai-farm.git

# 推送到远程
git push -u origin main
```

#### 2. 连接 Netlify

1. 登录 [Netlify](https://app.netlify.com/)
2. 点击 **"Add new site"** → **"Import an existing project"**
3. 选择 Git 提供商（GitHub、GitLab 或 Bitbucket）
4. 授权 Netlify 访问您的仓库
5. 选择 `ai-farm` 仓库

#### 3. 配置构建设置

在 "Site settings" 页面：

- **Branch to deploy**: `main`（或 `master`）
- **Build command**: 留空（静态站点无需构建）
- **Publish directory**: `.`（根目录）
- **Functions directory**: `netlify/functions`（自动检测）

点击 **"Deploy site"**

#### 4. 配置环境变量

部署后，添加环境变量：

1. 进入站点的 **Site settings** → **Environment variables**
2. 点击 **"Add a variable"**
3. 添加以下变量：

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://xxxxxxxxxxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

4. 点击 **"Save"**

#### 5. 触发重新部署

环境变量添加后，需要重新部署：

1. 进入 **Deploys** 页面
2. 点击 **"Trigger deploy"** → **"Clear cache and deploy site"**

#### 6. 验证部署

部署完成后：
1. 访问分配的 URL（如 `https://your-site-name.netlify.app`）
2. 测试前端页面是否正常加载
3. 点击 "测试 API 连接" 和 "测试数据库" 按钮
4. 检查控制台是否有错误

---

## 方式 2: 手动上传部署

### 步骤

#### 1. 准备项目文件

确保项目结构完整：
```
ai-farm/
├── index.html
├── styles/
├── scripts/
├── netlify/
├── docs/
├── netlify.toml
├── .env.example
├── .gitignore
└── README.md
```

#### 2. 上传到 Netlify

1. 登录 [Netlify](https://app.netlify.com/)
2. 进入 **Sites** 页面
3. 将整个 `ai-farm` 文件夹拖放到页面上（或点击"browse to upload"）
4. Netlify 会自动上传并部署

#### 3. 配置环境变量

同 Git 部署方式的步骤 4

#### 4. 验证部署

同 Git 部署方式的步骤 6

---

## 本地测试部署

在部署前，建议使用 Netlify CLI 本地测试：

### 安装 Netlify CLI

```bash
npm install -g netlify-cli
```

### 本地运行

```bash
# 进入项目目录
cd /Users/guhao/Desktop/village/gitRepos/ai-farm

# 启动本地开发服务器
netlify dev
```

访问 `http://localhost:8888` 查看效果

### 测试 Functions

本地测试 API 端点：

```bash
# 健康检查
curl http://localhost:8888/.netlify/functions/api/health

# 示例 API
curl http://localhost:8888/.netlify/functions/api/example
```

---

## 自定义域名（可选）

### 添加自定义域名

1. 进入站点的 **Domain settings**
2. 点击 **"Add custom domain"**
3. 输入您的域名（如 `ai-farm.com`）
4. 按照提示配置 DNS

### 启用 HTTPS

Netlify 自动为所有站点提供免费的 Let's Encrypt SSL 证书

---

## 性能优化

### 1. 启用 CDN 缓存

Netlify 自动使用全球 CDN，无需额外配置

### 2. 优化 Functions 冷启动

在 `netlify.toml` 中配置：

```toml
[functions]
  # 保持 Functions 活跃（需付费计划）
  # scheduled_functions = ["health"]
```

### 3. 压缩资源

Netlify 自动压缩 HTML、CSS、JavaScript

---

## 监控和日志

### 查看部署日志

1. 进入 **Deploys** 页面
2. 点击具体的部署记录
3. 查看构建日志

### 查看 Functions 日志

1. 进入 **Functions** 页面
2. 点击具体的 Function
3. 查看实时日志

### 实时监控

使用 Netlify Analytics（需付费）或集成第三方服务：
- Google Analytics
- Sentry（错误监控）
- LogRocket（用户行为分析）

---

## 回滚部署

### 回滚到之前的版本

1. 进入 **Deploys** 页面
2. 找到要回滚的部署
3. 点击 **"Publish deploy"**

Netlify 保留所有历史部署，可随时回滚

---

## 常见问题

### 问题 1: Functions 返回 404

**原因**: Functions 路径配置错误  
**解决**: 检查 `netlify.toml` 中的 `functions` 目录配置

### 问题 2: 环境变量不生效

**原因**: 环境变量未正确设置或未重新部署  
**解决**: 
1. 确认环境变量已保存
2. 触发重新部署（Clear cache and deploy）

### 问题 3: Python Dependencies 安装失败

**原因**: `requirements.txt` 格式错误或依赖冲突  
**解决**: 
1. 检查 `requirements.txt` 语法
2. 查看部署日志中的具体错误
3. 固定依赖版本（如 `supabase==2.0.0`）

### 问题 4: 部署成功但页面空白

**原因**: JavaScript 错误或路径问题  
**解决**: 
1. 打开浏览器控制台（F12）查看错误
2. 检查资源路径是否正确（使用绝对路径）

---

## 持续部署工作流

### 推荐的分支策略

- `main` - 生产环境
- `dev` - 开发环境（可配置 Netlify Deploy Preview）
- `feature/*` - 功能分支

### 配置 Deploy Previews

1. 在 **Site settings** → **Build & deploy** → **Deploy contexts**
2. 启用 **Deploy Previews**
3. 每次创建 Pull Request 时，Netlify 自动创建预览部署

---

## 成本估算

### 免费计划限额

- **带宽**: 100 GB/月
- **构建时间**: 300 分钟/月
- **Functions 调用**: 125,000 次/月
- **Functions 运行时间**: 100 小时/月

### 升级选项

如果超出免费额度，可考虑升级到 **Pro Plan**（$19/月）

---

## 下一步

- 配置自定义域名
- 添加 Google Analytics
- 集成错误监控（Sentry）
- 优化 SEO 设置

## 参考资料

- [Netlify 官方文档](https://docs.netlify.com/)
- [Netlify Functions 指南](https://docs.netlify.com/functions/overview/)
- [环境变量配置](https://docs.netlify.com/configure-builds/environment-variables/)
