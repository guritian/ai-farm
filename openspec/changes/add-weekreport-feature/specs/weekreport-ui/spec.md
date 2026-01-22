# Weekreport UI Spec

## Overview

AI 周报前端界面规范，定义用户浏览周报的交互体验。

---

## ADDED Requirements

### Requirement: Weekreport Tab Navigation
The weekreport feature MUST be integrated into the main page via Tab navigation.

#### Scenario: 导航 Tab 显示
- **Given** 用户访问 index.html
- **When** 页面加载完成
- **Then** 导航栏显示"AI 周报"Tab 按钮

#### Scenario: Tab 切换到周报
- **Given** 用户在 AI 工具或其他 Tab
- **When** 点击"AI 周报"Tab
- **Then** URL 变为 `index.html#weekreport`
- **And** 显示周报内容区域
- **And** 加载周报列表

#### Scenario: 直接访问周报
- **Given** 用户直接访问 `index.html#weekreport`
- **When** 页面加载完成
- **Then** 自动激活周报 Tab 并加载内容

---

### Requirement: Weekreport List Display
The weekreport list MUST display all published reports in reverse chronological order.

#### Scenario: 列表加载显示
- **Given** 用户进入周报 Tab
- **When** 数据库中存在周报
- **Then** 显示周报卡片列表
- **And** 每个卡片包含：标题、发布日期
- **And** 按发布时间倒序排列

#### Scenario: 空列表状态
- **Given** 用户进入周报 Tab
- **When** 数据库中没有周报
- **Then** 显示"暂无周报"提示

#### Scenario: 加载状态
- **Given** 用户进入周报 Tab
- **When** 正在加载数据
- **Then** 显示加载指示器

---

### Requirement: Weekreport Detail View
Clicking a report card MUST show the detail view with video playback and Markdown content.

#### Scenario: 进入详情页
- **Given** 用户在周报列表
- **When** 点击某个周报卡片
- **Then** 显示该周报的详情视图
- **And** 列表视图隐藏

#### Scenario: 视频播放器显示
- **Given** 用户在周报详情页
- **When** 周报包含视频链接
- **Then** 显示 16:9 响应式视频播放器
- **And** 视频通过 iframe 嵌入
- **And** 支持全屏播放

#### Scenario: Markdown 内容渲染
- **Given** 用户在周报详情页
- **When** 周报包含 Markdown 内容
- **Then** 使用 marked.js 渲染为 HTML
- **And** 应用统一的文章样式

#### Scenario: 返回列表
- **Given** 用户在周报详情页
- **When** 点击"返回"按钮
- **Then** 返回周报列表视图

---

### Requirement: Responsive Design
The weekreport interface MUST adapt to different device sizes.

#### Scenario: 桌面端布局
- **Given** 用户使用桌面浏览器（宽度 >= 1024px）
- **When** 查看周报页面
- **Then** 周报卡片多列展示
- **And** 视频播放器占据合适宽度

#### Scenario: 移动端布局
- **Given** 用户使用移动设备（宽度 < 768px）
- **When** 查看周报页面
- **Then** 周报卡片单列展示
- **And** 视频播放器全宽显示

---

## Related Capabilities
- `weekreport-data` - 数据来源
- `frontend-static` - 集成到主页面
- `tutorial-ui` - 复用 Markdown 渲染样式
