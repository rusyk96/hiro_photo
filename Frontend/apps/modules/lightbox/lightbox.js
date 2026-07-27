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
  console.group('🔍 [Lightbox Debug] Обработка URL');
  console.log('1. Входной photoData:', photoData);

  if (!photoData) {
    console.error('❌ photoData не передан!');
    console.groupEnd();
    return '';
  }

  // 1. Если есть готовое поле
  if (photoData.fullUrl || photoData.url || photoData.src) {
    const directUrl = photoData.fullUrl || photoData.url || photoData.src;
    console.log('2. Найдено готовое поле:', directUrl);
    console.groupEnd();
    return directUrl;
  }

  // 2. Чистим RAW_BASE_URL от слэша на конце, чтобы не было '//'
  const baseUrl = RAW_BASE_URL.replace(/\/+$/, '');

  // 3. Достаем имя файла и сбрасываем любые старые %25
  let rawName = photoData.name || '';
  while (rawName.includes('%25')) {
    rawName = rawName.replace(/%25/g, '%');
  }

  // 4. Приводим к чистой незакодированной кириллице
  try {
    rawName = decodeURIComponent(rawName);
  } catch (e) {
    // Уже декодировано
  }

  console.log('3. Очищенное имя файла:', rawName);

  // 5. Формируем прямой путь (браузер сам закодирует кириллицу в сетевом запросе)
  const finalUrl = `${baseUrl}/${rawName}`;
  console.log('4. 🚀 ФИНАЛЬНЫЙ URL:', finalUrl);
  console.groupEnd();

  return finalUrl;
}

export function setLightboxPhotos(photos) {
  setPhotos(photos);
}

export function openLightbox(index) {
  setCurrentIndex(index);

  const lightbox = document.getElementById('lightbox');
  const polaroidCard = document.getElementById('polaroid-card');
  
  const photosArray = getPhotos();
  const photoData = photosArray[index]; 
  
  console.log(`📸 [openLightbox] Открытие кадра #${index}`, photoData);

  if (!photoData) {
    console.error(`❌ Фотография по индексу ${index} не найдена в getPhotos()!`);
    return;
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
  if (!imgElement || !polaroidCard) return;

  const photosArray = getPhotos();
  const currentIndex = getCurrentIndex();
  const photoData = photosArray[currentIndex];

  if (!photoData) return;

  imgElement.classList.remove('developed');
  imgElement.style.opacity = '0';
  
  polaroidCard.classList.remove('landscape', 'portrait');
  const cardType = photoData.type === 'portrait' ? 'portrait' : 'landscape';
  polaroidCard.classList.add(cardType);

  const fullImgUrl = getValidPhotoUrl(photoData);

  const loader = new Image();
  
  loader.onload = () => {
    console.log('✅ [Image Loader] Картинка успешно загрузилась:', fullImgUrl);
    imgElement.src = fullImgUrl;
    setTimeout(() => {
      imgElement.style.opacity = '';
      imgElement.classList.add('developed');
    }, 50);
  };

  loader.onerror = (err) => {
    console.error('❌ [Image Loader] Ошибка загрузки по ссылке:', fullImgUrl, err);
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