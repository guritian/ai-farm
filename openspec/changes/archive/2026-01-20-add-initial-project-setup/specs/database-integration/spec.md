## ADDED Requirements

### Requirement: Supabase 配置管理
项目 SHALL 提供 Supabase 连接配置的管理机制。

#### Scenario: 环境变量示例文件
- **WHEN** 查看 .env.example 文件
- **THEN** 包含所有必需的 Supabase 配置项
- **AND** 每个配置项都有清晰的注释说明

#### Scenario: 环境变量格式
- **WHEN** 读取 .env.example
- **THEN** 包含以下配置项：
  - SUPABASE_URL（Supabase 项目 URL）
  - SUPABASE_ANON_KEY（前端公开密钥）
  - SUPABASE_SERVICE_KEY（后端服务密钥）

### Requirement: 前端 Supabase 配置
前端 SHALL 使用 SUPABASE_ANON_KEY 访问 Supabase。

#### Scenario: 前端环境变量注入
- **WHEN** 前端页面加载时
- **THEN** 从环境变量或配置文件中读取 SUPABASE_URL 和 SUPABASE_ANON_KEY
- **AND** 初始化 Supabase 客户端

#### Scenario: 公开密钥权限
- **WHEN** 前端使用 ANON_KEY 访问数据库
- **THEN** 只能访问 Row Level Security (RLS) 允许的数据
- **AND** 无法执行需要 Service Role 权限的操作

### Requirement: 后端 Supabase 配置
后端 SHALL 使用 SUPABASE_SERVICE_KEY 访问 Supabase，拥有完整权限。

#### Scenario: Service Key 安全性
- **WHEN** 后端 Functions 使用 SERVICE_KEY
- **THEN** 该密钥仅存储在 Netlify 环境变量中（不提交到 Git）
- **AND** 可以绕过 RLS 执行管理操作

#### Scenario: 后端数据库操作
- **WHEN** 后端执行数据库操作
- **THEN** 使用 supabase_helper.py 工具类
- **AND** 自动使用 SERVICE_KEY 初始化客户端

### Requirement: 数据库 Schema 文档
项目 SHALL 提供数据库 Schema 的文档说明。

#### Scenario: Schema 文档内容
- **WHEN** 查看 docs/database-schema.md
- **THEN** 包含所有数据表的结构说明
- **AND** 说明每个表的用途和字段定义

#### Scenario: 初始化脚本（可选）
- **WHEN** 需要初始化数据库时
- **THEN** 文档包含 SQL 脚本或 Supabase Migration 文件
- **AND** 可以一键创建所有必要的表和 RLS 策略

### Requirement: Supabase 设置指南
项目 SHALL 提供 Supabase 项目设置的完整指南。

#### Scenario: 设置步骤文档
- **WHEN** 查看 docs/supabase-setup.md
- **THEN** 包含以下步骤：
  1. 如何创建 Supabase 项目
  2. 如何获取 URL 和 API Keys
  3. 如何配置 RLS 策略
  4. 如何设置环境变量

#### Scenario: 故障排除
- **WHEN** 遇到 Supabase 连接问题
- **THEN** 文档提供常见问题和解决方案
- **AND** 包含调试步骤
