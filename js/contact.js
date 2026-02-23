/**
 * 联系页面专用脚本
 * 包含：表单提交、提示弹窗
 */

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
});

/**
 * 初始化联系表单
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 获取表单数据
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 验证表单
        if (!validateForm(data)) {
            return;
        }
        
        // 模拟提交过程
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';
        submitBtn.disabled = true;
        
        // 模拟网络请求延迟
        setTimeout(() => {
            // 恢复按钮状态
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // 显示成功提示
            showToast('消息已发送成功！我会尽快回复你 💜');
            
            // 重置表单
            form.reset();
            
            // 在实际应用中，这里应该发送数据到服务器
            console.log('表单数据:', data);
            
        }, 1500);
    });
}

/**
 * 验证表单数据
 * @param {Object} data - 表单数据
 * @returns {boolean} - 验证结果
 */
function validateForm(data) {
    // 验证姓名
    if (!data.name || data.name.trim().length < 2) {
        showToast('请输入有效的姓名（至少2个字符）', 'error');
        return false;
    }
    
    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        showToast('请输入有效的电子邮箱地址', 'error');
        return false;
    }
    
    // 验证主题
    if (!data.subject) {
        showToast('请选择一个主题', 'error');
        return false;
    }
    
    // 验证留言内容
    if (!data.message || data.message.trim().length < 10) {
        showToast('留言内容至少需要10个字符', 'error');
        return false;
    }
    
    return true;
}

/**
 * 显示提示弹窗
 * @param {string} message - 提示消息
 * @param {string} type - 提示类型 ('success' | 'error')
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // 设置消息内容
    toast.innerHTML = type === 'success' 
        ? `<i class="fas fa-check-circle"></i><span>${message}</span>`
        : `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    
    // 设置颜色
    if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    } else {
        toast.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
    }
    
    // 显示弹窗
    toast.classList.add('show');
    
    // 3秒后隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * 输入框焦点效果
 */
document.querySelectorAll('.form-group input, .form-group textarea, .form-group select').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

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
