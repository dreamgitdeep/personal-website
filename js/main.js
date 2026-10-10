/**
 * 个人网站主逻辑脚本
 * 包含：导航菜单、打字机效果、滚动动画、返回顶部等功能
 */

// ========================================
// DOM 加载完成后执行
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initHeroContent();
    initNavigation();
    initTypingEffect();
    initScrollAnimations();
    initBackToTop();
    initNavbarScroll();
    initSmoothScroll();
    initPageTransitions();
    initPerformanceOptimization();
});

// ========================================
// Hero 内容显示
// ========================================
function initHeroContent() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        setTimeout(() => {
            heroContent.classList.add('loaded');
        }, 100);
    }
}

// ========================================
// 导航菜单功能
// ========================================
function initNavigation() {
    // 导航栏由 js/layout.js 统一注入。若此刻还没渲染（脚本顺序异常），
    // 先补渲染一次，再重新取节点——querySelector 取的是快照，不能复用。
    if (!document.querySelector('.hamburger') && window.SiteLayout) {
        window.SiteLayout.render();
    }

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // 点击导航链接后关闭菜单
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// ========================================
// 打字机效果
// ========================================
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;
    
    const texts = [
        '热爱生活 ✨',
        '喜欢分享 💜',
        '永远在学习 📚',
        '记录美好时光 🌸'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            // 完成打字，暂停后开始删除
            isDeleting = true;
            typingSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            // 完成删除，切换到下一个文本
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // 延迟开始打字效果
    setTimeout(type, 1000);
}

// ========================================
// 滚动动画
// ========================================
function initScrollAnimations() {
    // 为需要动画的元素添加 reveal 类
    // （.plan-item 所属的「计划」模块已下线，选择器里已移除）
    const animatedElements = document.querySelectorAll(
        '.nav-card, .blog-item, .section-title, .section-subtitle, .timeline-item, .skill-item, .certificate-item'
    );

    animatedElements.forEach(el => {
        el.classList.add('reveal');
    });

    // 没有 IntersectionObserver 时直接全部显示，
    // 否则 .reveal 的 opacity:0 会让内容永久不可见
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
        return;
    }

    // 创建 Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // 动画播完就停止观察，否则每次滚动都会把这批元素重新回调一遍
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 观察所有带有 reveal 类的元素
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // 兜底：万一观察器异常没能触发，确保视口内的内容 3 秒内一定显示出来
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.active)').forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) {
                el.classList.add('active');
            }
        });
    }, 3000);
}

// ========================================
// 返回顶部功能
// ========================================
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', debounce(function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }, 100));
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// 导航栏滚动效果
// ========================================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', debounce(function() {
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 100));
}

// ========================================
// 平滑滚动功能
// ========================================
function initSmoothScroll() {
    // 只处理「页面内锚点」，而且必须目标元素真实存在时才拦下来做平滑滚动。
    //
    // ⚠️ 这里有两个坑，改之前先看清楚：
    //  1. 目标不存在时必须放行浏览器默认行为。日志页的目录行是
    //     <a href="#journal-20260223">，并不存在同名的元素，它靠 hash 变化
    //     来切换阅读视图。以前无条件 preventDefault，hash 不更新，
    //     阅读视图就永远打不开。
    //  2. href="#"（空锚点）不能丢给 querySelector，会抛 SyntaxError。
    //     简历页的电话 / 邮箱链接就是 href="#" 的写法。
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            let target = null;
            try { target = document.querySelector(href); } catch (err) { return; }
            if (!target) return;      // 交回默认行为（让 hash 正常变化）

            e.preventDefault();
            const offset = 70; // 导航栏高度
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// ========================================
// 页面显示
// ========================================
function initPageTransitions() {
    // 说明（重要，勿改回 load 事件）：
    // 这里以前是给 <body> 加 .page-loading（CSS 里 opacity:0），
    // 然后等 window.load 事件再恢复显示。但 window.load 要等页面上
    // **所有**外部资源加载完——字体、图标字体、Supabase SDK、图片，
    // 只要其中一个请求挂起（国内访问 fonts.gstatic.com 等常年超时），
    // 整个页面就一直是全透明状态，看起来就是「白屏卡住几十秒」。
    //
    // 现在改为：DOM 就绪后立刻显示，不等待任何外部资源。
    // 入场淡入交给纯 CSS 动画（见 style.css 的 pageIn），
    // CSS 动画随渲染立即开始，不受网络影响。
    document.body.classList.remove('page-loading');
    document.body.classList.add('page-loaded');

    // 注意：原来这里还给所有链接绑了「先白屏 300ms 再跳转」的过渡，
    // 让每次翻页都被强行拖慢 300 毫秒，已移除，交给浏览器原生导航。
}

// ========================================
// 性能优化
// ========================================
function initPerformanceOptimization() {
    // 图片懒加载
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // 回退方案：直接加载所有图片
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
    
    // 添加性能监控
    if ('performance' in window) {
        window.addEventListener('load', function() {
            console.log('页面加载时间:', performance.now(), 'ms');
        });
    }
}

// ========================================
// 工具函数
// ========================================

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        // 注意：必须用 apply 保留 this，
        // 否则监听器里以 this.value 取值的回调会拿到 undefined
        const self = this;
        const later = () => {
            clearTimeout(timeout);
            func.apply(self, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function}
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 平滑滚动到指定元素
 * @param {string} target - 目标选择器
 * @param {number} offset - 偏移量（默认 70px 导航栏高度）
 */
function scrollToElement(target, offset = 70) {
    const element = document.querySelector(target);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}



/**
 * 初始化粒子效果
 */
function initParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    // 创建粒子
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机大小
        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // 随机位置
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // 随机动画延迟
        particle.style.animationDelay = `${Math.random() * 15}s`;
        
        particlesContainer.appendChild(particle);
    }
}