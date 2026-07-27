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
 * 🛠 Безопасная сборка URL файла (без двойного encodeURIComponent)
 */
function getValidPhotoUrl(photoData) {
  if (!photoData) return '';
  if (photoData.url) return photoData.url;
  if (photoData.src) return photoData.src;

  // Безопасно декодируем, затем кодируем РОВНО 1 РАЗ
  const cleanName = decodeURIComponent(photoData.name);
  return `${RAW_BASE_URL}/${encodeURIComponent(cleanName)}`;
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
  
  if (!photoData) {
    console.error(`Фотография по индексу ${index} не найдена в сторе!`);
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

window.openLightbox = openLightbox;