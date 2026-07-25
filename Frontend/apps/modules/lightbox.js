import { RAW_BASE_URL } from './api.js';

let globalPhotoFiles = [];
let currentIndex = 0;

export function setLightboxPhotos(photos) {
  globalPhotoFiles = photos;
}

export function openLightbox(index) {
  currentIndex = index;
  updateLightboxImage();
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function updateLightboxImage() {
  const imgElement = document.getElementById('lightbox-img');
  if (!imgElement || !globalPhotoFiles[currentIndex]) return;

  const rawItem = globalPhotoFiles[currentIndex];
  const fileName = typeof rawItem === 'string' ? rawItem : rawItem.name;
  const cleanFileName = fileName.normalize('NFC');

  imgElement.src = `${RAW_BASE_URL}${encodeURIComponent(cleanFileName)}`;
}

export function nextSlide() {
  if (!globalPhotoFiles.length) return;
  currentIndex = (currentIndex + 1) % globalPhotoFiles.length;
  updateLightboxImage();
}

export function prevSlide() {
  if (!globalPhotoFiles.length) return;
  currentIndex = (currentIndex - 1 + globalPhotoFiles.length) % globalPhotoFiles.length;
  updateLightboxImage();
}

export function initLightboxEvents() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (closeBtn) closeBtn.onclick = closeLightbox;
  if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); nextSlide(); };
  if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); prevSlide(); };

  lightbox.onclick = (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  };

  window.onkeydown = (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  };
}

// Делаем openLightbox доступной для inline onclick="openLightbox(i)" в HTML
window.openLightbox = openLightbox;