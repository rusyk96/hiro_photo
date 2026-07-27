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
import { CardRaiseAnimation } from './lightbox-animetion/card-raise.js';

const raiser = new CardRaiseAnimation();

export function setLightboxPhotos(photos) {
  setPhotos(photos);
}

export function openLightbox(index, clickEvent) {
  setCurrentIndex(index);
  updateLightboxImage();

  const lightbox = document.getElementById('lightbox');
  const polaroidCard = document.getElementById('polaroid-card');
  
  // Ищем кликнутую картинку (или передаем через event, или ищем в DOM по индексу)
  const clickedImg = clickEvent?.currentTarget?.querySelector('img') 
    || clickEvent?.target 
    || document.querySelectorAll('#album-gallery-container img')[index];

  if (lightbox) {
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // 🚀 Запускаем взлет кадра
    if (clickedImg && polaroidCard) {
      raiser.animateRaise(clickedImg, polaroidCard);
    }
  }
}

export function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  const polaroidCard = document.getElementById('polaroid-card');
  const currentIndex = getCurrentIndex();
  
  // Ищем целевую картинку в сетке, куда должна приземлиться карточка
  const targetImg = document.querySelectorAll('#album-gallery-container img')[currentIndex];

  if (lightbox) {
    if (targetImg && polaroidCard) {
      // 🛬 Плавно сажаем карточку обратно в сетку, затем гасим фон
      raiser.animateDrop(targetImg, polaroidCard, () => {
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