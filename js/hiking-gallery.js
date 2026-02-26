/**
 * 徒步相册页面脚本
 * 包含：照片瀑布流展示、照片查看、备注编辑功能
 */

document.addEventListener('DOMContentLoaded', function() {
    initPhotoGallery();
    initPhotoModal();
    loadSavedCaptions();
});

// 照片数据（包含文件名和默认备注）
const photoData = [
    { id: 1, file: '微信图片_20260223195753_377_229.jpg', caption: '' },
    { id: 2, file: '微信图片_20260223195758_378_229.jpg', caption: '' },
    { id: 3, file: '微信图片_20260223195800_379_229.jpg', caption: '' },
    { id: 4, file: '微信图片_20260223195804_380_229.jpg', caption: '' },
    { id: 5, file: '微信图片_20260223195809_381_229.jpg', caption: '' },
    { id: 6, file: '微信图片_20260223195814_382_229.jpg', caption: '' },
    { id: 7, file: '微信图片_20260223195820_383_229.jpg', caption: '' },
    { id: 8, file: '微信图片_20260223195834_384_229.jpg', caption: '' },
    { id: 9, file: '微信图片_20260223195856_385_229.jpg', caption: '' },
    { id: 10, file: '微信图片_20260223200605_386_229.jpg', caption: '' },
    { id: 11, file: '微信图片_20260223200609_387_229.jpg', caption: '' },
    { id: 12, file: '微信图片_20260223200614_388_229.jpg', caption: '' },
    { id: 13, file: '微信图片_20260223200617_389_229.jpg', caption: '' },
    { id: 14, file: '微信图片_20260223200621_390_229.jpg', caption: '' },
    { id: 15, file: '微信图片_20260223200625_391_229.jpg', caption: '' },
    { id: 16, file: '微信图片_20260223200631_392_229.jpg', caption: '' }
];

let currentPhotoIndex = 0;

/**
 * 初始化照片瀑布流展示
 */
function initPhotoGallery() {
    const galleryMasonry = document.getElementById('galleryMasonry');
    
    photoData.forEach((photo, index) => {
        const photoCard = document.createElement('div');
        photoCard.className = 'photo-card';
        photoCard.dataset.index = index;
        
        const imagePath = `images/hobbies/hiking/${photo.file}`;
        
        photoCard.innerHTML = `
            <img src="${imagePath}" alt="徒步照片 ${photo.id}" loading="lazy">
            <div class="photo-number">${photo.id}</div>
            <div class="photo-overlay">
                <p class="photo-caption ${!photo.caption ? 'empty' : ''}">
                    ${photo.caption || '点击查看详情'}
                </p>
            </div>
        `;
        
        // 点击打开模态框
        photoCard.addEventListener('click', () => openPhotoModal(index));
        
        galleryMasonry.appendChild(photoCard);
    });
    
    // 图片加载动画
    const images = galleryMasonry.querySelectorAll('img');
    images.forEach((img, index) => {
        img.style.opacity = '0';
        img.onload = function() {
            setTimeout(() => {
                img.style.transition = 'opacity 0.5s ease';
                img.style.opacity = '1';
            }, index * 50);
        };
    });
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
    document.addEventListener('keydown', (e) => {
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
    });
    
    // 触摸滑动
    let touchStartX = 0;
    let touchEndX = 0;
    
    modal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    modal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                navigatePhoto(1);
            } else {
                navigatePhoto(-1);
            }
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
    const imagePath = `images/hobbies/hiking/${photo.file}`;
    
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
    localStorage.setItem('hikingPhotoCaptions', JSON.stringify(captionsData));
}

/**
 * 从localStorage加载保存的备注
 */
function loadSavedCaptions() {
    const savedCaptions = localStorage.getItem('hikingPhotoCaptions');
    
    if (savedCaptions) {
        const captionsData = JSON.parse(savedCaptions);
        
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
