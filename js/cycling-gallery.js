/**
 * 骑行相册页面脚本
 */

document.addEventListener('DOMContentLoaded', function() {
    initPhotoGallery();
    initPhotoModal();
    loadSavedCaptions();
});

let photoData = [];
let currentPhotoIndex = 0;

async function initPhotoGallery() {
    try {
        if (typeof CYCLING_PHOTOS_DATA !== 'undefined') {
            photoData = CYCLING_PHOTOS_DATA.photos;
        } else {
            try {
                const response = await fetch('data/cycling-photos.json');
                if (response.ok) {
                    const config = await response.json();
                    photoData = config.photos;
                }
            } catch (fetchError) {
                console.warn('无法加载配置文件');
            }
        }
        
        renderPhotoGallery();
        
    } catch (error) {
        console.error('加载照片数据失败:', error);
        showEmptyState();
    }
}

function renderPhotoGallery() {
    const galleryMasonry = document.getElementById('galleryMasonry');
    
    if (!galleryMasonry || photoData.length === 0) {
        showEmptyState();
        return;
    }
    
    galleryMasonry.innerHTML = '';
    
    photoData.forEach((photo, index) => {
        const photoCard = createPhotoCard(photo, index);
        galleryMasonry.appendChild(photoCard);
    });
    
    animatePhotoLoading();
}

function createPhotoCard(photo, index) {
    const photoCard = document.createElement('div');
    photoCard.className = 'photo-card';
    photoCard.dataset.index = index;
    
    const imagePath = `images/hobbies/cycling/${photo.file}`;
    
    photoCard.innerHTML = `
        <img src="${imagePath}" alt="骑行照片 ${photo.id}" loading="lazy">
        <div class="photo-number">${photo.id}</div>
        <div class="photo-overlay">
            <p class="photo-caption ${!photo.caption ? 'empty' : ''}">
                ${photo.caption || '点击查看详情'}
            </p>
        </div>
    `;
    
    photoCard.addEventListener('click', () => openPhotoModal(index));
    
    return photoCard;
}

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

function showEmptyState() {
    const galleryMasonry = document.getElementById('galleryMasonry');
    
    galleryMasonry.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-bicycle"></i>
            <h3>暂无骑行照片</h3>
            <p>请将骑行照片放入 <code>images/hobbies/cycling/</code> 文件夹</p>
            <p class="hint">支持 jpg、png 格式的图片文件</p>
        </div>
    `;
}

function initPhotoModal() {
    const modal = document.getElementById('photoModal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalClose = document.getElementById('modalClose');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');
    const editCaptionBtn = document.getElementById('editCaptionBtn');
    const saveCaptionBtn = document.getElementById('saveCaption');
    const cancelCaptionBtn = document.getElementById('cancelCaption');
    
    if (!modal) return;
    
    modalClose.addEventListener('click', closePhotoModal);
    modalOverlay.addEventListener('click', closePhotoModal);
    modalPrev.addEventListener('click', () => navigatePhoto(-1));
    modalNext.addEventListener('click', () => navigatePhoto(1));
    editCaptionBtn.addEventListener('click', showCaptionEditor);
    saveCaptionBtn.addEventListener('click', saveCaption);
    cancelCaptionBtn.addEventListener('click', hideCaptionEditor);
    
    document.addEventListener('keydown', handleKeyboardNavigation);
    
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

function handleKeyboardNavigation(e) {
    const modal = document.getElementById('photoModal');
    if (!modal || !modal.classList.contains('active')) return;
    
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

function openPhotoModal(index) {
    currentPhotoIndex = index;
    const modal = document.getElementById('photoModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const modalCounter = document.getElementById('modalCounter');
    
    const photo = photoData[currentPhotoIndex];
    const imagePath = `images/hobbies/cycling/${photo.file}`;
    
    modalImage.src = imagePath;
    modalCaption.textContent = photo.caption || '暂无备注';
    modalCounter.textContent = `${currentPhotoIndex + 1} / ${photoData.length}`;
    
    if (!photo.caption) {
        modalCaption.style.opacity = '0.6';
        modalCaption.style.fontStyle = 'italic';
    } else {
        modalCaption.style.opacity = '1';
        modalCaption.style.fontStyle = 'normal';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    hideCaptionEditor();
}

function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    hideCaptionEditor();
}

function navigatePhoto(direction) {
    currentPhotoIndex += direction;
    
    if (currentPhotoIndex < 0) {
        currentPhotoIndex = photoData.length - 1;
    } else if (currentPhotoIndex >= photoData.length) {
        currentPhotoIndex = 0;
    }
    
    openPhotoModal(currentPhotoIndex);
}

function showCaptionEditor() {
    const captionContainer = document.getElementById('captionEditContainer');
    const captionInput = document.getElementById('captionInput');
    const currentCaption = photoData[currentPhotoIndex].caption;
    
    captionInput.value = currentCaption;
    captionContainer.style.display = 'block';
    
    setTimeout(() => captionInput.focus(), 100);
}

function hideCaptionEditor() {
    const captionContainer = document.getElementById('captionEditContainer');
    captionContainer.style.display = 'none';
}

function saveCaption() {
    const captionInput = document.getElementById('captionInput');
    const newCaption = captionInput.value.trim();
    
    photoData[currentPhotoIndex].caption = newCaption;
    
    saveCaptionsToStorage();
    
    const modalCaption = document.getElementById('modalCaption');
    modalCaption.textContent = newCaption || '暂无备注';
    
    if (!newCaption) {
        modalCaption.style.opacity = '0.6';
        modalCaption.style.fontStyle = 'italic';
    } else {
        modalCaption.style.opacity = '1';
        modalCaption.style.fontStyle = 'normal';
    }
    
    updateGalleryCaption(currentPhotoIndex);
    
    hideCaptionEditor();
    
    showToast('备注保存成功！');
}

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

function saveCaptionsToStorage() {
    const captionsData = {};
    photoData.forEach(photo => {
        if (photo.caption) {
            captionsData[photo.id] = photo.caption;
        }
    });
    localStorage.setItem('cyclingPhotoCaptions', JSON.stringify(captionsData));
}

function loadSavedCaptions() {
    const savedCaptions = localStorage.getItem('cyclingPhotoCaptions');
    
    if (savedCaptions) {
        const captionsData = JSON.parse(savedCaptions);
        
        const checkInterval = setInterval(() => {
            if (photoData.length > 0) {
                clearInterval(checkInterval);
                
                photoData.forEach(photo => {
                    if (captionsData[photo.id]) {
                        photo.caption = captionsData[photo.id];
                    }
                });
                
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

function showToast(message) {
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
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            toast.remove();
            style.remove();
        }, 300);
    }, 2000);
}
