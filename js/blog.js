/**
 * 日志页面专用脚本
 * 日志数据直接嵌入，无需服务器即可运行
 */

// ========== 日志数据（直接嵌入，可直接双击HTML打开） ==========
const journalsData = [
    {
        "id": "journal-20260226",
        "title": "个人网页优化记 - 细节打磨与功能完善",
        "category": "study",
        "categoryName": "学习",
        "excerpt": "这两天优化了一下个人网页的细节。发现用codebuddy制作网页时会限制频率和额度，所以使用了两个账号交替进行设计...",
        "content": "这两天优化了一下个人网页的细节。我发现用codebuddy制作网页时会限制频率和额度，所以使用了两个账号交替进行设计。但是，两个账号之间会出现不连贯的情况，有时候会把设计好的东西搞乱了。最近就在调整这个。还没有找到一个好的解决办法。\n\n其次，我还想有一个邮箱功能，后面觉得有些多余，便修改成了留言功能，还有点赞小功能，很满意。\n\n到今天，我的小网页终于bug少了很多。使用起来越来越流畅了。太棒啦！",
        "tags": ["网站优化", "留言功能", "点赞", "CodebuddyCN"],
        "coverImage": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
        "createdAt": "2026-02-26",
        "readTime": 1,
        "isTop": false
    },
    {
        "id": "journal-20260223",
        "title": "我的网站制作初体验",
        "category": "study",
        "categoryName": "学习",
        "excerpt": "今天，我突然在抖音上刷到了一位博主她自己做了一个属于自己的网站，页面很美观，我感觉十分吸引人！所以我也想做一个属于自己的网站...",
        "content": "今天，我突然在抖音上刷到了一位博主她自己做了一个属于自己的网站，页面很美观，我感觉十分吸引人！所以我也想做一个属于自己的网站。这位博主分享了自己的制作过程，但是我想用自己的方法制作，所以没有采纳她的方法。我前段时间下载了CodebuddyCN这个软件，虽然我不清楚它目前在AI界的地位，但对于目前我的水平而言，足够了。\n\n我新建了一个文件夹，命名为\"学习制作个人网站\"。之后，用Codebuddy打开文件夹，开始和它聊天。首先用plan模式，并且用语音输入的方式快速的说明了我的想法，它很快为我制定了计划，我让它执行。\n\n过了一会，一个网站制作出来了。我仔细看了一下，发现有很多细节之处需要调整，但是没有关系，因为它已经想的很全面了！\n\n所以我就像一个顾客一样浏览自己的主页，总结了一些问题告诉了它。它持续的进行完善修改。",
        "tags": ["网站制作", "学习", "CodebuddyCN"],
        "coverImage": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
        "createdAt": "2026-02-23",
        "readTime": 2,
        "isTop": true
    },
    {
        "id": "journal-20260225",
        "title": "网站制作进阶 - 清理与优化",
        "category": "study",
        "categoryName": "学习",
        "excerpt": "继续完善个人网站，清理了不再需要的后台管理系统文件，采用JSON数据驱动方案...",
        "content": "继续完善个人网站，清理了不再需要的后台管理系统文件，采用JSON数据驱动方案。\n\n这个方案更加轻量实用，只需要修改JSON文件就能更新网站内容，非常适合我的需求。\n\n接下来我需要测试各个页面功能是否正常。",
        "tags": ["网站优化", "学习", "JSON"],
        "coverImage": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
        "createdAt": "2026-02-25",
        "readTime": 1,
        "isTop": false
    }
];

// 当前筛选状态
let currentFilter = 'study';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', function() {
    // 渲染日志列表
    renderJournals(journalsData);
    
    // 初始化功能
    initBlogFilters();
    initBlogSearch();
    initBlogCardsAnimation();
    
    console.log('✅ 日志数据加载成功:', journalsData.length);
});

/**
 * 渲染日志列表
 * @param {Array} journals - 日志数组
 */
function renderJournals(journals) {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;
    
    // 清空现有内容
    blogGrid.innerHTML = '';
    
    // 按置顶和创建时间排序
    const sortedJournals = [...journals].sort((a, b) => {
        if (a.isTop && !b.isTop) return -1;
        if (!a.isTop && b.isTop) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // 渲染每个日志卡片
    sortedJournals.forEach((journal, index) => {
        const card = createJournalCard(journal);
        blogGrid.appendChild(card);
        
        // 延迟添加动画类
        setTimeout(() => {
            card.classList.add('show');
        }, index * 100);
    });
    
    // 如果没有日志
    if (journals.length === 0) {
        showEmptyState();
    }
    
    // 显示网格
    setTimeout(() => {
        blogGrid.classList.add('show');
    }, 50);
}

/**
 * 创建日志卡片元素
 * @param {Object} journal - 日志数据
 * @returns {HTMLElement}
 */
function createJournalCard(journal) {
    const article = document.createElement('article');
    article.className = 'blog-card';
    article.dataset.category = journal.category;
    article.dataset.id = journal.id;
    
    article.innerHTML = `
        <div class="blog-image">
            <img src="${journal.coverImage}" alt="${journal.title}" onerror="this.src='https://placehold.co/600x400/c4b5fd/7c3aed?text=${encodeURIComponent(journal.title)}'">
            <span class="blog-category ${journal.category}">${journal.categoryName}</span>
            ${journal.isTop ? '<span class="blog-top">置顶</span>' : ''}
        </div>
        <div class="blog-content">
            <div class="blog-meta">
                <span class="blog-date">
                    <i class="far fa-calendar"></i> ${journal.createdAt}
                </span>
                <span class="blog-read-time">
                    <i class="far fa-clock"></i> ${journal.readTime}分钟阅读
                </span>
            </div>
            <h3 class="blog-title">${journal.title}</h3>
            <p class="blog-excerpt">${journal.excerpt}</p>
            <div class="blog-tags">
                ${journal.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
            <a href="#" class="read-more-btn" onclick="showBlogDetail(event, '${journal.id}')">
                阅读全文 <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
    
    return article;
}

/**
 * 显示空状态
 */
function showEmptyState() {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;
    
    blogGrid.innerHTML = `
        <div class="no-results">
            <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <i class="fas fa-book-open" style="font-size: 3rem; color: var(--primary-light); margin-bottom: 20px; display: block;"></i>
                <p style="font-size: 1.2rem;">暂无日志内容</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">请添加日志数据到 data/journals.json</p>
            </div>
        </div>
    `;
}

/**
 * 初始化博客筛选功能
 */
function initBlogFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 更新按钮状态
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.filter;
            filterJournals();
        });
    });
}

/**
 * 筛选日志
 */
function filterJournals() {
    const blogGrid = document.querySelector('.blog-grid');
    
    // 筛选数据
    let filtered = journalsData;
    
    // 按分类筛选
    if (currentFilter !== 'all') {
        filtered = filtered.filter(j => j.category === currentFilter);
    }
    
    // 按搜索词筛选
    if (currentSearch) {
        const keyword = currentSearch.toLowerCase();
        filtered = filtered.filter(j => 
            j.title.toLowerCase().includes(keyword) ||
            j.excerpt.toLowerCase().includes(keyword) ||
            j.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
    }
    
    // 重新渲染
    blogGrid.classList.remove('show');
    setTimeout(() => {
        renderJournals(filtered);
        blogGrid.classList.add('show');
    }, 50);
}

/**
 * 初始化博客搜索功能
 */
function initBlogSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(function() {
        currentSearch = this.value.trim();
        filterJournals();
    }, 300));
}

/**
 * 初始化日志卡片进入动画
 */
function initBlogCardsAnimation() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('show');
                }, index * 200);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 观察所有卡片
    document.querySelectorAll('.blog-card').forEach(card => {
        observer.observe(card);
    });
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 显示日志详情弹窗
 */
async function showBlogDetail(event, journalId) {
    event.preventDefault();
    
    // 查找日志数据
    const journal = journalsData.find(j => j.id === journalId);
    if (!journal) return;
    
    const modal = document.getElementById('blogDetailModal');
    if (!modal) return;
    
    // 更新弹窗内容
    const titleEl = document.getElementById('blogDetailTitle');
    const bodyEl = document.getElementById('blogDetailBody');
    const categoryEl = modal.querySelector('.blog-detail-category');
    const metaEls = modal.querySelectorAll('.blog-detail-meta span');
    
    if (titleEl) titleEl.textContent = journal.title;
    if (categoryEl) categoryEl.textContent = journal.categoryName;
    if (metaEls[0]) metaEls[0].innerHTML = `<i class="far fa-calendar"></i> ${journal.createdAt}`;
    if (metaEls[1]) metaEls[1].innerHTML = `<i class="far fa-clock"></i> ${journal.readTime}分钟阅读`;
    
    // 渲染内容（支持换行）
    if (bodyEl) {
        const paragraphs = journal.content.split('\n\n');
        bodyEl.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
        
        // 添加标签
        bodyEl.innerHTML += `
            <div class="blog-detail-tags">
                ${journal.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
        `;
    }
    
    // 显示弹窗
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 全局函数暴露
window.showBlogDetail = showBlogDetail;

/**
 * 关闭日志详情弹窗
 */
function closeBlogDetail() {
    const modal = document.getElementById('blogDetailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 全局函数暴露
window.closeBlogDetail = closeBlogDetail;

// ESC键关闭弹窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeBlogDetail();
    }
});
