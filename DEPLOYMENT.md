# GitHub Pages 部署指南

本指南将帮助您将RSS阅读器部署到GitHub Pages。

## 🚀 快速部署

### 方法一：Fork 仓库（推荐）

1. **Fork 仓库**
   - 访问项目仓库页面
   - 点击右上角的 "Fork" 按钮
   - 选择您的GitHub账户

2. **启用GitHub Pages**
   - 进入您fork的仓库
   - 点击 "Settings" 选项卡
   - 在左侧菜单中找到 "Pages"
   - 在 "Source" 部分选择 "Deploy from a branch"
   - 选择 "main" 分支和 "/ (root)" 文件夹
   - 点击 "Save"

3. **访问您的网站**
   - 等待几分钟让GitHub处理部署
   - 访问 `https://your-username.github.io/rss-reader/`

### 方法二：上传文件

1. **创建新仓库**
   - 在GitHub上创建一个新的公开仓库
   - 仓库名建议使用 `rss-reader`

2. **上传文件**
   - 将以下文件上传到仓库：
     - `index.html`
     - `styles.css`
     - `script.js`
     - `README.md`
     - `LICENSE`

3. **启用GitHub Pages**
   - 按照方法一的步骤2-3进行设置

## 🔧 自定义配置

### 修改仓库名称
如果您使用了不同的仓库名称，需要更新以下内容：

1. **README.md** 中的链接：
```markdown
访问 [RSS阅读器](https://your-username.github.io/your-repo-name/) 体验完整功能。
```

2. **如果使用子路径**，可能需要在HTML中调整资源路径。

### 自定义域名（可选）

1. **添加CNAME文件**
   - 在仓库根目录创建 `CNAME` 文件
   - 文件内容为您的域名，如：`rss.yourdomain.com`

2. **配置DNS**
   - 在您的域名提供商处添加CNAME记录
   - 指向 `your-username.github.io`

3. **在GitHub设置中配置**
   - 在Pages设置中的"Custom domain"输入您的域名
   - 勾选"Enforce HTTPS"

## 🔄 自动部署

项目包含GitHub Actions工作流，会在以下情况自动部署：

- 推送到main分支
- 创建Pull Request到main分支

工作流文件位置：`.github/workflows/deploy.yml`

### 手动触发部署

1. 进入仓库的 "Actions" 选项卡
2. 选择 "Deploy to GitHub Pages" 工作流
3. 点击 "Run workflow"

## 📱 移动端优化

部署后的网站已经过移动端优化，支持：

- 响应式布局
- 触摸友好的界面
- 移动端搜索体验

## 🐛 常见问题

### 1. 页面显示404错误
- 确保仓库是公开的
- 检查GitHub Pages设置是否正确
- 等待几分钟让更改生效

### 2. CSS/JS文件加载失败
- 确保所有文件都在仓库根目录
- 检查文件名大小写是否正确
- 清除浏览器缓存

### 3. RSS源无法加载
- 这是正常现象，某些RSS源可能有CORS限制
- 尝试使用推荐的RSS源
- 或者使用支持CORS的RSS源

### 4. 自动部署失败
- 检查GitHub Actions权限设置
- 确保仓库有Pages写入权限
- 查看Actions日志了解具体错误

## 📊 使用统计

部署后，您可以通过以下方式查看使用统计：

1. **GitHub Insights**
   - 仓库的 "Insights" 选项卡
   - 查看访问量和流量来源

2. **Google Analytics**（可选）
   - 在 `index.html` 中添加GA代码
   - 跟踪用户行为和页面性能

## 🔒 安全考虑

- 不要在代码中包含敏感信息
- 使用HTTPS访问（GitHub Pages默认支持）
- 定期更新依赖项（如Font Awesome）

## 📞 获取帮助

如果遇到部署问题：

1. 查看GitHub Pages文档
2. 检查仓库的Issues页面
3. 在项目仓库提交新的Issue

---

🎉 恭喜！您的RSS阅读器现在已经部署到GitHub Pages了！

