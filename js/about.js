/**
 * 关于页面脚本
 * 只负责加载个人信息与时间轴动画
 */

let aboutData = null;

document.addEventListener('DOMContentLoaded', async function() {
    await loadAboutData();
    initTimelineAnimations();
});

async function loadAboutData() {
    try {
        const response = await fetch('data/about.json');
        aboutData = await response.json();
        updateProfile();
        console.log('✅ 关于我数据加载成功');
    } catch (error) {
        console.error('❌ 关于我数据加载失败:', error);
    }
}

function updateProfile() {
    if (!aboutData || !aboutData.profile) return;

    const profile = aboutData.profile;
    const avatarImg = document.querySelector('.intro-image img');
    if (avatarImg && profile.avatar) {
        avatarImg.src = profile.avatar;
    }
    const nameEl = document.querySelector('.intro-content h2');
    if (nameEl) {
        nameEl.textContent = `你好，我是${profile.name || '秋千'}`;
    }
    const taglineEl = document.querySelector('.intro-tagline');
    if (taglineEl && profile.title) {
        taglineEl.textContent = profile.title;
    }
    if (aboutData.about && aboutData.about.story) {
        const introText = document.querySelector('.intro-text');
        if (introText) {
            introText.innerHTML = aboutData.about.story
                .map(p => `<p>${p}</p>`)
                .join('');
        }
    }
}

function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
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
    timelineItems.forEach(item => observer.observe(item));
}
