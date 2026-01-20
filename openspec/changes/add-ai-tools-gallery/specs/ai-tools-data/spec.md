## ADDED Requirements

### Requirement: AI 工具数据存储
系统 SHALL 在 Supabase 中存储 AI 工具信息，包括名称、描述、URL、截图、标签等。

#### Scenario: 创建工具表
- **WHEN** 在 Supabase 中创建 `ai_tools` 表
- **THEN** 表包含以下字段:
  - `id` (UUID, 主键)
  - `name` (TEXT, 工具名称)
  - `description` (TEXT, 描述)
  - `url` (TEXT, 官网链接)
  - `image_url` (TEXT, 截图/Logo URL)
  - `tags` (TEXT[], 标签数组)
  - `features` (TEXT[], 功能列表)
  - `pricing` (TEXT, 定价信息)
  - `is_featured` (BOOLEAN, 是否推荐)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

#### Scenario: 设置 RLS 策略
- **WHEN** 配置表的 Row Level Security
- **THEN** 所有用户都有读取权限
- **AND** 仅通过 Service Key 可以写入（管理员）

### Requirement: 初始数据填充
系统 SHALL 预先填充 10-15 个热门 AI 工具作为示例数据。

#### Scenario: 插入示例工具
- **WHEN** 初始化数据库
- **THEN** 插入涵盖以下类别的工具:
  - 文本生成（如 ChatGPT, Claude）
  - 图像生成（如 Midjourney, DALL-E）
  - 视频生成（如 Sora, Runway）
  - 代码辅助（如 GitHub Copilot）
  - 其他实用工具
- **AND** 每个工具包含完整的字段信息

### Requirement: 工具数据查询
前端 SHALL 能够从 Supabase 查询工具列表。

#### Scenario: 查询所有工具
- **WHEN** 页面加载时
- **THEN** 从 `ai_tools` 表查询所有工具
- **AND** 按照 `is_featured DESC, created_at DESC` 排序
- **AND** 将数据返回给前端渲染

#### Scenario: 按标签查询
- **WHEN** 用户选择特定标签
- **THEN** 使用 Supabase 的 `overlaps()` 函数筛选
- **AND** 返回包含该标签的所有工具
