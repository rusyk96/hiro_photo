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

export function openLightbox(index) {
  setCurrentIndex(index);

  const lightbox = document.getElementById('lightbox');
  const polaroidCard = document.getElementById('polaroid-card');
  
  // 1. Достаем массив фотографий из ядра
  const photosArray = getPhotos();
  const photoData = photosArray[index]; 
  
  if (!photoData) {
    console.error(`Фотография по индексу ${index} не найдена в сторе!`);
    return;
  }

  // 2. Формируем честный URL через API
  const fullImgUrl = photoData.url || photoData.src || `${RAW_BASE_URL}/${photoData.name}`;

  if (lightbox && polaroidCard) {
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // 3. Запускаем анимацию с передачей объекта из JSON и собранного URL
    raiser.animateRaise(polaroidCard, lightbox, photoData, fullImgUrl);
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

/**
 * 🔄 Обновление картинки и геометрии при навигации (Next / Prev)
 */
function updateLightboxImage() {
  const imgElement = document.getElementById('lightbox-img');
  const polaroidCard = document.getElementById('polaroid-card');
  if (!imgElement || !polaroidCard) return;

  const photosArray = getPhotos();
  const currentIndex = getCurrentIndex();
  const photoData = photosArray[currentIndex];

  if (!photoData) return;

  // 1. Снимаем проявку и меняем класс ориентации под новый кадр из JSON
  imgElement.classList.remove('developed');
  imgElement.style.opacity = '0';
  
  polaroidCard.classList.remove('landscape', 'portrait');
  const cardType = photoData.type === 'portrait' ? 'portrait' : 'landscape';
  polaroidCard.classList.add(cardType);

  // 2. Достаем новый URL
  const fullImgUrl = photoData.url || photoData.src || `${RAW_BASE_URL}/${photoData.name}`;

  // 3. Загружаем и проявляем
  const loader = new Image();
  loader.src = fullImgUrl;

  const applyAndDevelop = () => {
    imgElement.src = fullImgUrl;
    setTimeout(() => {
      imgElement.style.opacity = '';
      imgElement.classList.add('developed');
    }, 50);
  };

  if (loader.complete) {
    applyAndDevelop();
  } else {
    loader.onload = applyAndDevelop;
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