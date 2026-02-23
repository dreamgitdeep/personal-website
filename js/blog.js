/**
 * 日志页面专用脚本
 * 包含：日志分类筛选、搜索功能、加载更多
 */

document.addEventListener('DOMContentLoaded', function() {
    initBlogFilter();
    initBlogSearch();
    initLoadMore();
    initBlogCardsAnimation();
});

/**
 * 初始化日志分类筛选
 */
function initBlogFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 更新按钮状态
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 获取筛选类别
            const filter = this.getAttribute('data-filter');
            
            // 筛选日志卡片
            let visibleCount = 0;
            blogCards.forEach(card => {
                const category = card.getAttribute('data-category');
                const searchInput = document.getElementById('searchInput');
                const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
                
                const title = card.querySelector('.blog-title').textContent.toLowerCase();
                const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
                const matchesSearch = title.includes(searchTerm) || excerpt.includes(searchTerm);
                const matchesFilter = filter === 'all' || category === filter;
                
                if (matchesFilter && matchesSearch) {
                    card.classList.remove('hidden');
                    // 添加淡入动画
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, visibleCount * 100);
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                }
            });
            
            // 如果没有匹配的结果，显示提示
            updateNoResultsMessage(visibleCount);
        });
    });
}

/**
 * 初始化日志搜索功能
 */
function initBlogSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(function() {
        const searchTerm = this.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active');
        const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
        const blogCards = document.querySelectorAll('.blog-card');
        
        let visibleCount = 0;
        blogCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = card.querySelector('.blog-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
            
            const matchesSearch = title.includes(searchTerm) || 
                                  excerpt.includes(searchTerm) || 
                                  tags.some(tag => tag.includes(searchTerm));
            const matchesFilter = filter === 'all' || category === filter;
            
            if (matchesFilter && matchesSearch) {
                card.classList.remove('hidden');
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.4s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, visibleCount * 100);
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        updateNoResultsMessage(visibleCount);
    }, 300));
}

/**
 * 更新无结果提示
 */
function updateNoResultsMessage(visibleCount) {
    const existingMessage = document.querySelector('.no-results-message');
    
    if (visibleCount === 0) {
        if (!existingMessage) {
            const message = document.createElement('div');
            message.className = 'no-results-message';
            message.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--primary-light); margin-bottom: 20px; display: block;"></i>
                    <p style="font-size: 1.1rem;">没有找到匹配的日志</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">试试其他关键词或分类</p>
                </div>
            `;
            document.querySelector('.blog-grid').after(message);
        }
    } else {
        if (existingMessage) {
            existingMessage.remove();
        }
    }
}

/**
 * 初始化加载更多功能
 */
function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        icon.classList.add('fa-spin');
        
        // 模拟加载延迟
        setTimeout(() => {
            icon.classList.remove('fa-spin');
            
            // 这里可以添加加载更多日志的逻辑
            // 例如：从服务器获取更多数据或显示隐藏的日志
            
            // 示例：显示提示
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--primary-dark);
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 0.95rem;
                z-index: 1000;
                animation: fadeInUp 0.3s ease;
            `;
            toast.textContent = '已显示所有日志';
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'fadeOutDown 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 2000);
            
            // 隐藏加载按钮
            this.style.display = 'none';
        }, 1000);
    });
}

/**
 * 初始化日志卡片进入动画
 */
function initBlogCardsAnimation() {
    const blogCards = document.querySelectorAll('.blog-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    blogCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
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

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes fadeOutDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
`;
document.head.appendChild(style);