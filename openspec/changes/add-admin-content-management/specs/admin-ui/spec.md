# admin-ui Specification

## Purpose
提供基于 Web 的本地管理界面（仅在 `http://localhost` 访问），允许开发者通过友好的表单和列表视图对 AI 工具数据进行增删改查（CRUD）操作，降低内容维护的技术门槛。本页面不部署到生产环境。

## ADDED Requirements

### Requirement: 本地环境配置
系统 SHALL 从本地环境读取 Supabase Service Key 用于数据库操作。

#### Scenario: Service Key 配置
- **WHEN** 管理页面加载时
- **THEN** 从 JavaScript 配置区域或环境变量读取 `SUPABASE_SERVICE_KEY`
- **AND** 使用 Service Key 初始化 Supabase Client

#### Scenario: 配置缺失提示
- **WHEN** 未配置 Service Key
- **THEN** 显示错误提示："请配置 Supabase Service Key"
- **AND** 提供配置说明链接

---

### Requirement: 工具列表展示
系统 SHALL 以表格形式展示所有 AI 工具，支持快速浏览和操作。

#### Scenario: 加载工具列表
- **WHEN** 管理页面加载完成
- **THEN** 从 Supabase 查询所有工具数据（使用 Service Key）
- **AND** 以表格形式展示（列：名称、描述、标签、定价、是否推荐、操作）
- **AND** 按创建时间倒序排列

#### Scenario: 空数据状态
- **WHEN** 数据库中没有任何工具
- **THEN** 显示"暂无工具"提示
- **AND** 显示"添加第一个工具"的引导按钮

#### Scenario: 工具列表操作按钮
- **WHEN** 工具列表渲染完成
- **THEN** 每一行显示"编辑"和"删除"按钮
- **AND** 按钮有清晰的视觉反馈（hover 状态）

---

### Requirement: 添加新工具
系统 SHALL 提供表单界面用于添加新的 AI 工具。

#### Scenario: 打开添加表单
- **WHEN** 用户点击"添加工具"按钮
- **THEN** 显示添加工具表单模态框或专用区域
- **AND** 表单包含所有必要字段：
  - 名称（必填）
  - 描述（必填）
  - URL（必填）
  - 图片 URL（可选）
  - 标签（数组，可选）
  - 功能列表（数组，可选）
  - 定价信息（可选）
  - 是否推荐（复选框）

#### Scenario: 表单提交验证
- **WHEN** 用户提交添加表单
- **THEN** 验证必填字段是否填写
- **AND** 验证 URL 格式是否正确
- **AND** 如果验证失败，显示错误提示并阻止提交

#### Scenario: 成功添加工具
- **WHEN** 表单验证通过并提交
- **THEN** 调用 Supabase INSERT 操作
- **AND** 成功后显示成功提示
- **AND** 关闭表单
- **AND** 刷新工具列表

#### Scenario: 添加失败处理
- **WHEN** 添加操作失败（网络错误、数据库错误）
- **THEN** 显示错误信息
- **AND** 保持表单数据不丢失
- **AND** 允许用户重新提交

---

### Requirement: 编辑现有工具
系统 SHALL 允许管理员编辑已有工具的信息。

#### Scenario: 打开编辑表单
- **WHEN** 用户点击某个工具的"编辑"按钮
- **THEN** 显示编辑表单（复用添加表单组件）
- **AND** 表单字段预填充该工具的当前数据

#### Scenario: 更新工具信息
- **WHEN** 用户修改字段并提交
- **THEN** 验证表单数据
- **AND** 调用 Supabase UPDATE 操作
- **AND** 成功后显示成功提示并刷新列表

#### Scenario: 取消编辑
- **WHEN** 用户点击"取消"按钮
- **THEN** 关闭表单
- **AND** 不保存任何修改

---

### Requirement: 删除工具
系统 SHALL 提供删除工具功能，并要求确认操作。

#### Scenario: 触发删除操作
- **WHEN** 用户点击某个工具的"删除"按钮
- **THEN** 显示确认对话框
- **AND** 对话框显示工具名称和警告信息

#### Scenario: 确认删除
- **WHEN** 用户在确认对话框中点击"确认"
- **THEN** 调用 Supabase DELETE 操作
- **AND** 成功后显示成功提示
- **AND** 从列表中移除该工具

#### Scenario: 取消删除
- **WHEN** 用户在确认对话框中点击"取消"
- **THEN** 关闭对话框
- **AND** 不执行删除操作

---

### Requirement: 搜索和筛选
系统 SHALL 支持基本的搜索和筛选功能。

#### Scenario: 名称搜索
- **WHEN** 用户在搜索框中输入关键词
- **THEN** 表格实时过滤显示包含该关键词的工具（名称或描述匹配）

#### Scenario: 标签筛选
- **WHEN** 用户选择某个标签筛选器
- **THEN** 表格只显示包含该标签的工具

#### Scenario: 清除筛选
- **WHEN** 用户点击"清除筛选"按钮
- **THEN** 重置所有筛选条件
- **AND** 显示所有工具

---

### Requirement: 响应式设计
管理页面 SHALL 支持桌面和平板设备的响应式布局。

#### Scenario: 桌面布局（>= 1024px）
- **WHEN** 页面在宽度 >= 1024px 的设备上显示
- **THEN** 表格展示所有列
- **AND** 表单使用两列布局

#### Scenario: 平板布局（768px - 1023px）
- **WHEN** 页面在宽度 768px - 1023px 的设备上显示
- **THEN** 表格隐藏部分次要列（如描述）
- **AND** 表单使用单列布局

#### Scenario: 移动端不支持提示
- **WHEN** 页面在宽度 < 768px 的设备上显示
- **THEN** 显示提示信息："请使用桌面或平板设备访问管理页面"

---

### Requirement: 错误处理和加载状态
系统 SHALL 提供清晰的错误提示和加载状态反馈。

#### Scenario: 数据加载状态
- **WHEN** 从 Supabase 加载数据时
- **THEN** 显示加载指示器（spinner）
- **AND** 禁用操作按钮

#### Scenario: 数据加载失败
- **WHEN** Supabase 查询失败
- **THEN** 显示错误信息和重试按钮
- **AND** 提示用户检查网络连接

#### Scenario: 操作反馈
- **WHEN** 执行添加/编辑/删除操作
- **THEN** 在按钮上显示加载状态
- **AND** 操作完成后显示成功或失败的 toast 提示
