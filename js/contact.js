/**
 * 留言板系统（简化版）
 * 功能：留言发表、回复、点赞点踩
 */

document.addEventListener('DOMContentLoaded', function() {
    initGuestbook();
    initCharCount();
    initReplyCharCount();
});

/**
 * 初始化留言板
 */
function initGuestbook() {
    const form = document.getElementById('guestbookForm');
    if (!form) return;
    
    // 加载留言
    loadMessages();
    
    // 表单提交
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nickname = document.getElementById('guestName').value.trim();
        const message = document.getElementById('guestMessage').value.trim();
        
        if (!nickname || nickname.length < 1) {
            showToast('请输入昵称', 'error');
            return;
        }
        
        if (!message || message.length < 2) {
            showToast('留言内容至少2个字符', 'error');
            return;
        }
        
        // 创建留言对象
        const newMessage = {
            id: Date.now(),
            nickname: nickname,
            avatar: getRandomAvatar(),
            message: message,
            time: new Date().toLocaleString('zh-CN'),
            likes: 0,
            dislikes: 0,
            replies: []
        };
        
        // 保存留言
        saveMessage(newMessage);
        
        // 保存昵称
        localStorage.setItem('guestNickname', nickname);
        
        // 显示留言
        displayMessage(newMessage, true);
        
        // 更新计数
        updateMessageCount();
        
        // 清空留言内容（保留昵称）
        document.getElementById('guestMessage').value = '';
        document.getElementById('charCount').textContent = '0';
        
        showToast('留言发表成功！🎉', 'success');
    });
}

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
 * 获取随机头像颜色
 */
function getRandomAvatar() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8B500', '#FF8C00'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 保存留言
 */
function saveMessage(message) {
    let messages = getMessages();
    messages.unshift(message);
    if (messages.length > 50) {
        messages = messages.slice(0, 50);
    }
    localStorage.setItem('guestbookMessages', JSON.stringify(messages));
}

/**
 * 更新留言数据
 */
function updateMessageData(messageId, updates) {
    let messages = getMessages();
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
        messages[index] = { ...messages[index], ...updates };
        localStorage.setItem('guestbookMessages', JSON.stringify(messages));
    }
}

/**
 * 获取所有留言
 */
function getMessages() {
    const saved = localStorage.getItem('guestbookMessages');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return [];
        }
    }
    return [];
}

/**
 * 加载并显示所有留言
 */
function loadMessages() {
    const messages = getMessages();
    const container = document.getElementById('messagesContainer');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    // 恢复保存的昵称
    const savedNickname = localStorage.getItem('guestNickname');
    if (savedNickname) {
        const nicknameInput = document.getElementById('guestName');
        if (nicknameInput) {
            nicknameInput.value = savedNickname;
        }
    }
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="no-messages">
                <i class="fas fa-comment-slash"></i>
                <p>还没有留言，来做第一个留言的人吧！</p>
            </div>
        `;
    } else {
        messages.forEach(msg => displayMessage(msg, false));
    }
    
    updateMessageCount();
}

/**
 * 显示单条留言
 */
function displayMessage(message, prepend = false) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    const noMessages = container.querySelector('.no-messages');
    if (noMessages) noMessages.remove();
    
    if (message.likes === undefined) message.likes = 0;
    if (message.dislikes === undefined) message.dislikes = 0;
    if (!message.replies) message.replies = [];
    
    const messageEl = document.createElement('div');
    messageEl.className = 'message-item';
    messageEl.id = `message-${message.id}`;
    
    let repliesHtml = '';
    if (message.replies.length > 0) {
        repliesHtml = `
            <div class="replies-container">
                ${message.replies.map(reply => `
                    <div class="reply-item">
                        <div class="reply-avatar" style="background: ${reply.avatar}">
                            ${reply.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div class="reply-content">
                            <div class="reply-header">
                                <span class="reply-nickname">${escapeHtml(reply.nickname)}</span>
                                <span class="reply-time">${reply.time}</span>
                            </div>
                            <p class="reply-text">${escapeHtml(reply.message)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    messageEl.innerHTML = `
        <div class="message-avatar" style="background: ${message.avatar}">
            ${message.nickname.charAt(0).toUpperCase()}
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-nickname">${escapeHtml(message.nickname)}</span>
                <span class="message-time">${message.time}</span>
                <button class="delete-btn" onclick="deleteMessage(${message.id})" title="删除">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <p class="message-text">${escapeHtml(message.message)}</p>
            <div class="message-actions">
                <button class="vote-btn like-btn" onclick="handleVote(${message.id}, 'like')">
                    <i class="fas fa-thumbs-up"></i>
                    <span class="vote-count">${message.likes}</span>
                </button>
                <button class="vote-btn dislike-btn" onclick="handleVote(${message.id}, 'dislike')">
                    <i class="fas fa-thumbs-down"></i>
                    <span class="vote-count">${message.dislikes}</span>
                </button>
                <button class="reply-btn" onclick="showReplyModal(${message.id})">
                    <i class="fas fa-reply"></i> 回复
                </button>
            </div>
            ${repliesHtml}
        </div>
    `;
    
    if (prepend) {
        container.prepend(messageEl);
        messageEl.style.animation = 'slideIn 0.3s ease';
    } else {
        container.appendChild(messageEl);
    }
}

/**
 * 当前回复的留言ID
 */
let currentReplyId = null;

/**
 * 显示回复弹窗
 */
function showReplyModal(messageId) {
    currentReplyId = messageId;
    const messages = getMessages();
    const message = messages.find(m => m.id === messageId);
    
    if (message) {
        document.getElementById('replyToInfo').innerHTML = `
            <div class="reply-preview">
                <strong>回复 ${escapeHtml(message.nickname)}：</strong>
                <p>${escapeHtml(message.message.substring(0, 50))}${message.message.length > 50 ? '...' : ''}</p>
            </div>
        `;
    }
    
    // 恢复保存的昵称
    const savedNickname = localStorage.getItem('guestNickname');
    if (savedNickname) {
        document.getElementById('replyNickname').value = savedNickname;
    }
    
    document.getElementById('replyModal').classList.add('show');
    document.getElementById('replyContent').focus();
}

/**
 * 隐藏回复弹窗
 */
function hideReplyModal() {
    document.getElementById('replyModal').classList.remove('show');
    document.getElementById('replyContent').value = '';
    document.getElementById('replyCharCount').textContent = '0';
    currentReplyId = null;
}

/**
 * 提交回复
 */
document.getElementById('replyForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nickname = document.getElementById('replyNickname').value.trim();
    const content = document.getElementById('replyContent').value.trim();
    
    if (!nickname || nickname.length < 1) {
        showToast('请输入昵称', 'error');
        return;
    }
    
    if (!content || content.length < 2) {
        showToast('回复内容至少2个字符', 'error');
        return;
    }
    
    if (!currentReplyId) return;
    
    const messages = getMessages();
    const messageIndex = messages.findIndex(m => m.id === currentReplyId);
    
    if (messageIndex === -1) return;
    
    const reply = {
        id: Date.now(),
        nickname: nickname,
        avatar: getRandomAvatar(),
        message: content,
        time: new Date().toLocaleString('zh-CN')
    };
    
    if (!messages[messageIndex].replies) {
        messages[messageIndex].replies = [];
    }
    messages[messageIndex].replies.push(reply);
    
    localStorage.setItem('guestbookMessages', JSON.stringify(messages));
    
    // 保存昵称
    localStorage.setItem('guestNickname', nickname);
    
    // 重新加载留言
    loadMessages();
    hideReplyModal();
    showToast('回复成功！', 'success');
});

/**
 * 处理点赞/点踩
 */
function handleVote(messageId, voteType) {
    const messages = getMessages();
    const message = messages.find(m => m.id === messageId);
    
    if (!message) return;
    
    if (voteType === 'like') {
        message.likes = (message.likes || 0) + 1;
    } else {
        message.dislikes = (message.dislikes || 0) + 1;
    }
    
    updateMessageData(messageId, {
        likes: message.likes,
        dislikes: message.dislikes
    });
    
    const messageEl = document.getElementById(`message-${messageId}`);
    if (messageEl) {
        if (voteType === 'like') {
            const likeBtn = messageEl.querySelector('.like-btn');
            likeBtn.querySelector('.vote-count').textContent = message.likes;
        } else {
            const dislikeBtn = messageEl.querySelector('.dislike-btn');
            dislikeBtn.querySelector('.vote-count').textContent = message.dislikes;
        }
    }
    
    showToast(voteType === 'like' ? '点赞成功！👍' : '已记录你的反馈', 'success');
}

/**
 * 更新留言计数
 */
function updateMessageCount() {
    const countEl = document.getElementById('messageCount');
    if (countEl) {
        const count = getMessages().length;
        countEl.textContent = `${count} 条留言`;
    }
}

/**
 * 删除留言（需要管理员密码）
 */
function deleteMessage(messageId) {
    // 管理员密码（可以修改为你自己的密码）
    const ADMIN_PASSWORD = 'qiuqian123';
    
    const password = prompt('请输入管理员密码：');
    if (password !== ADMIN_PASSWORD) {
        if (password !== null) {
            showToast('密码错误！', 'error');
        }
        return;
    }
    
    if (!confirm('确定要删除这条留言吗？')) return;
    
    let messages = getMessages();
    messages = messages.filter(m => m.id !== messageId);
    localStorage.setItem('guestbookMessages', JSON.stringify(messages));
    
    // 移除DOM元素
    const messageEl = document.getElementById(`message-${messageId}`);
    if (messageEl) {
        messageEl.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            messageEl.remove();
            // 检查是否还有留言
            if (messages.length === 0) {
                const container = document.getElementById('messagesContainer');
                container.innerHTML = `
                    <div class="no-messages">
                        <i class="fas fa-comment-slash"></i>
                        <p>还没有留言，来做第一个留言的人吧！</p>
                    </div>
                `;
            }
        }, 300);
    }
    
    updateMessageCount();
    showToast('留言已删除', 'success');
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
