# Tasks: 添加后台内容管理页面

## 设计与规划
- [x] 创建 proposal.md 和 tasks.md
- [x] 创建 admin-ui 和 admin-api 规范文件
- [x] 通过 openspec validate 验证
- [x] 用户确认简化为本地工具方案

## Admin UI 前端实现
- [x] 创建 `admin.html` 管理页面骨架
- [x] 实现工具列表展示（表格形式）
- [x] 实现添加工具表单
- [x] 实现编辑工具表单（复用添加表单逻辑）
- [x] 实现删除确认对话框
- [x] 添加搜索和筛选功能
- [x] 创建 `styles/admin.css` 样式表
- [x] 实现响应式布局（支持桌面和平板）

## Admin API 后端实现  
- [x] 使用 Supabase Client SDK 直接操作
- [x] 实现 Service Key 配置机制
- [x] 测试 INSERT 操作（创建）
- [x] 测试 UPDATE 操作（更新）
- [x] 测试 DELETE 操作（删除）

## 数据库配置
- [x] 确认 Supabase RLS 策略支持 Service Key 操作

## 验证与测试
- [x] 测试页面加载和界面展示
- [x] 测试配置警告正常显示
- [x] 测试响应式布局
- [x] 测试 UI 设计和用户体验
- [x] 创建使用文档

## 文档更新
- [x] 创建 docs/admin-usage.md 使用说明
