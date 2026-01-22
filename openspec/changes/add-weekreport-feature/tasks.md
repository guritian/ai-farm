# AI 周报功能 - 任务清单

## 阶段 1: 数据库设计 (0.5h)

### 1.1 创建 weekreports 表
- [x] 创建 `docs/supabase-weekreport-migration.sql`
- [x] 定义表结构：id, title, video_url, content_md, published_at, created_at, updated_at
- [x] 添加 RLS 策略（公开读取，管理员写入）
- [x] 添加索引优化查询
- [ ] 在 Supabase 执行迁移脚本

**验证**: 在 Supabase 控制台确认表创建成功

---

## 阶段 2: 前端 UI 开发 (2h)

### 2.1 样式文件
- [x] 创建 `styles/weekreport.css`
- [x] 周报列表卡片样式
- [x] 视频播放器样式（16:9 响应式）
- [x] 详情页布局样式
- [x] Markdown 内容样式（复用教程样式）

### 2.2 集成到 index.html
- [x] 添加周报 Tab 按钮到导航
- [x] 添加 `#weekreportContent` 内容区域
- [x] 更新 `switchTab()` 函数支持 weekreport
- [x] 引入 weekreport.css 和 weekreport.js

### 2.3 周报列表功能
- [x] 创建 `scripts/weekreport.js`
- [x] 实现 `loadWeekreports()` 加载列表
- [x] 渲染周报卡片（标题 + 日期）
- [x] 点击卡片进入详情

### 2.4 周报详情功能
- [x] 实现 `showWeekreportDetail(id)`
- [x] 视频播放器嵌入（iframe）
- [x] Markdown 内容渲染（使用 marked.js）
- [x] 返回列表按钮

**验证**: 访问 `#weekreport` 显示列表，点击进入详情，视频播放正常

---

## 阶段 3: 管理后台开发 (1h)

### 3.1 admin.html 集成
- [x] 添加"周报管理"Tab 按钮
- [x] 添加周报管理内容区域
- [x] 周报列表表格
- [x] 添加/编辑/删除操作按钮

### 3.2 管理功能实现
- [x] 创建 `scripts/admin-weekreport.js`
- [x] 实现周报列表加载
- [x] 添加周报表单（标题、视频链接、Markdown 内容）
- [x] 编辑周报功能
- [x] 删除周报功能（带确认）
- [x] 视频链接预览验证

**验证**: 管理后台可完成周报的增删改查

---

## 阶段 4: 测试验收 (0.5h)

### 4.1 功能测试
- [ ] 周报列表正确加载
- [ ] YouTube 视频嵌入播放正常
- [ ] Bilibili 视频嵌入播放正常
- [ ] Markdown 内容正确渲染
- [ ] 管理后台 CRUD 正常

### 4.2 兼容性测试
- [ ] 移动端响应式布局
- [ ] 不同浏览器测试
- [ ] 视频播放器适配

**验证**: 所有功能按预期工作

---

## 依赖关系

```
阶段 1 (数据库) ─┬─> 阶段 2 (前端)
                └─> 阶段 3 (管理后台)
                         │
                         v
                    阶段 4 (测试)
```

**可并行**: 阶段 2 和阶段 3 可在阶段 1 完成后并行开发
