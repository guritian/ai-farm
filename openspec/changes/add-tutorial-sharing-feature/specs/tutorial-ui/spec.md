# tutorial-ui Specification

## Purpose
提供基于 Tab 导航的教程分享界面，允许用户浏览教程列表和查看 Markdown 格式的教程详情，同时为未来拓展更多内容板块预留架构空间。

## ADDED Requirements

### Requirement: Tab 导航系统
系统 SHALL 提供可拓展的 Tab 导航，支持在不同内容类型间切换。

#### Scenario: Tab 导航展示
- **WHEN** 用户访问主页
- **THEN** 显示 Tab 导航栏（AI 工具、教程分享）
- **AND** 默认激活"AI 工具" Tab
- **AND** 显示对应的 AI 工具列表内容

#### Scenario: Tab 切换
- **WHEN** 用户点击"教程分享" Tab
- **THEN** 切换到教程列表视图
- **AND** URL hash 更新为 `#tutorials`
- **AND** 从 Supabase 加载教程数据

#### Scenario: Tab 样式反馈
- **WHEN** Tab 被激活
- **THEN** 显示下划线或背景高亮
- **AND** 字体颜色变为主色调

#### Scenario: 可拓展设计
- **WHEN** 未来需要添加新板块（如"资讯"）
- **THEN** 只需在导航数组中添加新 Tab 配置
- **AND** 系统自动渲染新 Tab

---

### Requirement: 教程列表展示
系统 SHALL 以卡片形式展示教程列表，包含标题、作者、封面图等信息。

#### Scenario: 加载教程列表
- **WHEN** 用户切换到"教程分享" Tab
- **THEN** 从 Supabase 查询所有教程数据
- **AND** 按创建时间倒序排列
- **AND** 以卡片网格形式展示

#### Scenario: 教程卡片内容
- **WHEN** 渲染教程卡片
- **THEN** 显示封面图（cover_image）
- **AND** 显示教程标题（title）
- **AND** 显示作者信息（author）
- **AND** 可选：显示标签、创建时间、摘要

#### Scenario: 空状态
- **WHEN** 数据库中没有任何教程
- **THEN** 显示"暂无教程"提示
- **AND** 显示引导文案

#### Scenario: 卡片点击
- **WHEN** 用户点击教程卡片
- **THEN** 跳转到教程详情页
- **AND** URL hash 更新为 `#tutorial/:id`

---

### Requirement: 教程详情页
系统 SHALL 展示 Markdown 格式的教程详情内容。

#### Scenario: 详情页加载
- **WHEN** 用户访问 `#tutorial/:id`
- **THEN** 从 Supabase 查询指定 ID 的教程
- **AND** 隐藏列表视图，显示详情视图
- **AND** 显示加载指示器

#### Scenario: Markdown 内容渲染
- **WHEN** 教程数据加载成功
- **THEN** 使用 marked.js 渲染 Markdown 内容（content_md）
- **AND** 应用统一的 Markdown 样式（标题、段落、列表、代码块等）
- **AND** 可选：使用 highlight.js 高亮代码块

#### Scenario: 详情页头部
- **WHEN** 详情页渲染时
- **THEN** 显示教程标题
- **AND** 显示作者和创建时间
- **AND** 显示返回按钮

#### Scenario: 返回列表
- **WHEN** 用户点击返回按钮
- **THEN** 隐藏详情视图，显示列表视图
- **AND** URL hash 更新为 `#tutorials`

---

### Requirement: 搜索和筛选
系统 SHALL 支持教程的搜索和标签筛选功能。

#### Scenario: 标题搜索
- **WHEN** 用户在搜索框输入关键词
- **THEN** 实时过滤教程列表（标题或摘要匹配）

#### Scenario: 标签筛选
- **WHEN** 用户点击某个标签
- **THEN** 只显示包含该标签的教程

#### Scenario: 清除筛选
- **WHEN** 用户点击"清除筛选"
- **THEN** 重置所有筛选条件
- **AND** 显示所有教程

---

### Requirement: 响应式设计
教程界面 SHALL 支持移动端、平板、桌面的响应式布局。

#### Scenario: 桌面布局（>= 1024px）
- **WHEN** 页面在宽度 >= 1024px 的设备上显示
- **THEN** 教程卡片 3 列网格布局
- **AND** Tab 导航水平排列

#### Scenario: 平板布局（768px - 1023px）
- **WHEN** 页面在宽度 768px - 1023px 的设备上显示
- **THEN** 教程卡片 2 列网格布局

#### Scenario: 移动端布局（< 768px）
- **WHEN** 页面在宽度 < 768px 的设备上显示
- **THEN** 教程卡片 1 列布局
- **AND** Tab 导航可横向滚动

---

### Requirement: 加载状态和错误处理
系统 SHALL 提供清晰的加载状态和错误提示。

#### Scenario: 数据加载状态
- **WHEN** 从 Supabase 加载教程数据时
- **THEN** 显示加载指示器（spinner）

#### Scenario: 加载失败
- **WHEN** Supabase 查询失败
- **THEN** 显示错误信息和重试按钮

#### Scenario: 教程不存在
- **WHEN** 用户访问不存在的教程 ID
- **THEN** 显示"教程不存在"提示
- **AND** 提供返回列表按钮

---

### Requirement: Markdown 安全性
系统 SHALL 对 Markdown 内容进行 sanitize，防止 XSS 攻击。

#### Scenario: HTML 标签过滤
- **WHEN** 渲染 Markdown 内容时
- **THEN** 使用 marked.js 的 sanitize 选项
- **OR** 使用 DOMPurify 库清理 HTML

#### Scenario: 脚本标签阻止
- **WHEN** Markdown 内容包含 `<script>` 标签
- **THEN** 移除或转义该标签
- **AND** 不执行其中的 JavaScript 代码
