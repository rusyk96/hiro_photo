import { 
  setPhotos, 
  setCurrentIndex, 
  getCurrentImageUrl, 
  stepNext, 
  stepPrev,
  getCurrentIndex,
  getPhotos
} from './base_lightbox/lightbox-core.js';
import { bindLightboxEvents } from './base_lightbox/lightbox-events.js';
import { CardRaiseAnimation } from './lightbox-animation/card-raise.js';
import { RAW_BASE_URL } from '../api.js';

const raiser = new CardRaiseAnimation();

export function setLightboxPhotos(photos) {
  setPhotos(photos);
}

export function openLightbox(index, clickEvent) {
  setCurrentIndex(index);

  const lightbox = document.getElementById('lightbox');
  const polaroidCard = document.getElementById('polaroid-card');
  const fullImgUrl = getCurrentImageUrl(); // Ссылка на оригинал из API

  // Достаем кликнутую превьюшку из DOM
  let previewImg = null;
  if (clickEvent) {
    const target = clickEvent.currentTarget || clickEvent.target;
    previewImg = target.tagName === 'IMG' ? target : target.querySelector('img');
  }

  if (!previewImg) {
    previewImg = document.querySelectorAll('#album-gallery-container img')[index];
  }

  if (lightbox && polaroidCard) {
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Запускаем выдвижение с прокидыванием превьюшка -> оригинал
    raiser.animateRaise(polaroidCard, lightbox, previewImg, fullImgUrl);
  }
}

export function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  const polaroidCard = document.getElementById('polaroid-card');

  if (lightbox && polaroidCard) {
    raiser.animateDrop(polaroidCard, lightbox, () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
}

function updateLightboxImage() {
  const imgElement = document.getElementById('lightbox-img');
  if (!imgElement) return;

  // 1. Снимаем проявку перед сменой слайда
  imgElement.classList.remove('developed');

  const src = getCurrentImageUrl();
  if (src) {
    // 2. Ставим новый src и проявляем заново
    const tempImg = new Image();
    tempImg.src = src;
    
    tempImg.onload = () => {
      imgElement.src = src;
      setTimeout(() => imgElement.classList.add('developed'), 50);
    };
  }
}

export function nextSlide() {
  stepNext();
  updateLightboxImage();
}

export function prevSlide() {
  stepPrev();
  updateLightboxImage();
}

export function initLightboxEvents() {
  bindLightboxEvents({
    onClose: closeLightbox,
    onNext: nextSlide,
    onPrev: prevSlide
  });
}

// Делаем доступной для inline-кликов из HTML
window.openLightbox = openLightbox;