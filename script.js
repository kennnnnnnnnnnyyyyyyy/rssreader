// Firebase配置
const firebaseConfig = {
    // 这里需要用户自己配置Firebase项目
    // 为了演示，我们使用本地存储模拟
    apiKey: "demo-key",
    authDomain: "rss-reader-demo.firebaseapp.com",
    projectId: "rss-reader-demo",
    storageBucket: "rss-reader-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
};

// RSS阅读器主类
class RSSReader {
    constructor() {
        this.feeds = [];
        this.articles = [];
        this.readArticles = new Set();
        this.currentUser = null;
        this.isGuest = false;
        this.currentFeed = null;
        this.searchTerm = '';
        this.sortBy = 'date-desc';
        
        this.init();
    }
    
    init() {
        this.initFirebase();
        this.bindEvents();
        this.checkAuthState();
    }
    
    // 初始化Firebase（演示版本使用本地存储）
    initFirebase() {
        // 在实际部署时，用户需要配置真实的Firebase
        console.log('Firebase初始化（演示模式）');
    }
    
    // 检查用户登录状态
    checkAuthState() {
        const savedUser = localStorage.getItem('rss-user');
        const guestMode = localStorage.getItem('rss-guest-mode');
        
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showUserInfo();
            this.loadUserData();
        } else if (guestMode) {
            this.isGuest = true;
            this.showGuestMode();
            this.loadLocalData();
        } else {
            this.showLoginForm();
        }
    }
    
    // 绑定事件
    bindEvents() {
        // 登录相关事件
        document.getElementById('login-btn').addEventListener('click', () => this.login());
        document.getElementById('register-btn').addEventListener('click', () => this.register());
        document.getElementById('guest-mode-btn').addEventListener('click', () => this.enterGuestMode());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        document.getElementById('sync-btn').addEventListener('click', () => this.syncData());
        
        // RSS源管理
        document.getElementById('add-feed-btn').addEventListener('click', () => this.addFeed());
        document.getElementById('rss-url').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addFeed();
        });
        
        // 批量导入
        document.getElementById('batch-import-btn').addEventListener('click', () => this.showImportModal());
        document.getElementById('close-import-modal').addEventListener('click', () => this.hideImportModal());
        document.getElementById('import-confirm-btn').addEventListener('click', () => this.confirmImport());
        document.getElementById('export-btn').addEventListener('click', () => this.exportFeeds());
        
        // 文件上传
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));
        this.setupDragAndDrop();
        
        // 预设源包
        document.querySelectorAll('.preset-package').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectPresetPackage(e));
        });
        
        // 预设RSS源
        document.querySelectorAll('.preset-feed-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                document.getElementById('rss-url').value = url;
                this.addFeed();
            });
        });
        
        // 搜索和排序
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderArticles();
        });
        
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderArticles();
        });
        
        // 其他功能
        document.getElementById('refresh-btn').addEventListener('click', () => this.loadAllFeeds());
        document.getElementById('mark-all-read-btn').addEventListener('click', () => this.markAllAsRead());
        document.getElementById('close-modal').addEventListener('click', () => this.hideModal());
        
        // 点击模态框外部关闭
        document.getElementById('article-modal').addEventListener('click', (e) => {
            if (e.target.id === 'article-modal') this.hideModal();
        });
        document.getElementById('import-modal').addEventListener('click', (e) => {
            if (e.target.id === 'import-modal') this.hideImportModal();
        });
    }
    
    // 用户认证功能
    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            this.showNotification('请输入邮箱和密码', 'error');
            return;
        }
        
        try {
            // 演示版本：简单验证
            if (email.includes('@') && password.length >= 6) {
                const user = { email, uid: 'demo-' + Date.now() };
                this.currentUser = user;
                localStorage.setItem('rss-user', JSON.stringify(user));
                this.showUserInfo();
                this.loadUserData();
                this.showNotification('登录成功！');
            } else {
                throw new Error('邮箱格式错误或密码太短');
            }
        } catch (error) {
            this.showNotification('登录失败: ' + error.message, 'error');
        }
    }
    
    async register() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            this.showNotification('请输入邮箱和密码', 'error');
            return;
        }
        
        try {
            // 演示版本：简单注册
            if (email.includes('@') && password.length >= 6) {
                const user = { email, uid: 'demo-' + Date.now() };
                this.currentUser = user;
                localStorage.setItem('rss-user', JSON.stringify(user));
                this.showUserInfo();
                this.showNotification('注册成功！');
            } else {
                throw new Error('邮箱格式错误或密码至少6位');
            }
        } catch (error) {
            this.showNotification('注册失败: ' + error.message, 'error');
        }
    }
    
    enterGuestMode() {
        this.isGuest = true;
        localStorage.setItem('rss-guest-mode', 'true');
        this.showGuestMode();
        this.loadLocalData();
        this.showNotification('已进入游客模式');
    }
    
    logout() {
        this.currentUser = null;
        this.isGuest = false;
        localStorage.removeItem('rss-user');
        localStorage.removeItem('rss-guest-mode');
        this.showLoginForm();
        this.clearData();
        this.showNotification('已退出登录');
    }
    
    // 界面显示控制
    showLoginForm() {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('user-info').style.display = 'none';
    }
    
    showUserInfo() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('user-email').textContent = this.currentUser.email;
    }
    
    showGuestMode() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('user-email').textContent = '游客模式';
    }
    
    // 数据同步功能
    async syncData() {
        if (this.isGuest) {
            this.showNotification('游客模式无法同步数据', 'warning');
            return;
        }
        
        this.showSyncIndicator('syncing');
        
        try {
            // 演示版本：模拟同步
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 保存到云端（演示）
            const userData = {
                feeds: this.feeds,
                articles: this.articles,
                readArticles: Array.from(this.readArticles)
            };
            localStorage.setItem(`rss-data-${this.currentUser.uid}`, JSON.stringify(userData));
            
            this.showSyncIndicator('success');
            this.showNotification('数据同步成功！');
        } catch (error) {
            this.showSyncIndicator('error');
            this.showNotification('同步失败: ' + error.message, 'error');
        }
        
        setTimeout(() => this.hideSyncIndicator(), 2000);
    }
    
    loadUserData() {
        if (this.currentUser) {
            const userData = localStorage.getItem(`rss-data-${this.currentUser.uid}`);
            if (userData) {
                const data = JSON.parse(userData);
                this.feeds = data.feeds || [];
                this.articles = data.articles || [];
                this.readArticles = new Set(data.readArticles || []);
            }
        }
        this.renderFeeds();
        this.renderArticles();
    }
    
    loadLocalData() {
        this.feeds = JSON.parse(localStorage.getItem('rss-feeds') || '[]');
        this.articles = JSON.parse(localStorage.getItem('rss-articles') || '[]');
        this.readArticles = new Set(JSON.parse(localStorage.getItem('read-articles') || '[]'));
        this.renderFeeds();
        this.renderArticles();
    }
    
    saveData() {
        if (this.currentUser && !this.isGuest) {
            // 保存到用户数据
            const userData = {
                feeds: this.feeds,
                articles: this.articles,
                readArticles: Array.from(this.readArticles)
            };
            localStorage.setItem(`rss-data-${this.currentUser.uid}`, JSON.stringify(userData));
        } else {
            // 保存到本地
            localStorage.setItem('rss-feeds', JSON.stringify(this.feeds));
            localStorage.setItem('rss-articles', JSON.stringify(this.articles));
            localStorage.setItem('read-articles', JSON.stringify(Array.from(this.readArticles)));
        }
    }
    
    clearData() {
        this.feeds = [];
        this.articles = [];
        this.readArticles = new Set();
        this.renderFeeds();
        this.renderArticles();
    }
    
    // 批量导入功能
    showImportModal() {
        document.getElementById('import-modal').classList.remove('hidden');
    }
    
    hideImportModal() {
        document.getElementById('import-modal').classList.add('hidden');
        this.resetImportForm();
    }
    
    resetImportForm() {
        document.getElementById('text-import').value = '';
        document.getElementById('file-input').value = '';
        document.querySelectorAll('.preset-package').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById('import-progress').classList.add('hidden');
    }
    
    setupDragAndDrop() {
        const uploadArea = document.getElementById('file-upload-area');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload({ target: { files } });
            }
        });
        
        uploadArea.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
    }
    
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const feeds = this.parseImportFile(file.name, content);
                this.previewImportFeeds(feeds);
            } catch (error) {
                this.showNotification('文件解析失败: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }
    
    parseImportFile(filename, content) {
        const extension = filename.split('.').pop().toLowerCase();
        let feeds = [];
        
        switch (extension) {
            case 'opml':
            case 'xml':
                feeds = this.parseOPML(content);
                break;
            case 'json':
                feeds = this.parseJSON(content);
                break;
            case 'txt':
                feeds = this.parseTXT(content);
                break;
            default:
                throw new Error('不支持的文件格式');
        }
        
        return feeds;
    }
    
    parseOPML(content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/xml');
        const outlines = doc.querySelectorAll('outline[xmlUrl]');
        
        return Array.from(outlines).map(outline => ({
            url: outline.getAttribute('xmlUrl'),
            title: outline.getAttribute('title') || outline.getAttribute('text') || 'Unknown Feed'
        }));
    }
    
    parseJSON(content) {
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
            return data.map(item => ({
                url: item.url || item.xmlUrl || item.link,
                title: item.title || item.name || 'Unknown Feed'
            }));
        } else if (data.feeds) {
            return data.feeds;
        }
        throw new Error('JSON格式不正确');
    }
    
    parseTXT(content) {
        return content.split('\n')
            .map(line => line.trim())
            .filter(line => line && (line.startsWith('http') || line.startsWith('https')))
            .map(url => ({
                url: url,
                title: 'Imported Feed'
            }));
    }
    
    selectPresetPackage(event) {
        const button = event.currentTarget;
        const package = button.dataset.package;
        
        // 切换选中状态
        document.querySelectorAll('.preset-package').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
        
        // 获取预设源
        const presetFeeds = this.getPresetFeeds(package);
        this.previewImportFeeds(presetFeeds);
    }
    
    getPresetFeeds(package) {
        const presets = {
            news: [
                { url: 'https://feeds.bbci.co.uk/news/rss.xml', title: 'BBC News' },
                { url: 'https://rss.cnn.com/rss/edition.rss', title: 'CNN' },
                { url: 'https://feeds.reuters.com/reuters/topNews', title: 'Reuters' },
                { url: 'https://feeds.npr.org/1001/rss.xml', title: 'NPR News' }
            ],
            tech: [
                { url: 'https://feeds.feedburner.com/TechCrunch', title: 'TechCrunch' },
                { url: 'https://www.wired.com/feed/rss', title: 'Wired' },
                { url: 'https://feeds.arstechnica.com/arstechnica/index', title: 'Ars Technica' },
                { url: 'https://feeds.feedburner.com/venturebeat/SZYF', title: 'VentureBeat' }
            ],
            chinese: [
                { url: 'https://www.zhihu.com/rss', title: '知乎热门' },
                { url: 'https://36kr.com/feed', title: '36氪' },
                { url: 'https://sspai.com/feed', title: '少数派' },
                { url: 'https://www.ifanr.com/feed', title: '爱范儿' }
            ]
        };
        
        return presets[package] || [];
    }
    
    previewImportFeeds(feeds) {
        if (feeds.length === 0) {
            this.showNotification('没有找到有效的RSS源', 'warning');
            return;
        }
        
        // 显示预览（简化版本，直接显示数量）
        this.showNotification(`准备导入 ${feeds.length} 个RSS源`);
        this.pendingImportFeeds = feeds;
    }
    
    async confirmImport() {
        let feeds = [];
        
        // 获取文本导入的内容
        const textContent = document.getElementById('text-import').value.trim();
        if (textContent) {
            const textFeeds = this.parseTXT(textContent);
            feeds = feeds.concat(textFeeds);
        }
        
        // 获取预设源包
        if (this.pendingImportFeeds) {
            feeds = feeds.concat(this.pendingImportFeeds);
        }
        
        if (feeds.length === 0) {
            this.showNotification('请选择要导入的RSS源', 'warning');
            return;
        }
        
        // 显示进度条
        this.showImportProgress();
        
        let imported = 0;
        for (let i = 0; i < feeds.length; i++) {
            const feed = feeds[i];
            
            // 检查是否已存在
            if (!this.feeds.find(f => f.url === feed.url)) {
                try {
                    await this.addFeedFromData(feed);
                    imported++;
                } catch (error) {
                    console.error('导入失败:', feed.url, error);
                }
            }
            
            // 更新进度
            const progress = ((i + 1) / feeds.length) * 100;
            this.updateImportProgress(progress);
            
            // 添加延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.hideImportProgress();
        this.hideImportModal();
        this.showNotification(`成功导入 ${imported} 个RSS源`);
        this.saveData();
    }
    
    showImportProgress() {
        document.getElementById('import-progress').classList.remove('hidden');
        this.updateImportProgress(0);
    }
    
    updateImportProgress(percent) {
        const fill = document.querySelector('.progress-fill');
        const text = document.querySelector('.progress-text');
        fill.style.width = percent + '%';
        text.textContent = `正在导入RSS源... ${Math.round(percent)}%`;
    }
    
    hideImportProgress() {
        document.getElementById('import-progress').classList.add('hidden');
    }
    
    async addFeedFromData(feedData) {
        const feed = {
            id: Date.now() + Math.random(),
            url: feedData.url,
            title: feedData.title,
            articles: [],
            lastUpdated: new Date().toISOString()
        };
        
        this.feeds.push(feed);
        this.renderFeeds();
        
        // 尝试加载文章
        try {
            await this.loadFeedArticles(feed);
        } catch (error) {
            console.error('加载文章失败:', error);
        }
    }
    
    // 导出功能
    exportFeeds() {
        if (this.feeds.length === 0) {
            this.showNotification('没有RSS源可以导出', 'warning');
            return;
        }
        
        const exportData = {
            version: '1.0',
            exported: new Date().toISOString(),
            feeds: this.feeds.map(feed => ({
                url: feed.url,
                title: feed.title
            }))
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rss-feeds-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('RSS源导出成功');
    }
    
    // 同步状态指示器
    showSyncIndicator(status) {
        let indicator = document.querySelector('.sync-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'sync-indicator';
            document.body.appendChild(indicator);
        }
        
        indicator.className = `sync-indicator ${status}`;
        
        switch (status) {
            case 'syncing':
                indicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> 正在同步...';
                break;
            case 'success':
                indicator.innerHTML = '<i class="fas fa-check"></i> 同步成功';
                break;
            case 'error':
                indicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 同步失败';
                break;
        }
    }
    
    hideSyncIndicator() {
        const indicator = document.querySelector('.sync-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // RSS源管理（原有功能）
    async addFeed() {
        const url = document.getElementById('rss-url').value.trim();
        if (!url) {
            this.showNotification('请输入RSS链接', 'error');
            return;
        }
        
        // 检查是否已存在
        if (this.feeds.find(feed => feed.url === url)) {
            this.showNotification('该RSS源已存在', 'warning');
            return;
        }
        
        const feed = {
            id: Date.now(),
            url: url,
            title: 'Loading...',
            articles: [],
            lastUpdated: new Date().toISOString()
        };
        
        this.feeds.push(feed);
        this.renderFeeds();
        this.saveData();
        
        document.getElementById('rss-url').value = '';
        
        try {
            await this.loadFeedArticles(feed);
            this.showNotification(`成功添加RSS源: ${feed.title}`);
        } catch (error) {
            this.showNotification('加载RSS源失败: ' + error.message, 'error');
        }
    }
    
    async loadFeedArticles(feed) {
        try {
            const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            if (data.status === 'ok') {
                feed.title = data.feed.title || 'Unknown Feed';
                feed.description = data.feed.description;
                feed.link = data.feed.link;
                
                const articles = data.items.map(item => ({
                    id: this.generateArticleId(item),
                    title: item.title,
                    link: item.link,
                    description: item.description || item.content,
                    pubDate: item.pubDate,
                    source: feed.title,
                    feedId: feed.id
                }));
                
                // 合并新文章
                const existingIds = new Set(this.articles.map(a => a.id));
                const newArticles = articles.filter(a => !existingIds.has(a.id));
                
                this.articles = [...newArticles, ...this.articles];
                feed.articles = articles;
                
                this.renderFeeds();
                this.renderArticles();
                this.saveData();
            } else {
                throw new Error(data.message || 'RSS解析失败');
            }
        } catch (error) {
            console.error('加载RSS失败:', error);
            
            // 生成模拟数据用于演示
            feed.title = this.extractTitleFromUrl(feed.url);
            const mockArticles = this.generateMockArticles(feed);
            
            const existingIds = new Set(this.articles.map(a => a.id));
            const newArticles = mockArticles.filter(a => !existingIds.has(a.id));
            
            this.articles = [...newArticles, ...this.articles];
            feed.articles = mockArticles;
            
            this.renderFeeds();
            this.renderArticles();
            this.saveData();
        }
    }
    
    generateArticleId(item) {
        return btoa(encodeURIComponent(item.link || item.title + item.pubDate)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    }
    
    extractTitleFromUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '').split('.')[0].toUpperCase();
        } catch {
            return 'RSS Feed';
        }
    }
    
    generateMockArticles(feed) {
        const titles = [
            '重要新闻：科技发展新突破',
            '市场分析：最新趋势解读',
            '深度报道：行业变革观察',
            '专家观点：未来发展预测',
            '热点关注：社会议题讨论'
        ];
        
        return titles.map((title, index) => ({
            id: `mock-${feed.id}-${index}`,
            title: `${title} - ${feed.title}`,
            link: `${feed.url}#article-${index}`,
            description: `这是来自 ${feed.title} 的模拟文章内容。在实际使用中，这里会显示真实的RSS文章摘要。`,
            pubDate: new Date(Date.now() - index * 3600000).toISOString(),
            source: feed.title,
            feedId: feed.id
        }));
    }
    
    async loadAllFeeds() {
        if (this.feeds.length === 0) return;
        
        this.showLoading();
        
        for (const feed of this.feeds) {
            try {
                await this.loadFeedArticles(feed);
            } catch (error) {
                console.error('刷新失败:', feed.url, error);
            }
        }
        
        this.hideLoading();
        this.showNotification('RSS源刷新完成');
    }
    
    removeFeed(feedId) {
        this.feeds = this.feeds.filter(feed => feed.id !== feedId);
        this.articles = this.articles.filter(article => article.feedId !== feedId);
        this.renderFeeds();
        this.renderArticles();
        this.saveData();
        this.showNotification('RSS源已删除');
    }
    
    // 文章管理
    renderFeeds() {
        const feedsList = document.getElementById('feeds-list');
        feedsList.innerHTML = '';
        
        this.feeds.forEach(feed => {
            const feedElement = document.createElement('div');
            feedElement.className = 'feed-item';
            feedElement.innerHTML = `
                <div class="feed-info">
                    <div class="feed-title">${feed.title}</div>
                    <div class="feed-count">${feed.articles?.length || 0} 篇文章</div>
                </div>
                <button class="feed-remove" onclick="rssReader.removeFeed(${feed.id})" title="删除">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            feedElement.addEventListener('click', (e) => {
                if (!e.target.closest('.feed-remove')) {
                    this.selectFeed(feed.id);
                }
            });
            
            feedsList.appendChild(feedElement);
        });
    }
    
    selectFeed(feedId) {
        this.currentFeed = feedId;
        document.querySelectorAll('.feed-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        this.renderArticles();
    }
    
    renderArticles() {
        const articlesList = document.getElementById('articles-list');
        const emptyState = document.getElementById('empty-state');
        
        let articles = this.articles;
        
        // 过滤当前RSS源
        if (this.currentFeed) {
            articles = articles.filter(article => article.feedId === this.currentFeed);
        }
        
        // 搜索过滤
        if (this.searchTerm) {
            articles = articles.filter(article =>
                article.title.toLowerCase().includes(this.searchTerm) ||
                article.description.toLowerCase().includes(this.searchTerm)
            );
        }
        
        // 排序
        articles = this.sortArticles(articles);
        
        if (articles.length === 0) {
            articlesList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        articlesList.innerHTML = '';
        
        articles.forEach(article => {
            const isRead = this.readArticles.has(article.id);
            const articleElement = document.createElement('div');
            articleElement.className = `article-item ${isRead ? 'read' : 'unread'}`;
            articleElement.innerHTML = `
                <div class="article-content">
                    <h3 class="article-title">${article.title}</h3>
                    <div class="article-meta">
                        <span class="article-source">${article.source}</span>
                        <span class="article-date">${this.formatDate(article.pubDate)}</span>
                    </div>
                    <p class="article-description">${this.truncateText(article.description, 150)}</p>
                </div>
                <div class="article-actions">
                    <button class="article-btn" onclick="rssReader.toggleReadStatus('${article.id}')">
                        <i class="fas fa-${isRead ? 'eye-slash' : 'eye'}"></i>
                        ${isRead ? '标为未读' : '标为已读'}
                    </button>
                    <button class="article-btn" onclick="rssReader.showArticleDetail('${article.id}')">
                        <i class="fas fa-expand"></i> 查看详情
                    </button>
                    <a href="${article.link}" target="_blank" class="article-btn">
                        <i class="fas fa-external-link-alt"></i> 原文链接
                    </a>
                </div>
            `;
            
            articlesList.appendChild(articleElement);
        });
    }
    
    sortArticles(articles) {
        switch (this.sortBy) {
            case 'date-desc':
                return articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            case 'date-asc':
                return articles.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
            case 'title':
                return articles.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return articles;
        }
    }
    
    toggleReadStatus(articleId) {
        if (this.readArticles.has(articleId)) {
            this.readArticles.delete(articleId);
        } else {
            this.readArticles.add(articleId);
        }
        this.renderArticles();
        this.saveData();
    }
    
    markAllAsRead() {
        let articles = this.articles;
        if (this.currentFeed) {
            articles = articles.filter(article => article.feedId === this.currentFeed);
        }
        
        articles.forEach(article => {
            this.readArticles.add(article.id);
        });
        
        this.renderArticles();
        this.saveData();
        this.showNotification('所有文章已标为已读');
    }
    
    showArticleDetail(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;
        
        // 标记为已读
        this.readArticles.add(articleId);
        this.renderArticles();
        this.saveData();
        
        // 显示详情
        document.getElementById('modal-title').textContent = article.title;
        document.getElementById('modal-source').textContent = article.source;
        document.getElementById('modal-date').textContent = this.formatDate(article.pubDate);
        document.getElementById('modal-content').innerHTML = article.description;
        document.getElementById('modal-link').href = article.link;
        
        document.getElementById('article-modal').classList.remove('hidden');
    }
    
    hideModal() {
        document.getElementById('article-modal').classList.add('hidden');
    }
    
    // 工具函数
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) { // 1小时内
            const minutes = Math.floor(diff / 60000);
            return `${minutes}分钟前`;
        } else if (diff < 86400000) { // 24小时内
            const hours = Math.floor(diff / 3600000);
            return `${hours}小时前`;
        } else if (diff < 604800000) { // 7天内
            const days = Math.floor(diff / 86400000);
            return `${days}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }
    
    truncateText(text, maxLength) {
        if (!text) return '';
        const cleanText = text.replace(/<[^>]*>/g, '');
        return cleanText.length > maxLength ? 
            cleanText.substring(0, maxLength) + '...' : 
            cleanText;
    }
    
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
            ${message}
        `;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// 初始化应用
let rssReader;
document.addEventListener('DOMContentLoaded', () => {
    rssReader = new RSSReader();
});

