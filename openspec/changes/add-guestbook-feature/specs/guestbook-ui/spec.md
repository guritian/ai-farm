# guestbook-ui Specification

## Purpose
提供留言板前台界面,支持用户查看留言、提交留言、点赞等交互功能。

## ADDED Requirements

### Requirement: 留言板页面布局
系统 SHALL 创建独立的 guestbook.html 页面展示留言板功能。

#### Scenario: 页面首次加载
- **WHEN** 用户访问 guestbook.html
- **THEN** 显示页面标题和功能说明
- **AND** 显示留言提交表单
- **AND** 显示已审核留言列表(最新优先,默认第一页 10 条)
- **AND** 显示分页导航
- **AND** 在数据加载时显示加载动画

#### Scenario: 空状态展示
- **WHEN** 数据库中没有已审核留言
- **THEN** 显示友好的空状态提示
- **AND** 提示文字: "还没有留言,快来成为第一个吧!"
- **AND** 强调留言表单的入口

---

### Requirement: 留言提交表单
系统 SHALL 提供直观的表单供用户提交留言。

#### Scenario: 表单字段
- **WHEN** 用户查看表单
- **THEN** 包含以下字段:
  - 姓名输入框(必填,maxlength=100)
  - 留言内容文本域(必填,maxlength=2000,rows=4)
  - 提交按钮

#### Scenario: 客户端验证
- **WHEN** 用户点击提交但姓名为空
- **THEN** 显示错误提示"请输入姓名"
- **AND** 阻止表单提交
- **WHEN** 留言内容少于 10 个字符
- **THEN** 显示"留言至少需要 10 个字符"

#### Scenario: 成功提交留言
- **WHEN** 用户填写有效数据并提交
- **THEN** 显示加载状态(禁用提交按钮)
- **AND** 调用 Supabase INSERT 操作
- **AND** 成功后显示提示"留言已提交,审核后将显示"
- **AND** 清空表单内容
- **AND** 恢复提交按钮状态

#### Scenario: 字符计数器
- **WHEN** 用户在内容文本域输入
- **THEN** 实时显示字符计数"X / 2000"
- **AND** 接近上限时(>1900)变为警告色

---

### Requirement: 留言列表展示
系统 SHALL 以卡片形式展示已审核的留言。

#### Scenario: 留言卡片内容
- **WHEN** 渲染留言列表
- **THEN** 每条留言显示:
  - 作者姓名
  - 留言内容
  - 相对时间("2小时前")
  - 点赞按钮和点赞数
  - 置顶标记(如果 is_featured = true)

#### Scenario: 卡片样式
- **WHEN** 用户查看留言卡片
- **THEN** 使用玻璃拟态效果(glass-morphism)
- **AND** 卡片间距 16px
- **AND** 悬浮时有微妙的阴影增强效果
- **AND** 响应式布局:
  - 移动端: 1列
  - 平板: 2列
  - 桌面: 2-3列

#### Scenario: 只显示已审核留言
- **WHEN** 查询留言数据
- **THEN** WHERE 条件包含 `is_approved = true`
- **AND** 未审核留言不会被前端加载

---

### Requirement: 点赞交互
系统 SHALL 允许用户为留言点赞,并防止重复点赞。

#### Scenario: 首次点赞
- **WHEN** 用户点击未点赞的留言的爱心图标
- **THEN** 爱心图标播放动画(scale + 颜色变化)
- **AND** 点赞数 +1 (乐观更新 UI)
- **AND** 调用 Supabase UPDATE 增加 likes_count
- **AND** 将留言 ID 保存到 LocalStorage
- **AND** 爱心图标变为填充/禁用状态

#### Scenario: 防止重复点赞
- **WHEN** 页面加载时
- **THEN** 从 LocalStorage 读取已点赞的留言 ID 列表
- **AND** 对应留言的爱心图标显示为已点赞状态
- **WHEN** 用户点击已点赞的留言
- **THEN** 不触发任何操作
- **AND** 可选显示 tooltip "您已经点赞过了"

#### Scenario: 点赞动画
- **WHEN** 点赞成功
- **THEN** 爱心图标执行动画:
  - 持续时间: 200-300ms
  - 效果: scale(1.2) + 颜色变化
  - 缓动: cubic-bezier(0.34, 1.56, 0.64, 1)

---

### Requirement: 排序和筛选
系统 SHALL 提供排序选项帮助用户浏览留言。

#### Scenario: 默认排序(最新)
- **WHEN** 页面初次加载
- **THEN** 留言按 created_at DESC 排序
- **AND** "最新"按钮显示激活状态

#### Scenario: 切换到最热排序
- **WHEN** 用户点击"最热"按钮
- **THEN** 留言重新排序为 likes_count DESC
- **AND** "最热"按钮显示激活状态
- **AND** 排序切换动画流畅(无闪烁)

#### Scenario: 排序状态持久化
- **WHEN** 用户选择排序方式后刷新页面
- **THEN** 保持用户选择的排序方式
- **OR** 默认回到"最新"排序

---

### Requirement: 分页功能
系统 SHALL 使用分页方式加载留言,默认每页 10 条。

#### Scenario: 默认分页
- **WHEN** 页面首次加载
- **THEN** 显示第一页 10 条留言
- **AND** 显示分页导航(页码、上一页、下一页)
- **AND** 当前页高亮显示

#### Scenario: 翻页操作
- **WHEN** 用户点击页码或下一页
- **THEN** 加载对应页的留言
- **AND** 滚动到留言列表顶部
- **AND** 更新 URL 参数(可选,便于分享)

---

### Requirement: 响应式设计
系统 SHALL 确保留言板在所有设备上良好显示。

#### Scenario: 移动端适配(< 768px)
- **WHEN** 在移动设备访问
- **THEN** 留言卡片单列布局
- **AND** 表单输入框100%宽度
- **AND** 字体大小至少 16px (防止自动缩放)

#### Scenario: 平板适配(768px - 1024px)
- **WHEN** 在平板设备访问
- **THEN** 留言卡片2列网格布局

#### Scenario: 桌面适配(> 1024px)
- **WHEN** 在桌面浏览器访问
- **THEN** 留言卡片2-3列网格布局
- **AND** 最大宽度 1200px 居中
