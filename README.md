# RSS 订阅阅读器 v2.0

一个现代化的RSS订阅阅读器，支持用户登录、多端数据同步和批量导入RSS源。

## ✨ 新功能特性

### 🔐 用户登录系统
- **用户注册/登录**：支持邮箱密码注册和登录
- **游客模式**：无需注册即可使用基本功能
- **多端同步**：登录用户的订阅源和阅读记录在多设备间同步
- **数据安全**：使用Firebase提供安全的用户认证和数据存储

### 📥 批量导入功能
- **OPML导入**：支持从其他RSS阅读器导入OPML格式的订阅源
- **URL列表导入**：支持批量导入RSS链接列表
- **智能解析**：自动识别和验证RSS源的有效性
- **导入预览**：导入前可预览将要添加的RSS源

### 🔄 数据同步
- **实时同步**：订阅源、文章状态实时同步到云端
- **离线支持**：离线时数据保存在本地，联网后自动同步
- **冲突解决**：智能处理多设备间的数据冲突

## 🎯 核心功能

- **RSS源管理**：添加、删除、管理RSS订阅源
- **文章阅读**：优雅的文章列表和详情展示
- **搜索过滤**：实时搜索文章内容
- **阅读状态**：已读/未读状态管理
- **多种排序**：按时间、标题等多种方式排序
- **响应式设计**：完美适配桌面、平板和手机

## 🚀 快速开始

### 在线使用
直接访问部署的网站即可使用，支持：
- 游客模式：无需注册，数据保存在本地
- 注册用户：享受多端同步功能

### 本地部署
1. 下载项目文件
2. 在Web服务器中打开 `index.html`
3. 开始使用RSS阅读器

## 📱 使用指南

### 用户登录
1. **注册新用户**：输入邮箱和密码，点击"注册"
2. **登录现有账户**：输入邮箱和密码，点击"登录"
3. **游客模式**：点击"游客模式"无需注册即可使用

### 添加RSS源
1. **单个添加**：在"添加RSS源"输入框中输入RSS链接，点击"添加"
2. **批量导入**：点击"批量导入"按钮，选择导入方式：
   - 上传OPML文件
   - 粘贴RSS链接列表

### 管理订阅
- **查看文章**：点击订阅源查看文章列表
- **搜索文章**：使用搜索框快速找到感兴趣的文章
- **标记已读**：点击文章的"标为已读"按钮
- **查看详情**：点击"查看详情"阅读完整文章

## 🛠️ 技术特性

### 前端技术
- **纯前端实现**：HTML5 + CSS3 + JavaScript
- **响应式设计**：Bootstrap风格的现代化界面
- **本地存储**：LocalStorage保存用户数据
- **CORS代理**：解决跨域访问RSS源的问题

### 后端服务
- **Firebase认证**：安全的用户登录系统
- **Firestore数据库**：实时数据同步
- **无服务器架构**：无需维护后端服务器

### 数据格式
- **OPML支持**：标准的RSS订阅源交换格式
- **JSON存储**：高效的数据存储和传输
- **增量同步**：只同步变更的数据，节省带宽

## 📁 项目结构

```
rss-reader/
├── index.html          # 主页面文件
├── styles.css          # 样式文件
├── script.js           # 主要功能脚本
├── README.md           # 项目说明
├── DEPLOYMENT.md       # 部署指南
├── LICENSE             # MIT许可证
├── .gitignore          # Git忽略配置
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions部署配置
```

## 🔧 配置说明

### Firebase配置
如需启用用户登录和数据同步功能，需要配置Firebase：

1. 在Firebase控制台创建新项目
2. 启用Authentication和Firestore
3. 获取配置信息
4. 在 `script.js` 中更新Firebase配置

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### CORS代理配置
默认使用 `https://api.allorigins.win/` 作为CORS代理，如需更换：

```javascript
const CORS_PROXY = 'https://your-cors-proxy.com/';
```

## 🌟 使用示例

### 批量导入OPML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
    <head>
        <title>我的RSS订阅</title>
    </head>
    <body>
        <outline text="BBC News" xmlUrl="https://feeds.bbci.co.uk/news/rss.xml"/>
        <outline text="TechCrunch" xmlUrl="https://techcrunch.com/feed/"/>
    </body>
</opml>
```

### 批量导入URL列表
```
https://feeds.bbci.co.uk/news/rss.xml
https://techcrunch.com/feed/
https://www.zhihu.com/rss
```

## 🔒 隐私和安全

- **数据加密**：所有用户数据在传输和存储时都经过加密
- **隐私保护**：不收集用户的个人浏览习惯
- **开源透明**：所有代码开源，可自行审查
- **本地优先**：游客模式下数据完全保存在本地

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📞 支持

如果您在使用过程中遇到问题，请：
1. 查看本文档的常见问题部分
2. 在GitHub上提交Issue
3. 发送邮件联系开发者

---

**RSS订阅阅读器 v2.0** - 让RSS阅读更简单、更智能！

