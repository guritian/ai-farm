# Tasks: Add Guestbook Feature

## Database (数据库)

- [ ] 设计 `guestbook` 表结构
  - [ ] 定义字段:id, author, content, created_at, likes_count, is_approved, is_featured
  - [ ] 添加索引:created_at, is_approved, likes_count, is_featured
  - [ ] 设置默认值、约束和内容长度限制 (2000字符)
- [ ] 编写数据库迁移脚本 `docs/supabase-guestbook-migration.sql`
- [ ] 创建测试数据(5-10条示例留言)
- [ ] 在 Supabase 中执行迁移并验证

## Frontend - Guestbook Page (前端 - 留言板页面)

- [ ] 创建 `guestbook.html` 页面结构
  - [ ] 添加 Supabase CDN 和依赖
  - [ ] 引入 guestbook 相关样式表
  - [ ] 设置页面 meta 信息
- [ ] 实现留言发布表单
  - [ ] 姓名输入框(必填)
  - [ ] 留言内容输入框(必填,支持多行,最多2000字符)
  - [ ] 表单验证逻辑(最少10字符)
  - [ ] 提交按钮和加载状态
- [ ] 实现留言列表展示
  - [ ] 留言卡片组件
  - [ ] 显示作者、内容、时间、点赞数、置顶标记
  - [ ] 空状态提示
  - [ ] 加载动画
- [ ] 实现排序功能
  - [ ] 最新优先(默认)
  - [ ] 最热优先(按点赞数)
  - [ ] 排序切换按钮
- [ ] 实现分页功能
  - [ ] 默认每页加载 10 条
  - [ ] 分页导航(页码、上一页、下一页)
  - [ ] 当前页高亮状态
  - [ ] 翻页时滚动到列表顶部
- [ ] 实现点赞功能
  - [ ] 点赞按钮和动画
  - [ ] LocalStorage 防重复点赞
  - [ ] 实时更新点赞数
- [ ] 创建 `scripts/guestbook.js` 业务逻辑
  - [ ] loadMessages() - 加载留言列表
  - [ ] submitMessage() - 提交新留言
  - [ ] likeMessage() - 点赞留言
  - [ ] renderMessages() - 渲染留言列表

## Frontend - Styles (前端 - 样式)

- [ ] 创建 `styles/guestbook.css`
  - [ ] 留言表单样式
  - [ ] 留言卡片样式
  - [ ] 点赞按钮动画
  - [ ] 分页导航样式
  - [ ] 置顶标记样式
  - [ ] 响应式布局(移动端适配)
- [ ] ✅ 使用浅蓝色主题 (#0EA5E9)
  - [ ] 确保与现有页面和谐

## Admin Interface (管理后台)

- [ ] 在 `admin.html` 添加留言板管理标签
  - [ ] 新增"留言板管理"标签页
  - [ ] 标签切换逻辑
- [ ] 实现留言列表展示
  - [ ] 表格显示:作者、内容摘要、时间、点赞数、状态
  - [ ] 搜索功能(按作者或内容)
  - [ ] 状态筛选(已审核/待审核)
- [ ] 实现留言审核功能
  - [ ] 审核/取消审核按钮
  - [ ] 批量审核操作
- [ ] 实现留言置顶功能
  - [ ] 置顶/取消置顶按钮
  - [ ] 置顶留言排序在最前
- [ ] 实现留言删除功能
  - [ ] 删除确认对话框
  - [ ] 删除操作和反馈
- [ ] 创建 `scripts/admin-guestbook.js`
  - [ ] loadGuestbookMessages() - 加载所有留言
  - [ ] approveMessage() - 审核留言
  - [ ] deleteMessage() - 删除留言
  - [ ] searchMessages() - 搜索留言

## Navigation Integration (导航集成)

- [ ] 在 `index.html` 主导航添加"留言板"入口
  - [ ] 更新标签导航 HTML
  - [ ] 添加路由逻辑支持 #guestbook
- [ ] 更新标签切换 JavaScript
  - [ ] 支持 guestbook 标签页
  - [ ] URL hash 路由处理

## Documentation (文档)

- [ ] 更新 `README.md`
  - [ ] 添加留言板功能说明
  - [ ] 更新功能列表
- [ ] 更新 `docs/admin-usage.md`
  - [ ] 留言板管理使用说明
  - [ ] 审核流程说明
- [ ] 创建数据库 schema 文档
  - [ ] `docs/supabase-guestbook-schema.sql`

## Testing & Verification (测试验证)

- [ ] 前端功能测试
  - [ ] 留言发布流程
  - [ ] 留言展示和排序
  - [ ] 点赞功能和防重复
  - [ ] 表单验证
- [ ] 管理后台测试
  - [ ] 留言审核流程
  - [ ] 留言删除操作
  - [ ] 搜索和筛选
- [ ] 跨浏览器测试
  - [ ] Chrome/Safari/Firefox
  - [ ] 移动端浏览器
- [ ] 响应式测试
  - [ ] 375px (移动)
  - [ ] 768px (平板)
  - [ ] 1024px+ (桌面)
- [ ] 性能测试
  - [ ] 页面加载时间
  - [ ] 大量留言渲染性能

## Deployment (部署)

- [ ] 在 Supabase 执行数据库迁移
- [ ] 验证 RLS 策略(如果需要)
- [ ] Git 提交所有更改
- [ ] 推送到远程仓库
- [ ] 在 Netlify 验证部署结果
