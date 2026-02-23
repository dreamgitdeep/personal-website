/**
 * 关于页面专用脚本
 * 包含：证书图片放大查看功能
 */

document.addEventListener('DOMContentLoaded', function() {
    initCertificateModal();
});

/**
 * 初始化证书图片弹窗功能
 */
function initCertificateModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.querySelector('.modal-caption');
    const closeBtn = document.querySelector('.modal-close');
    const certificateCards = document.querySelectorAll('.certificate-card');
    
    // 如果没有弹窗元素，直接返回
    if (!modal || !modalImg) return;
    
    // 点击证书卡片打开弹窗
    certificateCards.forEach(card => {
        card.addEventListener('click', function() {
            const img = this.querySelector('img');
            const title = this.querySelector('h3').textContent;
            const year = this.querySelector('p').textContent;
            
            if (img) {
                modalImg.src = img.src;
                modalCaption.textContent = `${title} - ${year}`;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // 禁止背景滚动
            }
        });
    });
    
    // 点击关闭按钮关闭弹窗
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // 点击弹窗背景关闭弹窗
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    /**
     * 关闭弹窗
     */
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // 恢复背景滚动
        
        // 延迟清空图片，等待动画完成
        setTimeout(() => {
            modalImg.src = '';
            modalCaption.textContent = '';
        }, 300);
    }
}

/**
 * 时间轴动画
 * 元素进入视口时触发动画
 */
function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // 延迟动画，创建依次出现的效果
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 200);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });
}

// 页面加载完成后初始化时间轴动画
window.addEventListener('load', initTimelineAnimations);