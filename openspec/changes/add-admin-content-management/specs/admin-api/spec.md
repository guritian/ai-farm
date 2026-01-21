# admin-api Specification

## Purpose
提供使用 Supabase Service Key 的数据库直接访问能力，支持本地管理页面对 AI 工具数据的写操作（创建、更新、删除）。无需额外后端 API。

## ADDED Requirements

### Requirement: Supabase Service Key 配置
系统 SHALL 使用 Supabase Service Key 直接访问数据库，绕过 RLS 策略。

#### Scenario: Service Key 读取
- **WHEN** 本地管理页面初始化时
- **THEN** 从配置文件或 JavaScript 常量读取 `SUPABASE_SERVICE_KEY`(或者用环境变量配置的方式)
- **AND** 使用该 Key 初始化 Supabase Client

#### Scenario: Service Key 权限
- **WHEN** 使用 Service Key 执行数据库操作
- **THEN** 绕过所有 Row Level Security (RLS) 策略
- **AND** 拥有完全的读写权限

---

### Requirement: 工具 CRUD 操作（使用 Supabase Client SDK）
系统 SHALL 直接使用 Supabase JavaScript Client SDK 在前端执行所有 CRUD 操作。

#### Scenario: 创建工具
- **WHEN** 前端调用 `supabase.from('ai_tools').insert(...)`
- **THEN** 使用 Service Key 或已认证用户 token
- **AND** 数据库插入新记录
- **AND** 返回新创建的工具对象（包含生成的 UUID）

#### Scenario: 更新工具
- **WHEN** 前端调用 `supabase.from('ai_tools').update(...).eq('id', toolId)`
- **THEN** 更新指定 ID 的工具记录
- **AND** 触发 `updated_at` 字段自动更新
- **AND** 返回更新后的工具对象

#### Scenario: 删除工具
- **WHEN** 前端调用 `supabase.from('ai_tools').delete().eq('id', toolId)`
- **THEN** 从数据库中删除指定 ID 的工具
- **AND** 返回删除操作结果

#### Scenario: 查询所有工具（含管理字段）
- **WHEN** 管理页面加载时
- **THEN** 调用 `supabase.from('ai_tools').select('*').order('created_at', { ascending: false })`
- **AND** 返回所有工具的完整数据（包括 created_at、updated_at）

---

### Requirement: Supabase RLS 策略更新
数据库 SHALL 更新 Row Level Security 策略以支持管理员写操作。

#### Scenario: UPDATE 策略
- **WHEN** 使用 Service Key 或特定认证用户执行 UPDATE
- **THEN** Supabase RLS 允许该操作
- **AND** 普通用户（匿名）仍然只能 SELECT

#### Scenario: DELETE 策略
- **WHEN** 使用 Service Key 或特定认证用户执行 DELETE
- **THEN** Supabase RLS 允许该操作
- **AND** 普通用户（匿名）仍然只能 SELECT

---

### Requirement: 错误处理
API SHALL 提供清晰的错误信息和状态码。

#### Scenario: 未认证请求
- **WHEN** 前端在未认证状态下尝试写操作
- **THEN** Supabase 返回权限错误
- **AND** 前端捕获错误并提示用户重新登录

#### Scenario: 数据验证错误
- **WHEN** 提交的数据违反数据库约束（如必填字段为空）
- **THEN** Supabase 返回验证错误
- **AND** 前端显示具体的字段错误信息

#### Scenario: 网络错误
- **WHEN** Supabase 请求因网络问题失败
- **THEN** 前端捕获异常
- **AND** 显示"网络连接失败，请重试"提示

---

### Requirement: 数据格式处理
系统 SHALL 正确处理数组字段（tags、features）的格式转换。

#### Scenario: 标签数组转换
- **WHEN** 用户在前端输入标签（逗号分隔字符串，如 "AI助手, 文本生成, 热门"）
- **THEN** JavaScript 将其转换为数组 `['AI助手', '文本生成', '热门']`
- **AND** 插入或更新到 Supabase（PostgreSQL TEXT[] 类型）

#### Scenario: 功能数组转换
- **WHEN** 用户在前端输入功能列表（每行一个功能）
- **THEN** JavaScript 将其转换为数组
- **AND** 插入或更新到 Supabase（PostgreSQL TEXT[] 类型）

#### Scenario: 空数组处理
- **WHEN** 用户未填写可选数组字段
- **THEN** 存储为空数组 `[]` 而非 null
- **AND** 符合数据库默认值 `'{}'`
