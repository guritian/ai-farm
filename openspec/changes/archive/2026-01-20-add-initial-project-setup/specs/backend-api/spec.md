## ADDED Requirements

### Requirement: Netlify Functions 基础架构
项目 SHALL 使用 Netlify Functions 提供 Python 后端 API 能力。

#### Scenario: Functions 目录结构
- **WHEN** 查看 netlify/functions 目录
- **THEN** 包含 requirements.txt、utils/ 和 api/ 子目录
- **AND** 符合 Netlify Functions 的标准结构

#### Scenario: Python 依赖管理
- **WHEN** 部署到 Netlify
- **THEN** 自动安装 requirements.txt 中列出的依赖
- **AND** 包含 supabase-py 等必要的库

### Requirement: Supabase 后端集成
后端 SHALL 提供 Supabase 连接工具类，封装数据库访问逻辑。

#### Scenario: Supabase Helper 初始化
- **WHEN** 导入 utils/supabase_helper.py
- **THEN** 使用 SUPABASE_SERVICE_KEY 初始化 Supabase 客户端
- **AND** 提供通用的数据库操作方法（查询、插入、更新、删除）

#### Scenario: 环境变量访问
- **WHEN** Functions 运行时
- **THEN** 从 Netlify 环境变量中读取 SUPABASE_URL 和 SUPABASE_SERVICE_KEY
- **AND** 如果环境变量缺失，抛出明确的错误信息

### Requirement: 健康检查 API
系统 SHALL 提供健康检查端点，用于验证后端服务状态。

#### Scenario: 健康检查响应
- **WHEN** GET 请求 /.netlify/functions/api/health
- **THEN** 返回 HTTP 200 状态码
- **AND** JSON 响应包含 {"status": "healthy", "timestamp": "..."}

#### Scenario: 数据库连接验证
- **WHEN** 健康检查 API 执行时
- **THEN** 尝试连接 Supabase 数据库
- **AND** 在响应中包含数据库连接状态

### Requirement: 示例 API 端点
系统 SHALL 提供示例 API 端点，演示完整的请求处理流程。

#### Scenario: 示例 API 请求
- **WHEN** GET 请求 /.netlify/functions/api/example
- **THEN** 返回示例数据（从 Supabase 查询或硬编码）
- **AND** 响应格式为 JSON

#### Scenario: 错误处理
- **WHEN** API 处理过程中发生错误
- **THEN** 返回适当的 HTTP 错误状态码（4xx 或 5xx）
- **AND** 响应包含错误信息和错误类型

### Requirement: CORS 配置
API SHALL 配置正确的 CORS 头，支持前端跨域请求。

#### Scenario: 跨域请求响应
- **WHEN** 前端发起 API 请求
- **THEN** 响应包含 Access-Control-Allow-Origin 头
- **AND** 允许来自 Netlify 域名的请求
