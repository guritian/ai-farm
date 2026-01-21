# Tasks: 添加教程分享功能

## 设计与规划
- [x] 创建 proposal.md
- [x] 创建 tutorial-ui 和 tutorial-data 规范文件
- [x] 通过 openspec validate 验证

## 数据库设计
- [x] 创建 tutorials 表 SQL schema
- [x] 定义字段和索引
- [x] 配置 RLS 策略
- [ ] 在 Supabase 中执行 SQL

## Tab 导航系统
- [x] 在 `index.html` 添加 Tab 导航 HTML 结构
- [x] 实现 Tab 样式（active 状态、hover 效果）
- [x] 实现 Tab 切换 JavaScript 逻辑
- [x] 测试 Tab 切换功能

## 教程列表页
- [x] 创建教程列表 HTML 结构（复用工具列表样式）
- [x] 实现教程卡片组件（标题、作者、封面图）
- [x] 从 Supabase 加载教程数据
- [x] 实现教程搜索功能
- [ ] 测试教程列表展示

## 教程详情页
- [x] 设计详情页 URL 路由方案（hash）
- [x] 创建详情页 HTML 结构
- [x] 集成 marked.js Markdown 渲染库
- [x] 实现详情页内容加载
- [x] 添加返回按钮
- [ ] 测试 Markdown 渲染效果

## 样式设计
- [x] 设计 Tab 导航样式
- [x] 设计教程卡片样式
- [x] 设计详情页 Markdown 内容样式
- [x] 确保响应式布局（移动端、平板、桌面）

## 管理后台扩展
- [ ] 在 `admin.html` 添加教程管理 Tab
- [ ] 实现教程列表展示
- [ ] 实现添加教程表单（含 Markdown 编辑器）
- [ ] 实现编辑教程功能
- [ ] 实现删除教程功能
- [ ] 可选：集成简单的 Markdown 编辑器预览

## 验证与测试
- [x] 测试 Tab 切换不同内容
- [x] 测试教程列表加载
- [x] 测试教程详情页 Markdown 渲染
- [x] 测试搜索和筛选功能
- [x] 测试响应式布局
- [x] 测试浏览器兼容性
- [x] 创建 walkthrough.md 文档

## 文档更新
- [x] 创建功能演示文档
