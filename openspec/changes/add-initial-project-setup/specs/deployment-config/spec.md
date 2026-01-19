## ADDED Requirements

### Requirement: Netlify 配置文件
项目 SHALL 提供 netlify.toml 配置文件，定义部署规则和构建设置。

#### Scenario: 基础配置
- **WHEN** 查看 netlify.toml
- **THEN** 包含以下配置：
  - build.publish = "." （根目录即为发布目录）
  - build.functions = "netlify/functions" （Functions 目录）
  - 重定向规则（如果需要）

#### Scenario: Python 运行时配置
- **WHEN** Netlify 部署 Python Functions
- **THEN** 自动检测 requirements.txt
- **AND** 使用 Python 3.9+ 运行时

#### Scenario: 环境变量配置
- **WHEN** 部署到 Netlify
- **THEN** 在 Netlify 控制台配置环境变量
- **AND** Functions 可以通过 os.environ 访问

### Requirement: Git 忽略配置
项目 SHALL 提供 .gitignore 文件，防止敏感文件提交到版本控制。

#### Scenario: 敏感文件保护
- **WHEN** 查看 .gitignore
- **THEN** 包含以下规则：
  - .env（本地环境变量）
  - __pycache__/（Python 缓存）
  - *.pyc（Python 编译文件）
  - node_modules/（如果使用 npm）
  - .netlify/（本地 Netlify 缓存）

#### Scenario: 防止意外提交
- **WHEN** 开发者创建 .env 文件
- **THEN** Git 自动忽略该文件
- **AND** 不会被推送到远程仓库

### Requirement: 部署指南文档
项目 SHALL 提供详细的 Netlify 部署指南。

#### Scenario: 手动部署步骤
- **WHEN** 查看 docs/deployment-guide.md
- **THEN** 包含以下步骤：
  1. 创建 Netlify 账号
  2. 连接 Git 仓库或手动上传
  3. 配置环境变量
  4. 触发首次部署
  5. 验证部署结果

#### Scenario: Git 自动部署
- **WHEN** 推送代码到 Git 仓库
- **THEN** Netlify 自动触发部署
- **AND** 部署完成后发送通知

#### Scenario: 本地测试部署
- **WHEN** 使用 netlify dev 本地测试
- **THEN** 模拟 Netlify 生产环境
- **AND** 可以访问 Functions 和环境变量

### Requirement: 单文件夹部署支持
项目结构 SHALL 确保所有文件在单个文件夹内，支持打包上传。

#### Scenario: 文件夹结构验证
- **WHEN** 查看项目根目录
- **THEN** 所有必要的文件都在根目录或子目录中
- **AND** 没有依赖根目录外的文件

#### Scenario: 手动上传部署
- **WHEN** 将整个项目文件夹压缩上传到 Netlify
- **THEN** 成功部署，网站正常运行
- **AND** Functions 正常工作

### Requirement: 项目说明文档
项目 SHALL 提供 README.md 文档，说明项目结构和使用方法。

#### Scenario: README 内容
- **WHEN** 查看 README.md
- **THEN** 包含以下部分：
  - 项目简介
  - 技术栈
  - 目录结构
  - 本地开发指南
  - 部署指南
  - 环境变量配置

#### Scenario: 快速开始
- **WHEN** 新开发者克隆项目
- **THEN** 按照 README 的"快速开始"部分即可运行项目
- **AND** 不超过 5 个步骤
