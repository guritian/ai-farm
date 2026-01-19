# Project Context

## Purpose
AI Farm 是一个 AI 工具和知识科普网站，旨在提供 AI 相关的工具、知识分享和科普内容。

## Tech Stack
- **后端**: Python（Flask 或 FastAPI）
- **前端**: 静态网页（HTML、CSS、JavaScript）
- **数据库**: Supabase（PostgreSQL + 实时订阅）
- **部署**: Netlify（静态托管 + Serverless Functions）
- **AI 集成**: Google Gemini API、其他 AI 服务

## Project Conventions

### Code Style
- Python: 遵循 PEP 8 规范
- JavaScript: 使用现代 ES6+ 语法
- 文件命名: 小写加下划线（snake_case）用于 Python，小驼峰（camelCase）用于 JavaScript
- 注释: 关键逻辑使用中文注释说明

### Architecture Patterns
- **前后端分离**: 静态前端通过 API 调用后端服务
- **Serverless 优先**: 后端 API 部署为 Netlify Functions
- **单文件夹部署**: 所有文件组织在一个文件夹内，支持直接上传 Netlify
- **环境变量管理**: 敏感信息（API keys、数据库连接）通过环境变量配置

### Testing Strategy
- 后端 API: 使用 pytest 进行单元测试
- 前端: 手动测试 + 浏览器兼容性验证
- 集成测试: Supabase 连接和 API 端到端测试

### Git Workflow
- 主分支: `main`（生产环境）
- 开发分支: `dev`（开发环境）
- 功能分支: `feature/功能名称`
- 提交信息: 使用中文描述，格式：`[类型] 简短描述`

## Domain Context
- **AI 工具**: 提供各种 AI 辅助工具（如文本生成、图像处理等）
- **知识科普**: 发布 AI 相关的科普文章和教程
- **用户交互**: 支持用户提交内容、评论和反馈

## Important Constraints
- **部署限制**: 必须支持 Netlify 单文件夹部署
- **成本控制**: 优先使用免费层服务（Netlify、Supabase 免费额度）
- **响应式设计**: 前端需支持移动端和桌面端
- **中文优先**: 所有内容和界面以中文为主

## External Dependencies
- **Supabase**: 数据存储、用户认证、实时订阅
- **Google Gemini API**: AI 内容生成
- **Netlify**: 静态托管 + Serverless Functions
- **CDN**: 静态资源加速（Netlify CDN）
