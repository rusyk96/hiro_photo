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

const raiser = new CardRaiseAnimation();

export function setLightboxPhotos(photos) {
  setPhotos(photos);
}

export function openLightbox(index, clickEvent) {
  setCurrentIndex(index);
  updateLightboxImage();

  const lightbox = document.getElementById('lightbox');
  const polaroidCard = document.getElementById('polaroid-card');
  
  // 🎯 Извлекаем ЧЕТКУЮ картинку, на которую кликнули (без гаданий)
  let clickedImg = null;
  if (clickEvent) {
    const target = clickEvent.currentTarget || clickEvent.target;
    clickedImg = target.tagName === 'IMG' ? target : target.querySelector('img');
  }

  // Запасной вариант, если клик был вызван без event
  if (!clickedImg) {
    clickedImg = document.querySelectorAll('#album-gallery-container img')[index];
  }

  if (lightbox) {
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (clickedImg && polaroidCard) {
      raiser.animateRaise(clickedImg, polaroidCard, lightbox);
    }
  }
}

export function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  const polaroidCard = document.getElementById('polaroid-card');
  const currentIndex = getCurrentIndex();
  
  // При закрытии точно так же находим актуальный img в сетке
  const targetImg = document.querySelectorAll('#album-gallery-container img')[currentIndex];

  if (lightbox) {
    if (targetImg && polaroidCard) {
      raiser.animateDrop(targetImg, polaroidCard, lightbox, () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      });
    } else {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

function updateLightboxImage() {
  const imgElement = document.getElementById('lightbox-img');
  if (!imgElement) return;

  const src = getCurrentImageUrl();
  if (src) imgElement.src = src;
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