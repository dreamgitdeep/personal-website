/**
 * 关于页面专用脚本
 * 从JSON数据动态加载个人信息和兴趣爱好
 */

// 数据缓存
let aboutData = null;
let galleryData = {};

document.addEventListener('DOMContentLoaded', async function() {
    // 加载数据
    await loadAboutData();
    
    // 初始化功能
    initInterestGallery();
    initHobbyCardsAnimation();
});

/**
 * 加载关于我数据
 */
async function loadAboutData() {
    try {
        const response = await fetch('data/about.json');
        aboutData = await response.json();
        
        // 更新个人信息
        updateProfile();
        
        // 更新兴趣爱好
        updateHobbies();
        
        console.log('✅ 关于我数据加载成功');
    } catch (error) {
        console.error('❌ 关于我数据加载失败:', error);
    }
}

/**
 * 更新个人信息显示
 */
function updateProfile() {
    if (!aboutData || !aboutData.profile) return;
    
    const profile = aboutData.profile;
    
    // 更新头像
    const avatarImg = document.querySelector('.intro-image img');
    if (avatarImg && profile.avatar) {
        avatarImg.src = profile.avatar;
    }
    
    // 更新名称
    const nameEl = document.querySelector('.intro-content h2');
    if (nameEl) {
        nameEl.textContent = `你好，我是${profile.name || '秋千'}`;
    }
    
    // 更新标语
    const taglineEl = document.querySelector('.intro-tagline');
    if (taglineEl && profile.title) {
        taglineEl.textContent = profile.title;
    }
    
    // 更新简介
    if (aboutData.about && aboutData.about.story) {
        const introText = document.querySelector('.intro-text');
        if (introText) {
            introText.innerHTML = aboutData.about.story
                .map(p => `<p>${p}</p>`)
                .join('');
        }
    }
}

/**
 * 更新兴趣爱好显示
 */
function updateHobbies() {
    if (!aboutData || !aboutData.hobbies) return;
    
    const hobbiesGrid = document.querySelector('.hobbies-grid');
    if (!hobbiesGrid) return;
    
    // 清空现有内容
    hobbiesGrid.innerHTML = '';
    
    // 渲染每个爱好卡片
    aboutData.hobbies.forEach((hobby, index) => {
        const card = createHobbyCard(hobby);
        hobbiesGrid.appendChild(card);
        
        // 延迟添加动画类
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

/**
 * 创建爱好卡片
 */
function createHobbyCard(hobby) {
    const card = document.createElement('div');
    card.className = 'hobby-card';
    card.dataset.interest = hobby.name.toLowerCase();
    card.onclick = () => window.location.href = hobby.link;
    
    // 使用占位图作为背景
    const placeholderColors = {
        '徒步': 'c4b5fd/7c3aed',
        '旅游': 'fbcfe8/db2777',
        '骑行': 'bfdbfe/3b82f6',
        '钩织': 'fde68a/d97706',
        '绘画': 'a7f3d0/059669'
    };
    
    const color = placeholderColors[hobby.name] || 'e0c3fc/8b5cf6';
    
    card.innerHTML = `
        <div class="hobby-image">
            <img src="images/hobbies/${hobby.name.toLowerCase()}/cover.jpg" 
                 alt="${hobby.name}" 
                 onerror="this.src='https://placehold.co/400x300/${color}?text=${encodeURIComponent(hobby.name)}'">
            <div class="hobby-photos-count">📸 点击查看</div>
        </div>
        <div class="hobby-content">
            <div class="hobby-icon">
                <i class="${hobby.icon}"></i>
            </div>
            <h3>${hobby.name}</h3>
            <p>${hobby.description}</p>
        </div>
    `;
    
    return card;
}

/**
 * 时间轴动画
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
                setTimeout(() => {
                    entry.target.classList.add('show');
                }, index * 200);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    timelineItems.forEach(item => {
        observer.observe(item);
    });
}

/**
 * 兴趣爱好卡片动画
 */
function initHobbyCardsAnimation() {
    const hobbyCards = document.querySelectorAll('.hobby-card');
    
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
    
    hobbyCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
}

/**
 * 兴趣爱好图片画廊
 */
async function initInterestGallery() {
    console.log('初始化兴趣画廊...');
    
    // 加载各相册数据
    const albums = ['hiking', 'travel', 'cycling', 'crocheting', 'painting'];
    for (const album of albums) {
        try {
            const response = await fetch(`data/gallery/${album}.json`);
            const data = await response.json();
            galleryData[album] = {
                title: data.album.name,
                images: data.photos.map(p => p.url || p.thumbnail)
            };
        } catch (e) {
            console.log(`相册 ${album} 数据未找到`);
        }
    }
    
    // 徒步相册特殊处理（使用本地图片）
    if (!galleryData.hiking || galleryData.hiking.images.length === 0) {
        galleryData.hiking = {
            title: '徒步相册',
            images: [
                'images/hobbies/hiking/微信图片_20260223195753_377_229.jpg',
                'images/hobbies/hiking/微信图片_20260223195758_378_229.jpg',
                'images/hobbies/hiking/微信图片_20260223195800_379_229.jpg',
                'images/hobbies/hiking/微信图片_20260223195804_380_229.jpg',
                'images/hobbies/hiking/微信图片_20260223195809_381_229.jpg',
                'images/hobbies/hiking/微信图片_20260223195814_382_229.jpg',
                'images/hobbies/hiking/微信图片_20260223195820_383_229.jpg',
                'images/hobbies/hiking/微信图片_20260223195834_384_229.jpg',
                'images/hobbies/hiking/微信图片_20260223195856_385_229.jpg',
                'images/hobbies/hiking/微信图片_20260223200605_386_229.jpg',
                'images/hobbies/hiking/微信图片_20260223200609_387_229.jpg',
                'images/hobbies/hiking/微信图片_20260223200614_388_229.jpg',
                'images/hobbies/hiking/微信图片_20260223200617_389_229.jpg',
                'images/hobbies/hiking/微信图片_20260223200621_390_229.jpg',
                'images/hobbies/hiking/微信图片_20260223200625_391_229.jpg',
                'images/hobbies/hiking/微信图片_20260223200631_392_229.jpg'
            ]
        };
    }
    
    const galleryModal = document.getElementById('galleryModal');
    if (!galleryModal) return;
    
    const galleryOverlay = document.querySelector('.gallery-overlay');
    const galleryClose = document.getElementById('galleryClose');
    const galleryImage = document.getElementById('galleryImage');
    const galleryTitle = document.getElementById('galleryTitle');
    const galleryCounter = document.getElementById('galleryCounter');
    const galleryPrev = document.getElementById('galleryPrev');
    const galleryNext = document.getElementById('galleryNext');
    const galleryThumbnails = document.getElementById('galleryThumbnails');

    let currentImages = [];
    let currentIndex = 0;

    // 打开画廊
    function openGallery(interest) {
        const data = galleryData[interest];
        if (!data || data.images.length === 0) return;

        currentImages = data.images;
        currentIndex = 0;

        galleryTitle.textContent = data.title;
        document.body.style.overflow = 'hidden';
        galleryModal.classList.add('active');

        showImage(0);
        createThumbnails();
    }

    // 关闭画廊
    function closeGallery() {
        galleryModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // 显示指定索引的图片
    function showImage(index) {
        if (currentImages.length === 0) return;

        currentIndex = index;
        galleryImage.src = currentImages[currentIndex];
        galleryCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;

        const thumbnails = galleryThumbnails.querySelectorAll('.gallery-thumbnail');
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === currentIndex);
        });

        const activeThumbnail = thumbnails[currentIndex];
        if (activeThumbnail) {
            activeThumbnail.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }

    // 创建缩略图
    function createThumbnails() {
        galleryThumbnails.innerHTML = '';
        
        currentImages.forEach((src, index) => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'gallery-thumbnail';
            img.addEventListener('click', () => showImage(index));
            galleryThumbnails.appendChild(img);
        });
    }

    // 下一张图片
    function nextImage() {
        const nextIndex = (currentIndex + 1) % currentImages.length;
        showImage(nextIndex);
    }

    // 上一张图片
    function prevImage() {
        const prevIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        showImage(prevIndex);
    }

    // 点击兴趣卡片打开画廊
    document.querySelectorAll('.hobby-card[data-interest]').forEach(card => {
        card.addEventListener('click', function(e) {
            const interest = this.getAttribute('data-interest');
            if (galleryData[interest]) {
                e.preventDefault();
                e.stopPropagation();
                openGallery(interest);
            }
        });
    });

    galleryClose.addEventListener('click', closeGallery);
    galleryOverlay.addEventListener('click', closeGallery);
    galleryPrev.addEventListener('click', prevImage);
    galleryNext.addEventListener('click', nextImage);

    // 键盘导航
    document.addEventListener('keydown', function(e) {
        if (!galleryModal.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeGallery();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    });

    // 触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;

    galleryModal.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });

    galleryModal.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextImage();
            } else {
                prevImage();
            }
        }
    }
    
    console.log('兴趣画廊初始化完成');
}

// 页面加载完成后初始化所有动画
window.addEventListener('load', function() {
    initTimelineAnimations();
});
