# guestbook-admin Specification

## Purpose
提供留言板管理界面,支持管理员审核、删除和管理留言。

## MODIFIED Requirements

### Requirement: Admin 导航标签
系统 SHALL 在现有管理后台添加"留言板管理"标签页。

#### Scenario: 标签页集成
- **WHEN** 管理员访问 admin.html
- **THEN** 标签导航包含三个选项:
  - AI 工具管理
  - 教程管理
  - 留言板管理 (新增)

#### Scenario: 切换到留言板管理
- **WHEN** 管理员点击"留言板管理"标签
- **THEN** 隐藏其他标签内容
- **AND** 显示留言板管理区域
- **AND** 标签显示激活状态
- **AND** 自动加载留言数据

---

## ADDED Requirements

### Requirement: 留言列表表格
系统 SHALL 以表格形式展示所有留言(含未审核)。

#### Scenario: 表格列定义
- **WHEN** 留言管理页面加载
- **THEN** 表格包含以下列:
  - 作者姓名
  - 内容摘要(前50字符 + "...")
  - 点赞数
  - 提交时间(格式化)
  - 状态徽章(待审核/已审核)
  - 置顶标记
  - 操作按钮(审核/取消审核、置顶/取消置顶、删除)

#### Scenario: 加载所有留言
- **WHEN** 页面加载
- **THEN** 查询所有留言(不限制 is_approved)
- **AND** 按 created_at DESC 排序
- **AND** 包含已审核和待审核留言

#### Scenario: 状态徽章样式
- **WHEN** 渲染状态列
- **THEN** 待审核显示黄色徽章"待审核"
- **AND** 已审核显示绿色徽章"已审核"
- **AND** 颜色遵循现有管理后台风格

---

### Requirement: 留言审核工作流
系统 SHALL 允许管理员审核或取消审核留言。

#### Scenario: 审核待审核留言
- **WHEN** 管理员点击待审核留言的"审核通过"按钮
- **THEN** 调用 Supabase UPDATE 设置 `is_approved = true`
- **AND** 状态徽章更新为"已审核"(绿色)
- **AND** 按钮文字变为"取消审核"
- **AND** 显示成功提示"留言已审核"
- **AND** 该留言立即在前台可见

#### Scenario: 取消审核已审核留言
- **WHEN** 管理员点击已审核留言的"取消审核"按钮
- **THEN** 调用 Supabase UPDATE 设置 `is_approved = false`
- **AND** 状态徽章更新为"待审核"(黄色)
- **AND** 按钮文字变为"审核通过"
- **AND** 该留言从前台隐藏

#### Scenario: 审核操作可逆
- **WHEN** 管理员误操作审核状态
- **THEN** 可以立即点击相反操作恢复
- **AND** 数据库状态正确更新
- **AND** 无需刷新页面

---

### Requirement: 留言删除
系统 SHALL 允许管理员永久删除不当留言。

#### Scenario: 删除前确认
- **WHEN** 管理员点击"删除"按钮
- **THEN** 弹出确认对话框
- **AND** 对话框显示留言预览(作者 + 内容摘要)
- **AND** 对话框提示"确定要删除这条留言吗?此操作不可恢复。"
- **AND** 包含"取消"和"确定删除"按钮

#### Scenario: 确认删除
- **WHEN** 管理员在确认对话框点击"确定删除"
- **THEN** 调用 Supabase DELETE 操作
- **AND** 从表格中移除该行
- **AND** 显示成功提示"留言已删除"
- **AND** 数据永久删除(非软删除)

#### Scenario: 取消删除
- **WHEN** 管理员点击"取消"或按 ESC 键
- **THEN** 关闭对话框
- **AND** 不执行删除操作
- **AND** 留言保持原状

---

### Requirement: 搜索和筛选
系统 SHALL 提供搜索和筛选功能快速定位留言。

#### Scenario: 按作者或内容搜索
- **WHEN** 管理员在搜索框输入"张三"
- **THEN** 表格过滤显示作者或内容包含"张三"的留言
- **AND** 搜索不区分大小写
- **AND** 搜索实时响应(300ms 防抖)

#### Scenario: 按状态筛选
- **WHEN** 管理员选择状态筛选"待审核"
- **THEN** 表格只显示 `is_approved = false` 的留言
- **WHEN** 选择"已审核"
- **THEN** 表格只显示 `is_approved = true` 的留言
- **WHEN** 选择"全部"
- **THEN** 显示所有留言

#### Scenario: 组合搜索和筛选
- **WHEN** 同时使用搜索和状态筛选
- **THEN** 结果同时满足两个条件
- **AND** 显示匹配数量提示

---

### Requirement: 批量操作
系统 SHALL 支持批量审核或删除留言以提高管理效率。

#### Scenario: 选择多条留言
- **WHEN** 表格每行包含复选框
- **THEN** 管理员可以勾选多条留言
- **AND** 顶部显示已选数量"已选 5 条"

#### Scenario: 批量审核
- **WHEN** 管理员选中多条待审核留言
- **AND** 点击"批量审核"按钮
- **THEN** 所有选中留言的 `is_approved` 更新为 true
- **AND** 显示成功提示"5条留言已审核"
- **AND** 清除选择状态

#### Scenario: 批量删除
- **WHEN** 管理员选中多条留言并点击"批量删除"
- **THEN** 显示确认对话框
- **AND** 提示"确定要删除 5 条留言吗?"
- **AND** 确认后删除所有选中留言
