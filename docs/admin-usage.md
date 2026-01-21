# AI Farm 管理后台使用说明

## 简介

AI Farm 管理后台是一个**本地工具**，用于管理 AI 工具数据库。它提供了友好的 Web 界面，让您无需直接操作数据库即可进行工具的增删改查。

## 重要说明

⚠️ **本管理后台仅在本地运行，不会部署到生产环境。**

- 访问地址：`http://localhost:8000/admin.html`
- 需要配置 Supabase Service Key
- 仅供开发者本地使用

## 快速开始

### 1. 配置 Supabase Service Key

1. 打开 `scripts/admin.js` 文件
2. 找到配置区域（文件顶部）
3. 将 `YOUR_SERVICE_KEY_HERE` 替换为您的 Supabase Service Key

```javascript
const SUPABASE_CONFIG = {
    url: 'https://lczgabazrjlkhmthlvhi.supabase.co',
    // 替换为您的 Service Key
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

**如何获取 Service Key：**
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 Settings > API
4. 复制 `service_role` key（⚠️ 不是 `anon` key）

### 2. 启动本地服务器

```bash
cd /path/to/ai-farm
python3 -m http.server 8000
```

### 3. 访问管理后台

在浏览器中打开：`http://localhost:8000/admin.html`

## 功能说明

### 工具列表

- 以表格形式展示所有 AI 工具
- 显示名称、描述、标签、定价、是否推荐、创建时间等信息
- 每行有"编辑"和"删除"按钮

### 添加工具

1. 点击右上角"添加工具"按钮
2. 填写表单：
   - **必填项**：工具名称、官网 URL、工具描述
   - **可选项**：图片 URL、定价信息、标签、主要功能、是否推荐
3. 点击"保存"

**字段说明：**
- **标签**：多个标签用逗号分隔，如 `AI助手, 文本生成, 热门`
- **主要功能**：每行一个功能
- **是否推荐**：勾选后在前台会显示"推荐"标识

### 编辑工具

1. 点击工具行的"编辑"按钮
2. 修改表单内容
3. 点击"保存"

### 删除工具

1. 点击工具行的"删除"按钮
2. 在确认对话框中再次确认
3. 工具将从数据库中永久删除（⚠️ 不可撤销）

### 搜索和筛选

- 使用搜索框快速查找工具（支持名称和描述搜索）
- 点击"清除筛选"恢复显示所有工具

## 技术架构

### 数据流

```
本地浏览器 (admin.html)
      ↓
Supabase Client SDK (Service Key)
      ↓
Supabase Database (完全权限，绕过 RLS)
```

### 权限说明

管理后台使用 **Supabase Service Key**，拥有数据库的完全访问权限，可以：
- 创建（INSERT）新工具
- 更新（UPDATE）现有工具
- 删除（DELETE）工具
- 绕过所有 Row Level Security (RLS) 策略

## 安全须知

1. **Service Key 保护**
   - Service Key 拥有完全权限，请妥善保管
   - 不要提交包含真实 Service Key 的代码到 Git
   - 建议在 `.gitignore` 中添加配置

2. **本地访问限制**
   - 管理后台仅在 localhost 访问
   - 不会部署到 Netlify 或其他公网环境
   - 只有本地开发者可以访问

3. **推荐做法**
   - 创建独立的配置文件（如 `admin.config.js`）存储 Service Key
   - 将配置文件添加到 `.gitignore`
   - 在 README 中说明配置步骤

## 常见问题

### Q1: 显示"未配置"警告？
**A**: 请在 `scripts/admin.js` 中配置您的 Supabase Service Key。

### Q2: 连接失败？
**A**: 检查：
1. Service Key 是否正确
2. Supabase URL 是否正确
3. 网络连接是否正常
4. Supabase 项目是否暂停

### Q3: 操作失败？
**A**: 
1. 检查浏览器控制台（F12）查看错误信息
2. 确认 Service Key 有正确的权限
3. 检查 Supabase 数据库表结构是否正确

### Q4: 如何防止误删除？
**A**: 
1. 删除前会有确认对话框
2. 建议定期备份 Supabase 数据库
3. 可以在 Supabase Dashboard 中查看操作日志

## 下一步优化

未来可以考虑的功能增强：
- [ ] 支持批量操作（批量删除、批量设置推荐）
- [ ] 支持图片上传（集成 Cloudinary 或 Supabase Storage）
- [ ] 导出/导入功能（CSV、JSON）
- [ ] 操作日志记录
- [ ] 数据验证增强（URL 可用性检查等）
- [ ] 标签自动补全

## 支持

如有问题或建议，请在 GitHub 项目中提 Issue。
