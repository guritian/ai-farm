-- AI Farm - 教程表创建脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 创建 tutorials 表
CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  author_avatar TEXT,
  cover_image TEXT NOT NULL,
  summary TEXT,
  content_md TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 创建更新时间触发器
CREATE TRIGGER update_tutorials_updated_at 
BEFORE UPDATE ON tutorials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用 Row Level Security
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有人可以读取
CREATE POLICY "public_read_tutorials"
ON tutorials FOR SELECT
TO public
USING (true);

-- RLS 策略：Service Key 可以写入（管理后台使用）
-- Service Key 会自动绕过 RLS，无需额外策略

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_tutorials_tags ON tutorials USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tutorials_created_at ON tutorials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorials_is_featured ON tutorials(is_featured);

-- 插入示例教程数据

INSERT INTO tutorials (title, author, cover_image, summary, content_md, tags, is_featured) VALUES
('ChatGPT 快速入门指南', 'JDY', 'https://via.placeholder.com/800x400?text=ChatGPT+Tutorial', 
 '从零开始学习如何使用 ChatGPT，掌握提示词技巧，提升工作效率。',
 '# ChatGPT 快速入门指南

## 什么是 ChatGPT？

ChatGPT 是 OpenAI 开发的一款强大的 AI 对话助手，能够理解自然语言并生成高质量的回复。

## 基础使用

### 1. 注册账号

访问 [chat.openai.com](https://chat.openai.com) 注册账号。

### 2. 开始对话

在输入框中输入您的问题或需求，ChatGPT 会立即回复。

### 3. 提示词技巧

**明确具体**：
- ❌ "写一篇文章"
- ✅ "写一篇关于人工智能在教育领域应用的 500 字文章"

**提供上下文**：
```
我是一名前端开发者，需要学习 React。
请为我制定一个为期 4 周的学习计划。
```

### 4. 高级用法

- **角色扮演**: "你是一名资深营销专家..."
- **逐步推理**: "让我们一步步思考这个问题..."
- **格式化输出**: "以 Markdown 表格形式输出..."

## 常见问题

### Q: ChatGPT 免费吗？
A: 有免费版本，Plus 版本为 $20/月。

### Q: 支持中文吗？
A: 完全支持中文对话。

## 总结

掌握好提示词技巧，ChatGPT 将成为您的高效助手！',
 ARRAY['ChatGPT', 'AI助手', '入门教程'], true),

('Midjourney AI 绘画完全指南', '张晓明', 'https://via.placeholder.com/800x400?text=Midjourney+Guide',
 '全面讲解 Midjourney AI 绘画工具的使用方法，从基础到进阶。',
 '# Midjourney AI 绘画完全指南

## 简介

Midjourney 是目前最流行的 AI 绘画工具之一，以其出色的艺术性和图像质量著称。

## 快速开始

### 1. 加入 Discord

Midjourney 运行在 Discord 平台上，首先需要：
1. 注册 Discord 账号
2. 加入 Midjourney 官方服务器
3. 订阅 Midjourney（$10-60/月）

### 2. 基础命令

使用 `/imagine` 命令生成图像：

```
/imagine prompt: a beautiful sunset over mountains, hyperrealistic
```

### 3. 提示词结构

**基本格式**：
```
[主体] + [风格] + [参数]
```

**示例**：
```
a futuristic city, cyberpunk style, neon lights, 8k --ar 16:9 --v 6
```

## 常用参数

| 参数 | 说明 | 示例 |
|------|------|------|
| --ar | 宽高比 | --ar 16:9 |
| --v | 版本 | --v 6 |
| --q | 质量 | --q 2 |
| --stylize | 风格化程度 | --s 750 |

## 进阶技巧

### 图生图

上传图片 + /imagine prompt 可以基于图片创作。

### 垫图（Image Prompt）

```
/imagine https://example.com/image.jpg a painting in Van Gogh style --iw 2
```

## 最佳实践

1. **详细描述**：越具体越好
2. **参考艺术家风格**："in the style of Studio Ghibli"
3. **善用负面提示词**："--no text, watermark"

## 总结

Midjourney 的关键在于不断实验和优化提示词！',
 ARRAY['Midjourney', 'AI绘画', '图像生成', '进阶教程'], true),

('GitHub Copilot 编程助手使用技巧', '李开发', 'https://via.placeholder.com/800x400?text=Copilot+Tips',
 '提升编程效率的 GitHub Copilot 使用技巧和最佳实践。',
 '# GitHub Copilot 编程助手使用技巧

## 什么是 GitHub Copilot？

GitHub Copilot 是一款 AI 代码补全工具，基于 OpenAI Codex，能够理解注释并生成代码。

## 安装配置

### VS Code 安装

1. 打开 VS Code 扩展市场
2. 搜索 "GitHub Copilot"
3. 点击安装并登录 GitHub 账号

### 订阅

- 个人用户：$10/月
- 学生教师：免费
- 企业用户：$19/月/人

## 基础使用

### 1. 自动补全

只需开始输入代码，Copilot 会自动给出建议：

```javascript
// 按 Tab 接受建议
function calculateSum(arr) {
  // Copilot 会自动补全实现
}
```

### 2. 注释驱动开发

写注释，Copilot 生成代码：

```python
# 创建一个函数，接收两个日期，返回之间的天数
def days_between(date1, date2):
    # Copilot 会生成实现
```

### 3. 多个建议

- `Alt + ]`: 下一个建议
- `Alt + [`: 上一个建议
- `Ctrl + Enter`: 打开建议面板

## 高级技巧

### 1. 测试用例生成

```javascript
function isPrime(n) {
  // 实现代码...
}

// 为 isPrime 函数编写测试用例
describe("isPrime", () => {
  // Copilot 会生成测试
});
```

### 2. 重构代码

在函数前添加注释说明意图：

```python
# 重构以下代码，使用列表推导式
result = []
for i in range(10):
    if i % 2 == 0:
        result.append(i * 2)
```

### 3. 多语言支持

Copilot 支持 40+ 编程语言，包括 Python、JavaScript、Go、Rust 等。

## 最佳实践

1. ✅ **写清晰的注释**
2. ✅ **使用描述性的函数名**
3. ✅ **审查生成的代码**
4. ❌ **不要盲目信任所有建议**

## 总结

GitHub Copilot 是提升编程效率的利器，但最终决策权在你手中！',
 ARRAY['GitHub Copilot', '编程', '代码', '开发工具'], false);

-- 查询验证
SELECT title, author, array_length(tags, 1) as tag_count, is_featured
FROM tutorials 
ORDER BY created_at DESC;
