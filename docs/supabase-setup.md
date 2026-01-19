# Supabase 设置指南

本指南将帮助您创建和配置 Supabase 项目。

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 点击 "Start your project"
3. 使用 GitHub 账号登录
4. 点击 "New Project"
5. 填写项目信息：
   - **Name**: 项目名称（例如 `ai-farm`）
   - **Database Password**: 设置一个强密码（请妥善保管）
   - **Region**: 选择离您最近的区域（推荐 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`）
6. 点击 "Create new project"
7. 等待项目初始化（约 1-2 分钟）

## 2. 获取 API Keys

项目创建完成后：

1. 在左侧菜单点击 ⚙️ **Settings**
2. 点击 **API**
3. 您会看到以下信息：

### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```
这就是 `SUPABASE_URL`

### API Keys

#### anon/public Key（公开密钥）
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
这就是 `SUPABASE_ANON_KEY`（可以在前端使用）

#### service_role Key（服务密钥）
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
这就是 `SUPABASE_SERVICE_KEY`（仅在后端使用，**不要泄露**）

## 3. 配置环境变量

### 本地开发

1. 在项目根目录创建 `.env` 文件：
```bash
cp .env.example .env
```

2. 编辑 `.env`，填入您的 Supabase 配置：
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Netlify 部署

1. 登录 [Netlify](https://app.netlify.com/)
2. 选择您的站点
3. 进入 **Site settings** → **Environment variables**
4. 点击 **Add a variable**
5. 添加以下环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`  
   - `SUPABASE_SERVICE_KEY`

## 4. 配置 Row Level Security (RLS)

Row Level Security 是 Supabase 的安全功能，建议为所有表启用。

### 示例：创建一个公开读取的表

1. 在 Supabase 控制台，点击 **Table Editor**
2. 点击 **New table**
3. 创建表（例如 `articles`）
4. 启用 RLS：
   - 点击表名旁边的齿轮图标
   - 启用 "Enable Row Level Security"
5. 添加策略：
   - 点击 **Add policy**
   - 选择 "Enable read access for all users"
   - 保存

### 常用 RLS 策略示例

#### 公开读取（所有人可读）
```sql
CREATE POLICY "公开读取"
ON public.articles
FOR SELECT
USING (true);
```

#### 认证用户可写（需要登录）
```sql
CREATE POLICY "认证用户可插入"
ON public.articles
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

#### 用户只能修改自己的数据
```sql
CREATE POLICY "用户修改自己的数据"
ON public.articles
FOR UPDATE
USING (auth.uid() = user_id);
```

## 5. 测试连接

### 前端测试（浏览器）

1. 打开浏览器控制台（F12）
2. 访问您的网站
3. 点击 "测试数据库" 按钮
4. 查看控制台输出

### 后端测试（Netlify Functions）

使用 Netlify CLI 本地测试：

```bash
netlify dev
```

访问：
```
http://localhost:8888/.netlify/functions/api/health
```

应该看到类似的响应：
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "message": "Supabase 连接成功"
  }
}
```

## 6. 常见问题

### 问题1: 连接失败 "Failed to fetch"
**原因**: 环境变量未正确配置  
**解决**: 检查 `.env` 文件或 Netlify 环境变量是否正确

### 问题2: "Invalid API key"
**原因**: API Key 复制错误  
**解决**: 重新从 Supabase 控制台复制 API Key

### 问题3: "Row Level Security policy violation"
**原因**: RLS 策略阻止了操作  
**解决**: 
- 检查表的 RLS 策略
- 或者在开发阶段临时禁用 RLS（不推荐生产环境）

### 问题4: CORS 错误
**原因**: Supabase 默认已配置 CORS，但需确认  
**解决**: 
1. 在 Supabase 控制台 → Settings → API
2. 检查 "Additional Allowed Origins"

## 7. 下一步

- 查看 [数据库 Schema 说明](./database-schema.md) 了解数据结构
- 查看 [部署指南](./deployment-guide.md) 了解如何部署到 Netlify

## 参考资料

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Python 客户端](https://supabase.com/docs/reference/python/introduction)
