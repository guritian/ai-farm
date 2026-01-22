# Weekreport Admin Spec

## Overview

AI 周报管理后台规范，定义管理员如何创建、编辑和删除周报。

---

## ADDED Requirements

### Requirement: Admin Tab Integration
Weekreport management MUST be integrated into the existing admin Tab system.

#### Scenario: 管理 Tab 显示
- **Given** 管理员访问 admin.html
- **When** 页面加载完成
- **Then** 导航栏显示"周报管理"Tab

#### Scenario: 切换到周报管理
- **Given** 管理员在管理后台
- **When** 点击"周报管理"Tab
- **Then** 显示周报管理界面
- **And** 加载周报列表

---

### Requirement: Weekreport List Management
The admin backend MUST display all weekreports with operation options.

#### Scenario: 周报列表显示
- **Given** 管理员在周报管理 Tab
- **When** 数据加载完成
- **Then** 显示周报表格：标题、发布日期、操作
- **And** 按发布时间倒序排列

#### Scenario: 编辑操作
- **Given** 管理员查看周报列表
- **When** 点击某条周报的"编辑"按钮
- **Then** 打开编辑表单
- **And** 预填充现有数据

#### Scenario: 删除操作
- **Given** 管理员查看周报列表
- **When** 点击某条周报的"删除"按钮
- **Then** 显示确认对话框
- **And** 确认后执行删除
- **And** 刷新列表

---

### Requirement: Weekreport Form
The system MUST provide a form for creating and editing weekreports.

#### Scenario: 添加新周报
- **Given** 管理员在周报管理界面
- **When** 点击"添加周报"按钮
- **Then** 显示空白表单
- **And** 表单包含：标题、视频链接、Markdown 内容

#### Scenario: 表单验证 - 必填字段
- **Given** 管理员填写周报表单
- **When** 标题或视频链接为空
- **Then** 显示错误提示
- **And** 阻止提交

#### Scenario: 视频链接验证
- **Given** 管理员填写视频链接
- **When** 链接格式不正确
- **Then** 显示"请输入有效的视频嵌入链接"提示

#### Scenario: 提交成功
- **Given** 管理员填写完整表单
- **When** 点击提交
- **Then** 保存到数据库
- **And** 显示成功提示
- **And** 刷新周报列表

---

### Requirement: Video Preview
The admin backend MUST provide video link preview functionality.

#### Scenario: 预览视频
- **Given** 管理员输入视频链接
- **When** 链接格式有效
- **Then** 可选择预览视频效果
- **And** 确认链接正确

---

## Related Capabilities
- `weekreport-data` - 数据操作
- `guestbook-admin` - 复用管理后台模式
