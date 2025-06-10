// RSS阅读器主要功能
class RSSReader {
    constructor() {
        this.feeds = JSON.parse(localStorage.getItem('rss-feeds') || '[]');
        this.articles = JSON.parse(localStorage.getItem('rss-articles') || '[]');
        this.readArticles = new Set(JSON.parse(localStorage.getItem('read-articles') || '[]'));
        this.currentFeed = null;
        this.searchTerm = '';
        this.sortBy = 'date-desc';
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderFeeds();
        this.renderArticles();
        
        // 如果有保存的RSS源，自动加载文章
        if (this.feeds.length > 0) {
            this.loadAllFeeds();
        }
    }
    
    bindEvents() {
        // 添加RSS源
        document.getElementById('add-feed-btn').addEventListener('click', () => {
            this.addFeed();
        });
        
        document.getElementById('rss-url').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addFeed();
            }
        });
        
        // 预设RSS源
        document.querySelectorAll('.preset-feed-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                document.getElementById('rss-url').value = url;
                this.addFeed();
            });
        });
        
        // 搜索
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderArticles();
        });
        
        // 排序
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderArticles();
        });
        
        // 刷新
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadAllFeeds();
        });
        
        // 全部已读
        document.getElementById('mark-all-read-btn').addEventListener('click', () => {
            this.markAllAsRead();
        });
        
        // 模态框
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('article-modal').addEventListener('click', (e) => {
            if (e.target.id === 'article-modal') {
                this.closeModal();
            }
        });
        
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    async addFeed() {
        const urlInput = document.getElementById('rss-url');
        const url = urlInput.value.trim();
        
        if (!url) {
            this.showNotification('请输入RSS链接', 'warning');
            return;
        }
        
        if (!this.isValidUrl(url)) {
            this.showNotification('请输入有效的URL', 'error');
            return;
        }
        
        // 检查是否已存在
        if (this.feeds.some(feed => feed.url === url)) {
            this.showNotification('该RSS源已存在', 'warning');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const feedData = await this.fetchFeed(url);
            const feed = {
                id: Date.now().toString(),
                url: url,
                title: feedData.title || this.extractDomainFromUrl(url),
                description: feedData.description || '',
                lastUpdated: new Date().toISOString(),
                articleCount: feedData.articles ? feedData.articles.length : 0
            };
            
            this.feeds.push(feed);
            this.saveFeedsToStorage();
            
            // 添加文章
            if (feedData.articles) {
                feedData.articles.forEach(article => {
                    article.feedId = feed.id;
                    article.feedTitle = feed.title;
                    article.id = this.generateArticleId(article);
                });
                
                this.articles = [...this.articles, ...feedData.articles];
                this.saveArticlesToStorage();
            }
            
            this.renderFeeds();
            this.renderArticles();
            
            urlInput.value = '';
            this.showNotification(`成功添加RSS源: ${feed.title}`, 'success');
            
        } catch (error) {
            console.error('添加RSS源失败:', error);
            this.showNotification('添加RSS源失败，请检查链接是否正确', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async fetchFeed(url) {
        // 由于CORS限制，我们使用RSS代理服务
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        
        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'ok') {
                throw new Error(data.message || 'RSS解析失败');
            }
            
            return {
                title: data.feed.title,
                description: data.feed.description,
                articles: data.items.map(item => ({
                    title: item.title,
                    link: item.link,
                    description: this.stripHtml(item.description || item.content || ''),
                    content: item.content || item.description || '',
                    pubDate: item.pubDate,
                    author: item.author || data.feed.title,
                    categories: item.categories || []
                }))
            };
        } catch (error) {
            // 如果代理服务失败，尝试直接获取（可能会因CORS失败）
            try {
                const response = await fetch(url);
                const text = await response.text();
                return this.parseRSSText(text, url);
            } catch (directError) {
                throw new Error('无法获取RSS内容，可能是CORS限制或链接无效');
            }
        }
    }
    
    parseRSSText(xmlText, feedUrl) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // 检查解析错误
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            throw new Error('RSS格式无效');
        }
        
        // 尝试解析RSS 2.0
        let channel = xmlDoc.querySelector('channel');
        if (!channel) {
            // 尝试解析Atom
            channel = xmlDoc.querySelector('feed');
            if (!channel) {
                throw new Error('不支持的RSS格式');
            }
            return this.parseAtomFeed(xmlDoc, feedUrl);
        }
        
        return this.parseRSSFeed(xmlDoc, feedUrl);
    }
    
    parseRSSFeed(xmlDoc, feedUrl) {
        const channel = xmlDoc.querySelector('channel');
        const title = channel.querySelector('title')?.textContent || this.extractDomainFromUrl(feedUrl);
        const description = channel.querySelector('description')?.textContent || '';
        
        const items = Array.from(xmlDoc.querySelectorAll('item')).map(item => ({
            title: item.querySelector('title')?.textContent || '无标题',
            link: item.querySelector('link')?.textContent || feedUrl,
            description: this.stripHtml(item.querySelector('description')?.textContent || ''),
            content: item.querySelector('description')?.textContent || '',
            pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
            author: item.querySelector('author')?.textContent || title,
            categories: Array.from(item.querySelectorAll('category')).map(cat => cat.textContent)
        }));
        
        return { title, description, articles: items };
    }
    
    parseAtomFeed(xmlDoc, feedUrl) {
        const feed = xmlDoc.querySelector('feed');
        const title = feed.querySelector('title')?.textContent || this.extractDomainFromUrl(feedUrl);
        const description = feed.querySelector('subtitle')?.textContent || '';
        
        const entries = Array.from(xmlDoc.querySelectorAll('entry')).map(entry => ({
            title: entry.querySelector('title')?.textContent || '无标题',
            link: entry.querySelector('link')?.getAttribute('href') || feedUrl,
            description: this.stripHtml(entry.querySelector('summary')?.textContent || entry.querySelector('content')?.textContent || ''),
            content: entry.querySelector('content')?.textContent || entry.querySelector('summary')?.textContent || '',
            pubDate: entry.querySelector('published')?.textContent || entry.querySelector('updated')?.textContent || new Date().toISOString(),
            author: entry.querySelector('author name')?.textContent || title,
            categories: Array.from(entry.querySelectorAll('category')).map(cat => cat.getAttribute('term'))
        }));
        
        return { title, description, articles: entries };
    }
    
    async loadAllFeeds() {
        if (this.feeds.length === 0) return;
        
        this.showLoading(true);
        
        try {
            const promises = this.feeds.map(async (feed) => {
                try {
                    const feedData = await this.fetchFeed(feed.url);
                    
                    // 更新feed信息
                    feed.lastUpdated = new Date().toISOString();
                    feed.articleCount = feedData.articles ? feedData.articles.length : 0;
                    
                    // 添加新文章
                    if (feedData.articles) {
                        const newArticles = feedData.articles.filter(article => {
                            article.feedId = feed.id;
                            article.feedTitle = feed.title;
                            article.id = this.generateArticleId(article);
                            
                            return !this.articles.some(existing => existing.id === article.id);
                        });
                        
                        this.articles = [...this.articles, ...newArticles];
                    }
                    
                    return feedData;
                } catch (error) {
                    console.error(`加载RSS源失败: ${feed.title}`, error);
                    return null;
                }
            });
            
            await Promise.all(promises);
            
            this.saveFeedsToStorage();
            this.saveArticlesToStorage();
            this.renderFeeds();
            this.renderArticles();
            
            this.showNotification('RSS源已更新', 'success');
            
        } catch (error) {
            console.error('加载RSS源失败:', error);
            this.showNotification('更新RSS源时出现错误', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    renderFeeds() {
        const feedsList = document.getElementById('feeds-list');
        
        if (this.feeds.length === 0) {
            feedsList.innerHTML = '<div class="empty-feeds">暂无RSS源</div>';
            return;
        }
        
        feedsList.innerHTML = this.feeds.map(feed => `
            <div class="feed-item ${this.currentFeed === feed.id ? 'active' : ''}" data-feed-id="${feed.id}">
                <div class="feed-info">
                    <i class="fas fa-rss"></i>
                    <div>
                        <div class="feed-title">${this.escapeHtml(feed.title)}</div>
                    </div>
                </div>
                <div class="feed-count">${feed.articleCount || 0}</div>
                <div class="feed-actions">
                    <button class="feed-action" onclick="rssReader.removeFeed('${feed.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // 绑定点击事件
        feedsList.querySelectorAll('.feed-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.feed-actions')) {
                    const feedId = item.dataset.feedId;
                    this.selectFeed(feedId);
                }
            });
        });
    }
    
    selectFeed(feedId) {
        this.currentFeed = this.currentFeed === feedId ? null : feedId;
        this.renderFeeds();
        this.renderArticles();
    }
    
    removeFeed(feedId) {
        if (confirm('确定要删除这个RSS源吗？')) {
            this.feeds = this.feeds.filter(feed => feed.id !== feedId);
            this.articles = this.articles.filter(article => article.feedId !== feedId);
            
            if (this.currentFeed === feedId) {
                this.currentFeed = null;
            }
            
            this.saveFeedsToStorage();
            this.saveArticlesToStorage();
            this.renderFeeds();
            this.renderArticles();
            
            this.showNotification('RSS源已删除', 'success');
        }
    }
    
    renderArticles() {
        const articlesList = document.getElementById('articles-list');
        const emptyState = document.getElementById('empty-state');
        
        let filteredArticles = this.articles;
        
        // 按feed过滤
        if (this.currentFeed) {
            filteredArticles = filteredArticles.filter(article => article.feedId === this.currentFeed);
        }
        
        // 搜索过滤
        if (this.searchTerm) {
            filteredArticles = filteredArticles.filter(article =>
                article.title.toLowerCase().includes(this.searchTerm) ||
                article.description.toLowerCase().includes(this.searchTerm)
            );
        }
        
        // 排序
        filteredArticles.sort((a, b) => {
            switch (this.sortBy) {
                case 'date-desc':
                    return new Date(b.pubDate) - new Date(a.pubDate);
                case 'date-asc':
                    return new Date(a.pubDate) - new Date(b.pubDate);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
        
        if (filteredArticles.length === 0) {
            articlesList.innerHTML = '';
            emptyState.classList.remove('hidden');
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>${this.searchTerm ? '未找到匹配的文章' : '暂无文章'}</h3>
                <p>${this.searchTerm ? '尝试使用其他关键词搜索' : '请添加RSS源开始阅读'}</p>
            `;
        } else {
            emptyState.classList.add('hidden');
            articlesList.innerHTML = filteredArticles.map(article => this.renderArticleCard(article)).join('');
        }
    }
    
    renderArticleCard(article) {
        const isRead = this.readArticles.has(article.id);
        const publishDate = new Date(article.pubDate);
        const formattedDate = this.formatDate(publishDate);
        
        return `
            <div class="article-card ${isRead ? 'read' : ''}" data-article-id="${article.id}">
                <div class="article-header">
                    <div class="article-title">${this.escapeHtml(article.title)}</div>
                </div>
                <div class="article-meta">
                    <span class="article-source">${this.escapeHtml(article.feedTitle || article.author)}</span>
                    <span class="article-date">
                        <i class="fas fa-clock"></i>
                        ${formattedDate}
                    </span>
                </div>
                <div class="article-description">
                    ${this.escapeHtml(this.truncateText(article.description, 200))}
                </div>
                <div class="article-actions">
                    <div class="article-tags">
                        ${article.categories ? article.categories.slice(0, 3).map(cat => 
                            `<span class="article-tag">${this.escapeHtml(cat)}</span>`
                        ).join('') : ''}
                    </div>
                    <div class="article-buttons">
                        <button class="article-btn" onclick="rssReader.toggleReadStatus('${article.id}')">
                            <i class="fas fa-${isRead ? 'eye-slash' : 'eye'}"></i>
                            ${isRead ? '标为未读' : '标为已读'}
                        </button>
                        <button class="article-btn" onclick="rssReader.openArticle('${article.id}')">
                            <i class="fas fa-expand"></i>
                            查看详情
                        </button>
                        <a class="article-btn" href="${article.link}" target="_blank">
                            <i class="fas fa-external-link-alt"></i>
                            原文链接
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    openArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;
        
        // 标记为已读
        this.readArticles.add(articleId);
        this.saveReadArticlesToStorage();
        
        // 显示模态框
        document.getElementById('modal-title').textContent = article.title;
        document.getElementById('modal-source').textContent = article.feedTitle || article.author;
        document.getElementById('modal-date').textContent = this.formatDate(new Date(article.pubDate));
        document.getElementById('modal-content').innerHTML = article.content || article.description;
        document.getElementById('modal-link').href = article.link;
        
        document.getElementById('article-modal').classList.remove('hidden');
        
        // 重新渲染文章列表以更新已读状态
        this.renderArticles();
    }
    
    closeModal() {
        document.getElementById('article-modal').classList.add('hidden');
    }
    
    toggleReadStatus(articleId) {
        if (this.readArticles.has(articleId)) {
            this.readArticles.delete(articleId);
        } else {
            this.readArticles.add(articleId);
        }
        
        this.saveReadArticlesToStorage();
        this.renderArticles();
    }
    
    markAllAsRead() {
        let filteredArticles = this.articles;
        
        if (this.currentFeed) {
            filteredArticles = filteredArticles.filter(article => article.feedId === this.currentFeed);
        }
        
        if (this.searchTerm) {
            filteredArticles = filteredArticles.filter(article =>
                article.title.toLowerCase().includes(this.searchTerm) ||
                article.description.toLowerCase().includes(this.searchTerm)
            );
        }
        
        filteredArticles.forEach(article => {
            this.readArticles.add(article.id);
        });
        
        this.saveReadArticlesToStorage();
        this.renderArticles();
        this.showNotification('所有文章已标记为已读', 'success');
    }
    
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
    
    showNotification(message, type = 'success') {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notifications.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    // 工具函数
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    extractDomainFromUrl(url) {
        try {
            return new URL(url).hostname;
        } catch (_) {
            return url;
        }
    }
    
    generateArticleId(article) {
        return btoa(encodeURIComponent(article.link + article.title)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    }
    
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    formatDate(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '1天前';
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks}周前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }
    
    // 存储函数
    saveFeedsToStorage() {
        localStorage.setItem('rss-feeds', JSON.stringify(this.feeds));
    }
    
    saveArticlesToStorage() {
        localStorage.setItem('rss-articles', JSON.stringify(this.articles));
    }
    
    saveReadArticlesToStorage() {
        localStorage.setItem('read-articles', JSON.stringify([...this.readArticles]));
    }
}

// 初始化应用
let rssReader;
document.addEventListener('DOMContentLoaded', () => {
    rssReader = new RSSReader();
});

