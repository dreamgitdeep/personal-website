/**
 * 个人网站主逻辑脚本
 * 包含：导航菜单、打字机效果、滚动动画、返回顶部等功能
 */

// ========================================
// DOM 加载完成后执行
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTypingEffect();
    initScrollAnimations();
    initBackToTop();
    initNavbarScroll();
});

// ========================================
// 导航菜单功能
// ========================================
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // 点击导航链接后关闭菜单
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
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
    const animatedElements = document.querySelectorAll(
        '.nav-card, .blog-item, .plan-item, .section-title, .section-subtitle'
    );
    
    animatedElements.forEach(el => {
        el.classList.add('reveal');
    });
    
    // 创建 Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // 可选：动画触发后停止观察
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 观察所有带有 reveal 类的元素
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// ========================================
// 返回顶部功能
// ========================================
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
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
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
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
        const later = () => {
            clearTimeout(timeout);
            func(...args);
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

// ========================================
// 页面加载动画
// ========================================
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Hero 区域元素动画
    const heroElements = document.querySelectorAll('.hero-avatar, .hero-title, .hero-subtitle, .hero-description, .hero-buttons');
    heroElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 300 + index * 150);
    });
});

// ========================================
// 鼠标跟随效果（可选）
// ========================================
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', throttle((e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
}, 16)); // 约 60fps

// 为可点击元素添加悬停效果
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});