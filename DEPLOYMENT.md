# RSS阅读器 v2.0 部署指南

本指南将帮助您将RSS阅读器v2.0部署到GitHub Pages或其他静态网站托管服务。

## 🚀 GitHub Pages 部署（推荐）

### 方法1：直接上传文件

1. **创建GitHub仓库**
   - 登录GitHub，点击"New repository"
   - 仓库名建议使用：`rss-reader` 或 `my-rss-reader`
   - 设置为Public（免费用户需要公开仓库才能使用GitHub Pages）

2. **上传项目文件**
   - 下载并解压项目文件
   - 将所有文件上传到仓库根目录
   - 确保 `index.html` 在根目录

3. **启用GitHub Pages**
   - 进入仓库设置（Settings）
   - 滚动到"Pages"部分
   - Source选择"Deploy from a branch"
   - Branch选择"main"
   - Folder选择"/ (root)"
   - 点击Save

4. **访问网站**
   - 等待几分钟部署完成
   - 访问：`https://your-username.github.io/repository-name/`

### 方法2：使用Git命令行

```bash
# 克隆或初始化仓库
git clone https://github.com/your-username/rss-reader.git
cd rss-reader

# 或者初始化新仓库
git init
git remote add origin https://github.com/your-username/rss-reader.git

# 添加文件
git add .
git commit -m "Deploy RSS Reader v2.0 with login and batch import"
git push -u origin main
```

### 方法3：自动部署（已配置）

项目已包含GitHub Actions配置文件，推送代码后会自动部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## 🔧 Firebase配置（启用登录功能）

要启用用户登录和数据同步功能，需要配置Firebase：

### 1. 创建Firebase项目

1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 点击"创建项目"
3. 输入项目名称（如：my-rss-reader）
4. 选择是否启用Google Analytics（可选）
5. 创建项目

### 2. 配置Authentication

1. 在Firebase控制台，点击"Authentication"
2. 点击"开始使用"
3. 在"Sign-in method"标签页：
   - 启用"电子邮件地址/密码"
   - 可选：启用其他登录方式（Google、GitHub等）

### 3. 配置Firestore数据库

1. 点击"Firestore Database"
2. 点击"创建数据库"
3. 选择"以测试模式启动"（稍后可修改安全规则）
4. 选择数据库位置

### 4. 获取配置信息

1. 点击项目设置（齿轮图标）
2. 滚动到"您的应用"部分
3. 点击"</>"图标添加Web应用
4. 输入应用昵称，点击"注册应用"
5. 复制配置对象

### 5. 更新项目配置

在 `script.js` 文件中找到Firebase配置部分，替换为您的配置：

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

### 6. 配置Firestore安全规则

在Firestore控制台的"规则"标签页，使用以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 用户数据的子集合
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🌐 其他部署选项

### Netlify部署

1. 将项目文件压缩为ZIP
2. 访问 [Netlify](https://www.netlify.com/)
3. 拖拽ZIP文件到部署区域
4. 等待部署完成

### Vercel部署

1. 访问 [Vercel](https://vercel.com/)
2. 连接GitHub仓库
3. 选择RSS阅读器仓库
4. 点击Deploy

### 自托管

将项目文件上传到任何支持静态文件的Web服务器：

- Apache
- Nginx  
- IIS
- 或任何静态文件托管服务

## 🔍 故障排除

### 常见问题

**Q: 登录功能不工作**
A: 检查Firebase配置是否正确，确保已启用Authentication

**Q: RSS源无法加载**
A: 可能是CORS问题，检查CORS代理设置

**Q: 批量导入不工作**
A: 确保OPML文件格式正确，或检查浏览器控制台错误

**Q: GitHub Pages部署失败**
A: 检查仓库是否为Public，确保index.html在根目录

### 调试步骤

1. **检查浏览器控制台**
   - 按F12打开开发者工具
   - 查看Console标签页的错误信息

2. **验证文件路径**
   - 确保所有文件都在正确位置
   - 检查相对路径是否正确

3. **测试网络连接**
   - 确保能访问Firebase和CORS代理
   - 检查防火墙设置

## 📊 性能优化

### 建议的优化

1. **启用CDN**
   - 使用GitHub Pages的CDN
   - 或配置Cloudflare

2. **压缩资源**
   - 压缩CSS和JavaScript文件
   - 优化图片资源

3. **缓存策略**
   - 配置适当的缓存头
   - 使用Service Worker（可选）

## 🔐 安全配置

### 生产环境安全

1. **Firebase安全规则**
   - 使用严格的Firestore安全规则
   - 定期审查访问权限

2. **HTTPS强制**
   - 确保网站使用HTTPS
   - GitHub Pages默认支持HTTPS

3. **API密钥保护**
   - Firebase Web API密钥可以公开
   - 但要配置好安全规则

## 📈 监控和分析

### 可选的监控工具

1. **Google Analytics**
   - 在Firebase项目中启用
   - 添加跟踪代码到HTML

2. **Firebase Analytics**
   - 自动收集用户行为数据
   - 在Firebase控制台查看报告

---

部署完成后，您的RSS阅读器就可以在线使用了！用户可以注册账户享受多端同步功能，或使用游客模式进行本地阅读。

