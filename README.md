# RSS 订阅阅读器

一个现代化的RSS订阅阅读器，支持订阅多个RSS源，搜索文章，标记已读/未读状态等功能。

## 🌟 功能特点

- 📰 **RSS订阅管理** - 添加、删除RSS源，支持多种RSS格式
- 🔍 **智能搜索** - 实时搜索文章标题和内容
- 📖 **阅读体验** - 文章详情模态框，支持标记已读/未读
- 🎨 **现代化界面** - 响应式设计，支持桌面和移动设备
- 💾 **本地存储** - 使用localStorage保存订阅源和阅读状态
- ⚡ **快速加载** - 使用RSS代理服务解决CORS问题
- 🔄 **自动刷新** - 支持手动和自动刷新RSS内容

## 🚀 在线演示

访问 [RSS阅读器](https://your-username.github.io/rss-reader/) 体验完整功能。

## 📱 功能截图

### 主界面
- 左侧边栏：RSS源管理和推荐源
- 右侧主区域：文章列表和搜索工具栏

### 核心功能
- ✅ 添加RSS源（支持BBC、CNN、TechCrunch等）
- ✅ 文章搜索和过滤
- ✅ 文章详情查看
- ✅ 已读/未读状态管理
- ✅ 多种排序方式（时间、标题）

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: 现代CSS Grid/Flexbox布局
- **图标**: Font Awesome 6.0
- **RSS解析**: RSS2JSON API
- **存储**: localStorage
- **部署**: GitHub Pages

## 📦 本地运行

1. 克隆仓库：
```bash
git clone https://github.com/your-username/rss-reader.git
cd rss-reader
```

2. 使用本地服务器运行（推荐）：
```bash
# 使用Python
python -m http.server 8000

# 或使用Node.js
npx serve .

# 或使用PHP
php -S localhost:8000
```

3. 打开浏览器访问 `http://localhost:8000`

## 🌐 部署到GitHub Pages

1. Fork这个仓库
2. 在仓库设置中启用GitHub Pages
3. 选择源分支（通常是main或gh-pages）
4. 访问 `https://your-username.github.io/rss-reader/`

## 📝 使用说明

### 添加RSS源
1. 在左侧边栏的"添加RSS源"区域输入RSS链接
2. 点击"添加"按钮
3. 系统会自动获取并显示文章

### 推荐RSS源
点击左侧的推荐源可以快速添加：
- BBC News
- CNN
- TechCrunch
- 知乎热门

### 文章管理
- **搜索**: 使用顶部搜索框过滤文章
- **排序**: 选择不同的排序方式
- **阅读**: 点击"查看详情"查看完整文章
- **标记**: 标记文章为已读/未读状态

## 🔧 自定义配置

### 修改RSS代理服务
如果默认的RSS2JSON服务不可用，可以在`script.js`中修改：

```javascript
// 在fetchFeed函数中修改代理URL
const proxyUrl = `https://your-proxy-service.com/api?url=${encodeURIComponent(url)}`;
```

### 添加新的推荐源
在`index.html`中的推荐源部分添加：

```html
<div class="preset-feed-item" data-url="YOUR_RSS_URL">
    <i class="fas fa-icon"></i> 源名称
</div>
```

## 🐛 已知问题

1. **CORS限制**: 某些RSS源可能因为CORS策略无法直接访问，需要使用代理服务
2. **代理服务限制**: RSS2JSON等免费代理服务可能有请求频率限制
3. **移动端优化**: 在小屏幕设备上的某些交互可能需要进一步优化

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Font Awesome](https://fontawesome.com/) - 图标库
- [RSS2JSON](https://rss2json.com/) - RSS代理服务
- 所有RSS源提供商

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/your-username/rss-reader/issues)
- 发送邮件到: your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给它一个星标！

