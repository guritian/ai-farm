# 添加 AI 周报功能

## Why

AI Farm 目前缺少定期更新的内容板块。AI 周报功能可以让管理员定期分享 AI 领域的最新动态、工具推荐和使用心得，通过视频+文字的形式提供更丰富的内容体验，增强用户粘性和平台价值。

### 关键问题
1. **内容更新不足**: 网站缺少定期更新的动态内容
2. **视频内容支持**: 需要支持嵌入外部视频链接（YouTube、Bilibili 等）
3. **图文结合**: 视频配合 Markdown 文档，提供完整的周报内容
4. **统一导航**: 需要集成到现有 Tab 导航系统 (`#weekreport`)

## What Changes

### 新增能力
1. **weekreport-ui** - 周报展示前端界面
   - 集成到 `index.html#weekreport` Tab
   - 周报列表页（按时间倒序展示）
   - 周报详情页（视频播放 + Markdown 内容渲染）
   - 响应式设计

2. **weekreport-data** - 周报数据管理
   - Supabase 新增 `weekreports` 表
   - 字段：id, title, video_url, content_md, published_at 等
   - 管理后台支持周报 CRUD

3. **weekreport-admin** - 周报管理后台
   - 在 admin.html 添加周报管理 Tab
   - 支持添加、编辑、删除周报
   - 视频链接预览验证

### 修改现有能力
- **frontend-static** - 添加周报 Tab 到导航系统
- **database-integration** - 创建 weekreports 表

### 实现范围
- ✅ Tab 导航集成 (`#weekreport`)
- ✅ 周报列表和详情页
- ✅ 外部视频嵌入播放（iframe）
- ✅ Markdown 内容渲染（复用 marked.js）
- ✅ 管理后台周报管理
- ❌ 视频文件上传（不支持）
- ❌ 评论功能（后期）

## Impact

### 能力影响
- **weekreport-ui** (新增) - 提供周报浏览和详情展示
- **weekreport-data** (新增) - 提供周报数据存储
- **weekreport-admin** (新增) - 提供周报管理功能
- **frontend-static** (修改) - 增加周报 Tab

### 代码影响
- 新增文件：
  - `scripts/weekreport.js` - 周报前端逻辑
  - `styles/weekreport.css` - 周报样式
  - `scripts/admin-weekreport.js` - 管理后台逻辑
  - `docs/supabase-weekreport-migration.sql` - 数据库迁移脚本
- 修改文件：
  - `index.html` - 添加周报 Tab 和内容区域
  - `admin.html` - 添加周报管理 Tab 和界面

### 用户影响
- **正面**:
  - 用户可以浏览 AI 周报视频和文档
  - 视频直接在页面内播放，体验流畅
  - 统一的导航体验

---

## Detailed Design Considerations

### 视频嵌入策略

**支持平台**:
- YouTube（使用 youtube.com/embed/ 格式）
- Bilibili（使用 player.bilibili.com 格式）
- 其他支持 iframe 嵌入的平台

**嵌入实现**:
```html
<iframe 
  src="[video_url]" 
  allowfullscreen 
  frameborder="0"
  class="weekreport-video">
</iframe>
```

**安全考虑**:
- 仅允许 HTTPS 链接
- 使用 sandbox 属性限制权限
- 前端验证 URL 格式

### 数据库表设计

```sql
CREATE TABLE weekreports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  content_md TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### UI 设计

**列表页**:
- 卡片式展示：标题 + 发布日期
- 按发布时间倒序排列
- 简洁的周报卡片

**详情页**:
- 顶部：视频播放器（16:9 比例）
- 下方：Markdown 内容渲染
- 返回列表按钮

---

## Success Criteria

1. **功能完整性**:
   - 周报列表正确展示
   - 视频可在页面内播放
   - Markdown 内容正确渲染
   - 管理后台可添加/编辑/删除周报

2. **UI/UX 质量**:
   - 视频播放器响应式适配
   - 移动端友好
   - 与现有页面风格一致

3. **性能**:
   - 页面加载 < 2s
   - 视频加载不阻塞页面

---

## Timeline Estimate

- **数据库设计**: 0.5 小时
- **前端开发**: 2 小时
- **管理后台**: 1 小时
- **测试验证**: 0.5 小时
- **总计**: ~4 小时

---

## ✅ Decisions Confirmed

1. **视频来源**: 仅支持外部嵌入链接（YouTube、Bilibili 等）
2. **发布频率**: 不定期发布，灵活格式
3. **列表展示**: 按时间倒序列表，点击进入详情页
4. **数据管理**: 通过 admin.html 管理后台管理
5. **内容字段**: 标题、日期（后续按需添加）
