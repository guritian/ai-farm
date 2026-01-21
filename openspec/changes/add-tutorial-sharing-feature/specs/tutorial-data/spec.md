# tutorial-data Specification

## Purpose
提供教程数据的存储和管理能力，包括数据库表结构、RLS 策略和管理后台支持。

## ADDED Requirements

### Requirement: Tutorials 数据表
系统 SHALL 创建 tutorials 表存储教程数据。

#### Scenario: 表结构定义
- **WHEN** 执行数据库迁移脚本
- **THEN** 创建 tutorials 表，包含以下字段：
  - `id` (UUID, PRIMARY KEY)
  - `title` (TEXT, NOT NULL) - 教程标题
  - `author` (TEXT, NOT NULL) - 作者姓名
  - `author_avatar` (TEXT, 可选) - 作者头像 URL
  - `cover_image` (TEXT, NOT NULL) - 封面图 URL
  - `summary` (TEXT, 可选) - 简短摘要
  - `content_md` (TEXT, NOT NULL) - Markdown 内容
  - `tags` (TEXT[], DEFAULT '{}') - 标签数组
  - `view_count` (INTEGER, DEFAULT 0) - 浏览次数
  - `is_featured` (BOOLEAN, DEFAULT false) - 是否推荐
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ, DEFAULT now())

#### Scenario: 索引创建
- **WHEN** 表创建完成
- **THEN** 创建以下索引：
  - `idx_tutorials_tags` (GIN 索引，用于标签查询)
  - `idx_tutorials_created_at` (B-tree 索引，用于排序)
  - `idx_tutorials_is_featured` (B-tree 索引，用于推荐筛选)

#### Scenario: 自动更新时间
- **WHEN** 教程记录被更新
- **THEN** `updated_at` 字段自动更新为当前时间
- **AND** 使用触发器自动执行

---

### Requirement: RLS 策略
系统 SHALL 配置 Row Level Security 策略控制访问权限。

#### Scenario: 公开读取策略
- **WHEN** 匿名用户或认证用户查询教程
- **THEN** 可以读取所有教程数据（SELECT）
- **AND** RLS 策略名称为 `public_read_tutorials`

#### Scenario: 管理员写入策略
- **WHEN** 使用 Service Key 执行写操作
- **THEN** 可以插入、更新、删除教程（INSERT/UPDATE/DELETE）
- **AND** 绕过 RLS 策略

---

### Requirement: 数据验证
系统 SHALL 在数据库层面验证数据完整性。

#### Scenario: 必填字段验证
- **WHEN** 尝试插入教程但缺少必填字段
- **THEN** 数据库返回错误
- **AND** 前端显示友好的错误提示

#### Scenario: URL 格式验证（可选）
- **WHEN** `cover_image` 或 `author_avatar` 字段不是有效 URL
- **THEN** 可选：使用数据库约束验证
- **OR** 在应用层验证

---

### Requirement: 管理后台 CRUD
管理后台 SHALL 支持教程的增删改查操作。

#### Scenario: 创建教程
- **WHEN** 管理员在后台点击"添加教程"
- **THEN** 显示教程表单（标题、作者、封面图、Markdown 内容等）
- **AND** 提交后调用 Supabase INSERT 操作

#### Scenario: 编辑教程
- **WHEN** 管理员点击"编辑"按钮
- **THEN** 表单预填充现有数据
- **AND** 提交后调用 Supabase UPDATE 操作

#### Scenario: 删除教程
- **WHEN** 管理员点击"删除"按钮
- **THEN** 显示确认对话框
- **AND** 确认后调用 Supabase DELETE 操作

#### Scenario: Markdown 编辑体验
- **WHEN** 管理员编辑 Markdown 内容
- **THEN** 提供文本域输入（textarea）
- **AND** 可选：提供实时预览功能
- **AND** 可选：提供语法提示（高亮、快捷键）

---

### Requirement: 浏览次数统计
系统 SHALL 记录教程的浏览次数。

#### Scenario: 浏览次数增加
- **WHEN** 用户打开教程详情页
- **THEN** `view_count` 字段 +1
- **AND** 使用 Supabase RPC 或 UPDATE 操作

#### Scenario: 浏览次数展示（可选）
- **WHEN** 显示教程列表或详情时
- **THEN** 可选：显示浏览次数
- **AND** 格式化为易读形式（如 "1.2K 次浏览"）

---

### Requirement: 示例数据
系统 SHALL 提供示例教程数据用于测试。

#### Scenario: 插入示例教程
- **WHEN** 执行初始化脚本
- **THEN** 插入 2-3 个示例教程
- **AND** 包含真实的 Markdown 内容
- **AND** 包含不同的标签和作者
