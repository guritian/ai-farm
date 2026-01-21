# 设计文档：初始项目架构

## Context
AI Farm 是一个 AI 工具和知识科普网站，需要搭建一个支持 Netlify 单文件夹部署的架构。项目采用前后端分离、Serverless 优先的设计理念，使用 Supabase 作为数据库和认证服务。

### 技术约束
- 必须支持 Netlify 单文件夹部署
- 后端使用 Python（通过 Netlify Functions 运行）
- 前端使用原生 HTML/CSS/JavaScript（无构建步骤）
- 数据库使用 Supabase（PostgreSQL + 实时功能）

## Goals / Non-Goals

### Goals
- 创建清晰的项目目录结构，所有文件在单个文件夹内
- 前端可以直接在浏览器打开运行（开发时）
- 后端 API 使用 Netlify Functions（Serverless）
- 支持本地开发和 Netlify 部署两种环境
- 环境变量统一管理（Supabase keys、API keys 等）

### Non-Goals
- 不实现具体的业务功能（留待后续 change）
- 不实现用户认证系统（此阶段仅配置集成）
- 不包含前端构建工具（Webpack、Vite 等）
- 不实现 CI/CD 流程（手动部署即可）

## Decisions

### 1. 目录结构设计
**决定**: 采用以下目录结构
```
ai-farm/
├── index.html              # 主页面（根目录）
├── styles/                 # CSS 样式
│   └── main.css
├── scripts/                # JavaScript
│   ├── app.js             # 主应用逻辑
│   └── supabase-client.js # Supabase 封装
├── netlify/                # Netlify 配置
│   └── functions/          # Serverless Functions
│       ├── requirements.txt
│       ├── utils/
│       │   └── supabase_helper.py
│       └── api/
│           ├── health.py
│           └── example.py
├── netlify.toml            # Netlify 配置文件
├── .env.example            # 环境变量示例
├── .gitignore              # Git 忽略文件
├── README.md               # 项目说明
└── docs/                   # 文档
    ├── supabase-setup.md
    ├── database-schema.md
    └── deployment-guide.md
```

**理由**:
- `index.html` 放在根目录，Netlify 自动识别为入口
- `netlify/functions/` 是 Netlify Functions 的默认路径
- 静态资源（styles、scripts）分离，便于管理
- docs 文件夹集中存放文档

**替代方案**:
- 方案 A: 使用 `public/` 文件夹存放静态资源 → 拒绝，增加了不必要的嵌套
- 方案 B: 前端使用构建工具（Vite） → 拒绝，增加复杂度，不符合"静态页面"要求

### 2. 后端 API 架构
**决定**: 使用 Netlify Functions 部署 Python 后端

**理由**:
- Netlify Functions 原生支持 Python（使用 AWS Lambda）
- Serverless 架构，无需管理服务器
- 自动扩展，按需付费
- 与前端部署在同一平台，简化管理

**API 端点设计**:
- `/.netlify/functions/api/health` - 健康检查
- `/.netlify/functions/api/example` - 示例 API（演示数据库查询）

**替代方案**:
- 方案 A: 使用独立的 Python 服务器（Flask/FastAPI） → 拒绝，需要额外的服务器管理，不符合单文件夹部署
- 方案 B: 使用 Node.js Functions → 拒绝，不符合"Python 后端"要求

### 3. Supabase 集成策略
**决定**: 前后端分别集成 Supabase

- **前端**: 使用 Supabase JavaScript SDK（通过 CDN 引入）
- **后端**: 使用 `supabase-py` Python 库

**理由**:
- 前端可以直接访问 Supabase（读取公开数据、实时订阅）
- 后端通过 Service Role Key 访问（执行敏感操作）
- 减少不必要的中间层，提升性能

**环境变量配置**:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx  # 前端使用（公开）
SUPABASE_SERVICE_KEY=xxx  # 后端使用（保密）
```

### 4. 本地开发环境
**决定**: 使用 Netlify CLI 进行本地开发

**命令**:
```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 本地运行（同时启动前端和 Functions）
netlify dev
```

**理由**:
- 模拟 Netlify 生产环境
- 自动处理环境变量
- 支持 Functions 热重载

**替代方案**:
- 方案 A: 使用 Python 本地服务器 + Live Server → 拒绝，环境不一致
- 方案 B: 直接打开 HTML 文件 → 拒绝，无法测试 Functions

## Risks / Trade-offs

### 风险 1: Netlify Functions 冷启动延迟
- **风险**: Python Functions 首次调用可能有 1-3 秒冷启动时间
- **缓解**: 
  - 使用健康检查 API 保持 Functions 活跃（可选）
  - 前端显示加载状态，提升用户体验

### 风险 2: Supabase 免费额度限制
- **风险**: 免费计划有请求次数、存储、带宽限制
- **缓解**:
  - 监控使用量
  - 实现前端缓存机制
  - 必要时升级到付费计划

### 风险 3: 前端无构建步骤，缺少模块化
- **风险**: JavaScript 代码可能变得难以维护
- **缓解**:
  - 使用 ES6 Modules（现代浏览器支持）
  - 保持文件小而聚焦
  - 如未来需要，再引入构建工具

## Migration Plan
这是全新项目，无需迁移。

部署步骤：
1. 在 Netlify 创建新站点
2. 连接 Git 仓库（或手动上传文件夹）
3. 配置环境变量（Supabase keys）
4. 触发部署

回滚计划：
- 如部署失败，Netlify 支持一键回滚到上一个版本

## Open Questions
1. **是否需要添加错误监控服务**（如 Sentry）？ → 建议后续根据需要添加
2. **前端是否需要路由系统**（如果是多页面应用）？ → 当前单页面，后续可考虑 hash routing
3. **是否需要添加 CDN 配置**（加速静态资源）？ → Netlify 自带 CDN，无需额外配置
