# 数据库 Schema 说明

本文档描述 AI Farm 项目的数据库结构。

## 概述

当前项目处于初始阶段，尚未定义具体的业务表。以下是推荐的基础表结构，您可以根据实际需求进行调整。

## 推荐的基础表结构

### 1. 用户表 (users)

存储用户基本信息（如果使用 Supabase Auth，此表可选）

| 列名 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | uuid | 用户 ID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| email | text | 邮箱 | UNIQUE, NOT NULL |
| username | text | 用户名 | UNIQUE |
| created_at | timestamptz | 创建时间 | DEFAULT now() |
| updated_at | timestamptz | 更新时间 | DEFAULT now() |

### 2. 文章表 (articles)

存储知识科普文章

| 列名 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | uuid | 文章 ID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| title | text | 标题 | NOT NULL |
| content | text | 内容 | NOT NULL |
| author_id | uuid | 作者 ID | FOREIGN KEY (users.id) |
| category | text | 分类 | |
| tags | text[] | 标签数组 | |
| published | boolean | 是否发布 | DEFAULT false |
| views | integer | 浏览次数 | DEFAULT 0 |
| created_at | timestamptz | 创建时间 | DEFAULT now() |
| updated_at | timestamptz | 更新时间 | DEFAULT now() |

### 3. AI 工具表 (ai_tools)

存储 AI 工具信息

| 列名 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | uuid | 工具 ID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| name | text | 工具名称 | NOT NULL |
| description | text | 描述 | |
| category | text | 分类（文本生成、图像处理等） | |
| api_endpoint | text | API 端点 | |
| config | jsonb | 配置参数 | |
| enabled | boolean | 是否启用 | DEFAULT true |
| created_at | timestamptz | 创建时间 | DEFAULT now() |
| updated_at | timestamptz | 更新时间 | DEFAULT now() |

### 4. 使用记录表 (usage_logs)

记录用户使用 AI 工具的历史

| 列名 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | uuid | 记录 ID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | uuid | 用户 ID | FOREIGN KEY (users.id) |
| tool_id | uuid | 工具 ID | FOREIGN KEY (ai_tools.id) |
| input_data | jsonb | 输入数据 | |
| output_data | jsonb | 输出数据 | |
| status | text | 状态（success, failed） | |
| error_message | text | 错误信息 | |
| created_at | timestamptz | 创建时间 | DEFAULT now() |

## 创建表的 SQL 脚本

您可以在 Supabase SQL Editor 中执行以下脚本创建基础表：

```sql
-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 创建文章表
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id),
    category TEXT,
    tags TEXT[],
    published BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 创建 AI 工具表
CREATE TABLE IF NOT EXISTS ai_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    api_endpoint TEXT,
    config JSONB,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 创建使用记录表
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    tool_id UUID REFERENCES ai_tools(id),
    input_data JSONB,
    output_data JSONB,
    status TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 创建索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tool ON usage_logs(tool_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at DESC);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要自动更新 updated_at 的表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_tools_updated_at BEFORE UPDATE ON ai_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS) 策略

建议为每个表启用 RLS 并配置适当的策略：

```sql
-- 文章表 RLS 策略示例

-- 启用 RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看已发布的文章
CREATE POLICY "公开读取已发布文章"
ON articles FOR SELECT
USING (published = true);

-- 认证用户可以查看所有文章（包括未发布）
CREATE POLICY "认证用户查看所有文章"
ON articles FOR SELECT
TO authenticated
USING (true);

-- 作者可以插入文章
CREATE POLICY "作者创建文章"
ON articles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- 作者可以更新自己的文章
CREATE POLICY "作者更新自己的文章"
ON articles FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

-- 作者可以删除自己的文章
CREATE POLICY "作者删除自己的文章"
ON articles FOR DELETE
TO authenticated
USING (auth.uid() = author_id);
```

## 数据迁移

如果您需要修改表结构，建议使用 Supabase Migrations：

1. 在 Supabase 控制台 → SQL Editor
2. 编写迁移 SQL
3. 执行并测试
4. 保存 SQL 脚本到 `docs/migrations/` 目录（版本控制）

## 下一步

- 根据实际业务需求调整表结构
- 配置 RLS 策略保护数据安全
- 在前后端代码中集成数据库操作

## 参考

- [Supabase 表设计最佳实践](https://supabase.com/docs/guides/database/tables)
- [PostgreSQL 数据类型](https://www.postgresql.org/docs/current/datatype.html)
