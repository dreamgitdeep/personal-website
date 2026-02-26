document.addEventListener('DOMContentLoaded', function() {
    initCharCount();
    initReplyCharCount();
});

/**
 * 字符计数
 */
function initCharCount() {
    const textarea = document.getElementById('guestMessage');
    const charCount = document.getElementById('charCount');
    
    if (!textarea || !charCount) return;
    
    textarea.addEventListener('input', function() {
        charCount.textContent = this.value.length;
        charCount.style.color = this.value.length >= 180 ? '#ef4444' : 'var(--text-secondary)';
    });
}

/**
 * 回复字符计数
 */
function initReplyCharCount() {
    const textarea = document.getElementById('replyContent');
    const charCount = document.getElementById('replyCharCount');
    
    if (!textarea || !charCount) return;
    
    textarea.addEventListener('input', function() {
        charCount.textContent = this.value.length;
        charCount.style.color = this.value.length >= 180 ? '#ef4444' : 'var(--text-secondary)';
    });
}

/**
 * 复制邮箱地址
 */
function copyEmail() {
    const email = document.getElementById('ownerEmail').textContent;
    navigator.clipboard.writeText(email).then(() => {
        showToast('邮箱已复制到剪贴板！📋', 'success');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('邮箱已复制到剪贴板！📋', 'success');
    });
}

/**
 * 显示提示弹窗
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.innerHTML = type === 'success' 
        ? `<i class="fas fa-check-circle"></i><span>${message}</span>`
        : `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    
    toast.style.background = type === 'error' 
        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
        : 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * 社交媒体卡片动画
 */
function initSocialCardsAnimation() {
    const socialCards = document.querySelectorAll('.social-card');
    
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
    
    socialCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
}

// 页面加载完成后初始化动画
window.addEventListener('load', initSocialCardsAnimation);
