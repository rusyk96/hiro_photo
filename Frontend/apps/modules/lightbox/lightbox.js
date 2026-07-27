import { 
  setPhotos, 
  setCurrentIndex, 
  stepNext, 
  stepPrev,
  getCurrentIndex,
  getPhotos
} from './base_lightbox/lightbox-core.js';
import { bindLightboxEvents } from './base_lightbox/lightbox-events.js';
import { CardRaiseAnimation } from './lightbox-animation/card-raise.js';
import { RAW_BASE_URL } from '../api.js';

const raiser = new CardRaiseAnimation();

/**
 * 🛠 Безопасная сборка URL без двойных слэшей и двойного энкодинга браузером
 */
function getValidPhotoUrl(photoData) {
  if (!photoData) return '';

  if (photoData.fullUrl || photoData.url || photoData.src) {
    return photoData.fullUrl || photoData.url || photoData.src;
  }

  const baseUrl = RAW_BASE_URL.replace(/\/+$/, '');

  let rawName = photoData.name || '';
  while (rawName.includes('%25')) {
    rawName = rawName.replace(/%25/g, '%');
  }

  try {
    rawName = decodeURIComponent(rawName);
  } catch (e) {}

  return `${baseUrl}/${rawName}`;
}

/**
 * 🔢 Достаем номер кадра из JSON (из имени файла "-1.webp" или поля frame)
 */
function getFrameNumber(photoData, index, totalCount) {
  const total = String(totalCount).padStart(2, '0');

  if (!photoData) return `#01 / ${total}`;

  // Сначала проверяем явное поле в JSON
  if (photoData.frame !== undefined) {
    const num = String(photoData.frame).padStart(2, '0');
    return `#${num} / ${total}`;
  }

  // Вытаскиваем число перед расширением из имени "НЕ спонтанный концерт -1.webp"
  const match = photoData.name?.match(/-(\d+)\./);
  if (match && match[1]) {
    const num = String(match[1]).padStart(2, '0');
    return `#${num} / ${total}`;
  }

  // Порядковый номер в массиве по умолчанию
  const fallback = String(index + 1).padStart(2, '0');
  return `#${fallback} / ${total}`;
}

export function setLightboxPhotos(photos) {
  setPhotos(photos);
}

export function openLightbox(index) {
  setCurrentIndex(index);

  const lightbox = document.getElementById('lightbox');
  const polaroidCard = document.getElementById('polaroid-card');
  const counterElement = document.getElementById('polaroid-counter');
  
  const photosArray = getPhotos();
  const photoData = photosArray[index]; 
  
  if (!photoData) return;

  // Обновляем счетчик
  if (counterElement) {
    counterElement.textContent = getFrameNumber(photoData, index, photosArray.length);
  }

  const fullImgUrl = getValidPhotoUrl(photoData);

  if (lightbox && polaroidCard) {
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

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

function updateLightboxImage() {
  const imgElement = document.getElementById('lightbox-img');
  const polaroidCard = document.getElementById('polaroid-card');
  const counterElement = document.getElementById('polaroid-counter');
  if (!imgElement || !polaroidCard) return;

  const photosArray = getPhotos();
  const currentIndex = getCurrentIndex();
  const photoData = photosArray[currentIndex];

  if (!photoData) return;

  // Обновляем счетчик кадра из JSON
  if (counterElement) {
    counterElement.textContent = getFrameNumber(photoData, currentIndex, photosArray.length);
  }

  imgElement.classList.remove('developed');
  imgElement.style.opacity = '0';
  
  polaroidCard.classList.remove('landscape', 'portrait');
  const cardType = photoData.type === 'portrait' ? 'portrait' : 'landscape';
  polaroidCard.classList.add(cardType);

  const fullImgUrl = getValidPhotoUrl(photoData);

  const loader = new Image();
  
  loader.onload = () => {
    imgElement.src = fullImgUrl;
    setTimeout(() => {
      imgElement.style.opacity = '';
      imgElement.classList.add('developed');
    }, 50);
  };

  loader.src = fullImgUrl;
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

window.openLightbox = openLightbox;