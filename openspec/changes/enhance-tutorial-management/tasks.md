# 增强教程管理功能 - 任务清单

## 规划阶段
- [x] 创建 proposal.md
- [ ] 创建 tasks.md
- [ ] 创建 specs (tutorial-admin, tutorial-data 修改, tutorial-ui 修改)
- [ ] 验证 OpenSpec 规范正确性
- [ ] 请求用户审核提案

## 数据库设计
- [x] 设计 tutorials 表扩展方案
- [x] 编写数据库迁移 SQL
- [x] 添加约束和索引
- [ ] 在 Supabase 中测试迁移

## 后台管理界面
- [x] 在 admin.html 添加教程管理 Tab
- [x] 创建教程列表表格组件
- [x] 实现添加教程表单
  - [x] 基础信息输入（标题、作者、标签）
  - [x] 内容类型选择器（Markdown/URL/Video）
  - [x] 条件输入区域
    - [x] Markdown 编辑器（type=markdown）
    - [x] URL 输入框（type=url|video）
  - [x] 关联工具下拉选择
  - [x] 封面图上传/URL 输入
- [x] 实现编辑教程功能
  - [x] 加载现有数据
  - [x] 类型切换时表单联动
  - [x] 更新保存逻辑
- [x] 实现删除教程功能
  - [x] 删除确认对话框
  - [x] 调用 Supabase DELETE
- [x] 添加搜索和筛选
  - [x] 标题搜索
  - [ ] 类型筛选（全部/Markdown/URL/Video）

## 前台展示优化
- [x] 修改 tutorials.js 适配新字段
- [x] 实现分类型渲染
  - [x] Markdown 类型：原有逻辑
  - [x] URL 类型：显示"访问链接"按钮
  - [x] Video 类型：显示视频图标和跳转
- [x] 教程卡片显示关联工具
- [x] 详情页根据类型渲染
  - [x] Markdown：渲染内容
  - [x] URL/Video：显示跳转提示和按钮

## 验证与测试
- [ ] 测试数据库迁移（现有数据正常）
- [ ] 测试管理后台 CRUD
  - [ ] 添加 Markdown 教程
  - [ ] 添加 URL 教程
  - [ ] 添加 Video 教程
  - [ ] 编辑教程切换类型
  - [ ] 删除教程
- [ ] 测试前台显示
  - [ ] Markdown 教程渲染
  - [ ] URL 教程跳转
  - [ ] Video 教程跳转
  - [ ] 关联工具显示
- [ ] 测试响应式布局
- [ ] 测试表单验证（URL 格式）

## 文档更新
- [ ] 更新 README.md 说明新功能
- [ ] 更新 admin-usage.md 添加教程管理说明
- [ ] 创建数据库迁移文档
- [ ] 创建 walkthrough.md 演示文档
