/**
 * 技能页面专用脚本
 * 包含：技能分类筛选功能、技能进度条动画
 */

document.addEventListener('DOMContentLoaded', function() {
    initSkillTabs();
    initSkillProgressAnimation();
});

/**
 * 初始化技能分类标签功能
 */
function initSkillTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const skillCards = document.querySelectorAll('.skill-card');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有活跃状态
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // 添加当前按钮活跃状态
            this.classList.add('active');
            
            // 获取筛选类别
            const category = this.getAttribute('data-tab');
            
            // 筛选技能卡片
            skillCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.classList.remove('hidden');
                    // 添加淡入动画
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

/**
 * 初始化技能进度条动画
 * 当技能卡片进入视口时触发进度条填充动画
 */
function initSkillProgressAnimation() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.skill-progress');
                if (progressBar) {
                    // 获取目标宽度
                    const targetWidth = progressBar.style.width;
                    // 先重置为0
                    progressBar.style.width = '0';
                    // 延迟后填充到目标宽度
                    setTimeout(() => {
                        progressBar.style.width = targetWidth;
                    }, 200);
                }
                
                // 动画触发后停止观察
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    skillCards.forEach(card => {
        observer.observe(card);
    });
}

/**
 * 兴趣爱好卡片动画
 */
function initInterestCardsAnimation() {
    const interestCards = document.querySelectorAll('.interest-card');
    
    const observerOptions = {
        threshold: 0.2,
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
    
    interestCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

// 页面加载完成后初始化兴趣爱好卡片动画
window.addEventListener('load', initInterestCardsAnimation);