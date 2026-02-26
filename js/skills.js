/**
 * 技能页面专用脚本
 * 包含：技能分类筛选功能、技能进度条动画、兴趣图片画廊
 */

document.addEventListener('DOMContentLoaded', function() {
    initSkillTabs();
    initSkillCardsAnimation();
    initSkillProgressAnimation();
    initInterestCardsAnimation();
    initInterestGallery();
});

/**
 * 初始化技能分类标签功能
 */
function initSkillTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const skillCards = document.querySelectorAll('.skill-card');
    const skillsGrid = document.querySelector('.skills-grid');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有活跃状态
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // 添加当前按钮活跃状态
            this.classList.add('active');
            
            // 获取筛选类别
            const category = this.getAttribute('data-tab');
            
            // 重置网格显示
            skillsGrid.style.opacity = '0';
            skillsGrid.style.transform = 'translateY(20px)';
            
            // 筛选技能卡片
            let visibleCount = 0;
            skillCards.forEach((card, index) => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.classList.remove('hidden', 'hide');
                    // 延迟显示，创建依次出现的效果
                    setTimeout(() => {
                        card.style.transition = 'all 0.5s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                    visibleCount++;
                } else {
                    card.classList.add('hide');
                    setTimeout(() => {
                        card.classList.add('hidden');
                    }, 300);
                }
            });
            
            // 重新触发网格显示动画
            setTimeout(() => {
                skillsGrid.style.transition = 'all 0.6s ease';
                skillsGrid.style.opacity = '1';
                skillsGrid.style.transform = 'translateY(0)';
            }, 50);
            
            // 如果没有匹配的结果，显示提示
            updateNoResultsMessage(skillsGrid, visibleCount);
        });
    });
}

/**
 * 初始化技能卡片动画
 */
function initSkillCardsAnimation() {
    const skillCards = document.querySelectorAll('.skill-card:not(.hidden)');
    
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
    
    skillCards.forEach(card => {
        card.classList.add('skill-card');
        observer.observe(card);
    });
}

/**
 * 初始化技能进度条动画
 * 当技能卡片进入视口时触发进度条填充动画
 */
function initSkillProgressAnimation() {
    const skillCards = document.querySelectorAll('.skill-card.show .skill-progress');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
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
    
    skillCards.forEach(progressBar => {
        observer.observe(progressBar);
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

/**
 * 更新无结果提示
 */
function updateNoResultsMessage(container, visibleCount) {
    const existingMessage = container.querySelector('.no-results');
    
    if (visibleCount === 0) {
        if (!existingMessage) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--primary-light); margin-bottom: 20px; display: block;"></i>
                    <p style="font-size: 1.2rem;">没有找到相关技能</p>
                </div>
            `;
            container.appendChild(noResults);
        }
    } else {
        if (existingMessage) {
            existingMessage.remove();
        }
    }
}

// 页面加载完成后初始化兴趣爱好卡片动画
window.addEventListener('load', initInterestCardsAnimation);

/**
 * 兴趣爱好图片画廊
 */
function initInterestGallery() {
    console.log('初始化兴趣画廊...');
    
    const interestCards = document.querySelectorAll('.interest-card[data-interest]');
    console.log('找到的兴趣卡片数量:', interestCards.length);
    
    const galleryModal = document.getElementById('galleryModal');
    const galleryOverlay = document.querySelector('.gallery-overlay');
    const galleryClose = document.getElementById('galleryClose');
    const galleryImage = document.getElementById('galleryImage');
    const galleryTitle = document.getElementById('galleryTitle');
    const galleryCounter = document.getElementById('galleryCounter');
    const galleryPrev = document.getElementById('galleryPrev');
    const galleryNext = document.getElementById('galleryNext');
    const galleryThumbnails = document.getElementById('galleryThumbnails');

    console.log('模态框元素:', galleryModal ? '找到' : '未找到');
    console.log('图片元素:', galleryImage ? '找到' : '未找到');

    let currentImages = [];
    let currentIndex = 0;

    // 图片数据配置
    const galleryData = {
        hiking: {
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
        }
    };

    // 打开画廊
    function openGallery(interest) {
        console.log('打开画廊:', interest);
        const data = galleryData[interest];
        if (!data) {
            console.log('未找到画廊数据:', interest);
            return;
        }

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
        currentImages = [];
        currentIndex = 0;
    }

    // 显示指定索引的图片
    function showImage(index) {
        if (currentImages.length === 0) return;

        currentIndex = index;
        const imageSrc = currentImages[currentIndex];
        
        galleryImage.src = imageSrc;
        galleryCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;

        // 更新缩略图激活状态
        const thumbnails = galleryThumbnails.querySelectorAll('.gallery-thumbnail');
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === currentIndex);
        });

        // 滚动缩略图到可见区域
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

    // 事件监听
    interestCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const interest = this.getAttribute('data-interest');
            console.log('点击了兴趣卡片:', interest);
            if (galleryData[interest]) {
                openGallery(interest);
            } else {
                console.log('没有找到对应的数据');
            }
        });
    });
    
    console.log('兴趣画廊初始化完成，已绑定', interestCards.length, '个卡片');

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
}