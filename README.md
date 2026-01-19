# AI Farm

> AI 工具和知识科普网站

## 📖 项目简介

AI Farm 是一个基于 Serverless 架构的 AI 工具和知识科普网站，提供 AI 相关的工具、知识分享和科普内容。

## 🛠 技术栈

- **前端**: HTML、CSS、JavaScript (原生 ES6+)
- **后端**: Python + Netlify Functions (Serverless)
- **数据库**: Supabase (PostgreSQL + 实时订阅)
- **部署**: Netlify (静态托管 + Serverless Functions)

## 📁 目录结构

```
ai-farm/
├── index.html              # 主页面
├── styles/                 # CSS 样式
│   └── main.css
├── scripts/                # JavaScript
│   ├── app.js             # 主应用逻辑
│   └── supabase-client.js # Supabase 客户端
├── netlify/                # Netlify 配置
│   └── functions/          # Serverless Functions
│       ├── requirements.txt
│       ├── utils/
│       │   └── supabase_helper.py
│       └── api/
│           ├── health.py
│           └── example.py
├── netlify.toml            # Netlify 配置
├── .env.example            # 环境变量示例
├── .gitignore
├── README.md
└── docs/                   # 文档
    ├── supabase-setup.md
    ├── database-schema.md
    └── deployment-guide.md
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd ai-farm
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的 Supabase 配置
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_KEY=your-service-key
```

### 3. 本地开发

#### 方法 1: 直接打开 HTML（仅前端）

```bash
# 在浏览器中打开
open index.html
```

#### 方法 2: 使用 Netlify CLI（推荐，包含 Functions）

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 启动本地开发服务器
netlify dev

# 访问 http://localhost:8888
```

### 4. 部署到 Netlify

#### 方法 1: Git 自动部署

1. 将代码推送到 Git 仓库（GitHub、GitLab 等）
2. 在 Netlify 创建新站点并连接仓库
3. 在 Netlify 控制台配置环境变量
4. 自动部署完成

#### 方法 2: 手动上传部署

1. 将整个 `ai-farm` 文件夹压缩
2. 在 Netlify 控制台选择"手动部署"
3. 上传压缩包
4. 配置环境变量
5. 部署完成

## 📚 文档

- [Supabase 设置指南](docs/supabase-setup.md)
- [数据库 Schema 说明](docs/database-schema.md)
- [部署指南](docs/deployment-guide.md)

## 🔧 API 端点

- `/.netlify/functions/api/health` - 健康检查
- `/.netlify/functions/api/example` - 示例 API

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT
