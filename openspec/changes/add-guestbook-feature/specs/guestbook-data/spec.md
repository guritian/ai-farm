# guestbook-data Specification

## Purpose
提供留言板数据的存储和管理能力,包括数据库表结构、索引优化和数据约束。

## ADDED Requirements

### Requirement: Guestbook 数据表
系统 SHALL 创建 guestbook 表存储访客留言数据。

#### Scenario: 表结构定义
- **WHEN** 执行数据库迁移脚本
- **THEN** 创建 guestbook 表,包含以下字段:
  - `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
  - `author` (VARCHAR(100), NOT NULL) - 留言者姓名
  - `content` (TEXT, NOT NULL) - 留言内容，最多 2000 字符
  - `created_at` (TIMESTAMPTZ, DEFAULT NOW())
  - `likes_count` (INTEGER, DEFAULT 0) - 点赞数
  - `is_approved` (BOOLEAN, DEFAULT FALSE) - 审核状态
  - `is_featured` (BOOLEAN, DEFAULT FALSE) - 置顶标记

#### Scenario: 用户提交新留言
- **WHEN** 访客填写留言表单并提交
- **THEN** 新记录插入 guestbook 表
- **AND** `is_approved` 默认为 false (待审核)
- **AND** `created_at` 自动设置为当前时间
- **AND** `likes_count` 初始化为 0

#### Scenario: 管理员审核留言
- **WHEN** 管理员在后台点击"审核通过"
- **THEN** 对应记录的 `is_approved` 更新为 true
- **AND** 该留言在前台页面可见

---

### Requirement: 数据库索引
系统 SHALL 创建索引以优化查询性能。

#### Scenario: 索引创建
- **WHEN** guestbook 表创建完成
- **THEN** 创建以下索引:
  - `idx_guestbook_created_at` - 按时间排序
  - `idx_guestbook_approved` - 筛选已审核消息
  - `idx_guestbook_likes` - 按点赞数排序
  - `idx_guestbook_featured` - 筛选置顶消息

#### Scenario: 按时间排序查询
- **WHEN** 前台加载留言列表(最新优先)
- **THEN** 使用 `idx_guestbook_created_at` 索引
- **AND** 查询只返回 `is_approved = true` 的记录
- **AND** 按 `created_at DESC` 排序

#### Scenario: 按热度排序查询
- **WHEN** 用户切换到"最热"排序
- **THEN** 使用 `idx_guestbook_likes` 索引
- **AND** 按 `likes_count DESC` 排序

---

### Requirement: 数据约束
系统 SHALL 定义约束确保数据完整性。

#### Scenario: 必填字段验证
- **WHEN** 尝试插入留言但 author 或 content 为空
- **THEN** 数据库返回 NOT NULL 约束错误
- **AND** 前端显示"请输入姓名"或"请输入留言内容"

#### Scenario: 字段长度限制
- **WHEN** author 超过 100 字符
- **THEN** 数据库拒绝插入
- **AND** 约束名称: `guestbook_author_length`

#### Scenario: 点赞数非负约束
- **WHEN** 尝试将 likes_count 设置为负数
- **THEN** 数据库返回 CHECK 约束错误
- **AND** 约束名称: `guestbook_likes_non_negative`

#### Scenario: 内容长度验证
- **WHEN** content 超过 2000 字符
- **THEN** 数据库拒绝插入
- **AND** 约束名称: `guestbook_content_length`

---

### Requirement: 示例数据
系统 SHALL 提供示例留言数据用于开发测试。

#### Scenario: 插入示例留言
- **WHEN** 执行迁移脚本的测试数据部分
- **THEN** 插入 5-10 条示例留言
- **AND** 部分留言已审核(`is_approved = true`)
- **AND** 包含不同的点赞数和时间戳
- **AND** 至少一条留言为置顶(`is_featured = true`)
