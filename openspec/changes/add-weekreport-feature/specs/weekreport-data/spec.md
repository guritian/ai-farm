# Weekreport Data Spec

## Overview

AI 周报数据存储和管理规范，定义数据库表结构和数据访问策略。

---

## ADDED Requirements

### Requirement: Weekreport Table Schema
The database MUST include a `weekreports` table for storing weekly report data.

#### Scenario: 创建周报表结构
- **Given** Supabase 数据库已连接
- **When** 执行周报迁移脚本
- **Then** 创建 `weekreports` 表包含以下字段:
  - `id` (UUID, 主键)
  - `title` (TEXT, 非空, 周报标题)
  - `video_url` (TEXT, 非空, 视频嵌入链接)
  - `content_md` (TEXT, 可空, Markdown 格式内容)
  - `published_at` (TIMESTAMPTZ, 发布时间)
  - `created_at` (TIMESTAMPTZ, 创建时间)
  - `updated_at` (TIMESTAMPTZ, 更新时间)

#### Scenario: 周报数据查询
- **Given** 数据库中存在周报记录
- **When** 前端请求周报列表
- **Then** 返回按 `published_at` 倒序排列的周报数据

---

### Requirement: Weekreport RLS Policies
The database MUST configure Row Level Security policies to control access permissions.

#### Scenario: 公开读取策略
- **Given** 用户访问周报页面
- **When** 请求周报数据
- **Then** 允许所有用户读取周报记录

#### Scenario: 管理员写入策略
- **Given** 管理员在后台操作
- **When** 执行插入/更新/删除操作
- **Then** 允许操作（通过 service_role 或管理员认证）

---

### Requirement: Video URL Validation
Video URLs MUST conform to supported platform formats.

#### Scenario: 有效的 YouTube 链接
- **Given** 用户提交周报
- **When** video_url 格式为 `https://www.youtube.com/embed/VIDEO_ID`
- **Then** 链接被接受并存储

#### Scenario: 有效的 Bilibili 链接
- **Given** 用户提交周报
- **When** video_url 格式为 `https://player.bilibili.com/player.html?bvid=BVID`
- **Then** 链接被接受并存储

#### Scenario: 无效链接拒绝
- **Given** 用户提交周报
- **When** video_url 不是 HTTPS 或不符合支持格式
- **Then** 提示错误并拒绝提交

---

## Related Capabilities
- `database-integration` - 复用 Supabase 连接配置
- `weekreport-ui` - 前端数据消费
- `weekreport-admin` - 管理后台数据操作
