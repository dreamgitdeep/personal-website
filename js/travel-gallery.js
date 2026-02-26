/**
 * 旅游相册页面脚本
 * 功能：从JSON配置文件加载照片数据，实现瀑布流展示、照片查看、备注编辑
 */

document.addEventListener('DOMContentLoaded', function() {
    initPhotoGallery();
    initPhotoModal();
    loadSavedCaptions();
});

// 照片数据
let photoData = [];
let currentPhotoIndex = 0;

/**
 * 从配置数据加载照片
 */
async function initPhotoGallery() {
    try {
        // 使用直接定义的数据（支持file://协议）
        if (typeof TRAVEL_PHOTOS_DATA !== 'undefined') {
            photoData = TRAVEL_PHOTOS_DATA.photos;
        } else {
            // 如果数据文件未加载，尝试fetch方式
            try {
                const response = await fetch('data/travel-photos.json');
                if (response.ok) {
                    const config = await response.json();
                    photoData = config.photos;
                }
            } catch (fetchError) {
                console.warn('无法加载配置文件，使用空数据');
            }
        }
        
        // 更新照片计数
        updatePhotoCount();
        
        // 渲染照片瀑布流
        renderPhotoGallery();
        
    } catch (error) {
        console.error('加载照片数据失败:', error);
        showEmptyState();
    }
}

/**
 * 更新照片计数显示
 */
function updatePhotoCount() {
    const photoCountElement = document.getElementById('photoCount');
    if (photoCountElement && photoData.length > 0) {
        photoCountElement.textContent = `共 ${photoData.length} 张照片`;
    }
}

/**
 * 渲染照片瀑布流
 */
function renderPhotoGallery() {
    const galleryMasonry = document.getElementById('galleryMasonry');
    
    if (!galleryMasonry || photoData.length === 0) {
        showEmptyState();
        return;
    }
    
    // 清空现有内容
    galleryMasonry.innerHTML = '';
    
    // 按顺序渲染照片
    photoData.forEach((photo, index) => {
        const photoCard = createPhotoCard(photo, index);
        galleryMasonry.appendChild(photoCard);
    });
    
    // 图片加载动画
    animatePhotoLoading();
}

/**
 * 创建照片卡片
 */
function createPhotoCard(photo, index) {
    const photoCard = document.createElement('div');
    photoCard.className = 'photo-card';
    photoCard.dataset.index = index;
    
    const imagePath = `images/hobbies/travel/${photo.file}`;
    
    photoCard.innerHTML = `
        <img src="${imagePath}" alt="旅游照片 ${photo.id}" loading="lazy">
        <div class="photo-number">${photo.id}</div>
        <div class="photo-overlay">
            <p class="photo-caption ${!photo.caption ? 'empty' : ''}">
                ${photo.caption || '点击查看详情'}
            </p>
        </div>
    `;
    
    // 点击打开模态框
    photoCard.addEventListener('click', () => openPhotoModal(index));
    
    return photoCard;
}

/**
 * 图片加载动画
 */
function animatePhotoLoading() {
    const galleryMasonry = document.getElementById('galleryMasonry');
    const images = galleryMasonry.querySelectorAll('img');
    
    images.forEach((img, index) => {
        img.style.opacity = '0';
        img.onload = function() {
            setTimeout(() => {
                img.style.transition = 'opacity 0.5s ease';
                img.style.opacity = '1';
            }, index * 50);
        };
        
        // 处理加载失败的情况
        img.onerror = function() {
            console.error('图片加载失败:', img.src);
            img.parentElement.innerHTML = `
                <div class="image-error">
                    <i class="fas fa-image"></i>
                    <p>图片加载失败</p>
                </div>
            `;
        };
    });
}

/**
 * 显示空状态
 */
function showEmptyState() {
    const galleryMasonry = document.getElementById('galleryMasonry');
    
    galleryMasonry.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-plane-departure"></i>
            <h3>暂无旅游照片</h3>
            <p>请将旅游照片放入 <code>images/hobbies/travel/</code> 文件夹</p>
            <p class="hint">支持 jpg、png 格式的图片文件</p>
        </div>
    `;
    
    const photoCountElement = document.getElementById('photoCount');
    if (photoCountElement) {
        photoCountElement.textContent = '暂无照片';
    }
}

/**
 * 初始化照片查看模态框
 */
function initPhotoModal() {
    const modal = document.getElementById('photoModal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalClose = document.getElementById('modalClose');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');
    const editCaptionBtn = document.getElementById('editCaptionBtn');
    const saveCaptionBtn = document.getElementById('saveCaption');
    const cancelCaptionBtn = document.getElementById('cancelCaption');
    
    // 关闭模态框
    modalClose.addEventListener('click', closePhotoModal);
    modalOverlay.addEventListener('click', closePhotoModal);
    
    // 上一张/下一张
    modalPrev.addEventListener('click', () => navigatePhoto(-1));
    modalNext.addEventListener('click', () => navigatePhoto(1));
    
    // 编辑备注
    editCaptionBtn.addEventListener('click', showCaptionEditor);
    saveCaptionBtn.addEventListener('click', saveCaption);
    cancelCaptionBtn.addEventListener('click', hideCaptionEditor);
    
    // 键盘导航
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // 触摸滑动
    initTouchNavigation();
}

/**
 * 键盘导航
 */
function handleKeyboardNavigation(e) {
    const modal = document.getElementById('photoModal');
    if (!modal.classList.contains('active')) return;
    
    switch(e.key) {
        case 'Escape':
            closePhotoModal();
            break;
        case 'ArrowLeft':
            navigatePhoto(-1);
            break;
        case 'ArrowRight':
            navigatePhoto(1);
            break;
    }
}

/**
 * 触摸滑动导航
 */
function initTouchNavigation() {
    const modal = document.getElementById('photoModal');
    let touchStartX = 0;
    let touchEndX = 0;
    
    modal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    modal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe(touchStartX, touchEndX);
    });
}

/**
 * 处理滑动
 */
function handleSwipe(startX, endX) {
    const swipeThreshold = 50;
    const diff = startX - endX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            navigatePhoto(1);
        } else {
            navigatePhoto(-1);
        }
    }
}

/**
 * 打开照片模态框
 */
function openPhotoModal(index) {
    currentPhotoIndex = index;
    const modal = document.getElementById('photoModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const modalCounter = document.getElementById('modalCounter');
    
    const photo = photoData[currentPhotoIndex];
    const imagePath = `images/hobbies/travel/${photo.file}`;
    
    modalImage.src = imagePath;
    modalCaption.textContent = photo.caption || '暂无备注';
    modalCounter.textContent = `${currentPhotoIndex + 1} / ${photoData.length}`;
    
    // 如果备注为空，显示提示
    if (!photo.caption) {
        modalCaption.style.opacity = '0.6';
        modalCaption.style.fontStyle = 'italic';
    } else {
        modalCaption.style.opacity = '1';
        modalCaption.style.fontStyle = 'normal';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 隐藏编辑器
    hideCaptionEditor();
}

/**
 * 关闭照片模态框
 */
function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    hideCaptionEditor();
}

/**
 * 切换照片
 */
function navigatePhoto(direction) {
    currentPhotoIndex += direction;
    
    if (currentPhotoIndex < 0) {
        currentPhotoIndex = photoData.length - 1;
    } else if (currentPhotoIndex >= photoData.length) {
        currentPhotoIndex = 0;
    }
    
    openPhotoModal(currentPhotoIndex);
}

/**
 * 显示备注编辑器
 */
function showCaptionEditor() {
    const captionContainer = document.getElementById('captionEditContainer');
    const captionInput = document.getElementById('captionInput');
    const currentCaption = photoData[currentPhotoIndex].caption;
    
    captionInput.value = currentCaption;
    captionContainer.style.display = 'block';
    
    // 聚焦到输入框
    setTimeout(() => captionInput.focus(), 100);
}

/**
 * 隐藏备注编辑器
 */
function hideCaptionEditor() {
    const captionContainer = document.getElementById('captionEditContainer');
    captionContainer.style.display = 'none';
}

/**
 * 保存备注
 */
function saveCaption() {
    const captionInput = document.getElementById('captionInput');
    const newCaption = captionInput.value.trim();
    
    // 更新数据
    photoData[currentPhotoIndex].caption = newCaption;
    
    // 保存到localStorage
    saveCaptionsToStorage();
    
    // 更新UI
    const modalCaption = document.getElementById('modalCaption');
    modalCaption.textContent = newCaption || '暂无备注';
    
    if (!newCaption) {
        modalCaption.style.opacity = '0.6';
        modalCaption.style.fontStyle = 'italic';
    } else {
        modalCaption.style.opacity = '1';
        modalCaption.style.fontStyle = 'normal';
    }
    
    // 更新瀑布流中的备注
    updateGalleryCaption(currentPhotoIndex);
    
    // 隐藏编辑器
    hideCaptionEditor();
    
    // 显示保存成功提示
    showToast('备注保存成功！');
}

/**
 * 更新瀑布流中的备注显示
 */
function updateGalleryCaption(index) {
    const photoCards = document.querySelectorAll('.photo-card');
    const photoCard = photoCards[index];
    const captionElement = photoCard.querySelector('.photo-caption');
    const caption = photoData[index].caption;
    
    if (caption) {
        captionElement.textContent = caption;
        captionElement.classList.remove('empty');
    } else {
        captionElement.textContent = '点击查看详情';
        captionElement.classList.add('empty');
    }
}

/**
 * 保存备注到localStorage
 */
function saveCaptionsToStorage() {
    const captionsData = {};
    photoData.forEach(photo => {
        if (photo.caption) {
            captionsData[photo.id] = photo.caption;
        }
    });
    localStorage.setItem('travelPhotoCaptions', JSON.stringify(captionsData));
}

/**
 * 从localStorage加载保存的备注
 */
function loadSavedCaptions() {
    const savedCaptions = localStorage.getItem('travelPhotoCaptions');
    
    if (savedCaptions) {
        const captionsData = JSON.parse(savedCaptions);
        
        // 等待照片数据加载完成后应用备注
        const checkInterval = setInterval(() => {
            if (photoData.length > 0) {
                clearInterval(checkInterval);
                
                photoData.forEach(photo => {
                    if (captionsData[photo.id]) {
                        photo.caption = captionsData[photo.id];
                    }
                });
                
                // 更新瀑布流中的备注显示
                setTimeout(() => {
                    photoData.forEach((photo, index) => {
                        if (photo.caption) {
                            updateGalleryCaption(index);
                        }
                    });
                }, 100);
            }
        }, 100);
    }
}

/**
 * 显示提示消息
 */
function showToast(message) {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        background: linear-gradient(135deg, var(--primary), var(--primary-dark));
        color: white;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 10003;
        animation: slideDown 0.3s ease;
        font-size: 1rem;
    `;
    toast.textContent = message;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            toast.remove();
            style.remove();
        }, 300);
    }, 2000);
}
