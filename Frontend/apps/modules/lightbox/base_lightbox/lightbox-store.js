/* 📱 СВАЙП-ЖЕСТЫ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ */

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Минимальная дистанция свайпа в пикселях
const SWIPE_THRESHOLD = 40; 
// Максимальное отклонение по вертикали (чтобы свайп не срабатывал при обычном скролле)
const MAX_VERTICAL_OFFSET = 60; 

export function initSwipeEvents(lightboxElement, onNext, onPrev) {
  if (!lightboxElement) return;

  lightboxElement.addEventListener('touchstart', (e) => {
    // Игнорируем мультитач (зум двумя пальцами)
    if (e.touches.length > 1) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lightboxElement.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 0) return;

    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;

    handleSwipeGesture(onNext, onPrev);
  }, { passive: true });
}

function handleSwipeGesture(onNext, onPrev) {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  // Если вертикальное смещение слишком велико — игнорируем (пользователь скроллил)
  if (Math.abs(diffY) > MAX_VERTICAL_OFFSET) return;

  // Проверяем, превысил ли горизонтальный свайп порог
  if (Math.abs(diffX) >= SWIPE_THRESHOLD) {
    if (diffX < 0) {
      // Свайп влево 👈 -> Следующий кадр
      if (typeof onNext === 'function') onNext();
    } else {
      // Свайп вправо 👉 -> Предыдущий кадр
      if (typeof onPrev === 'function') onPrev();
    }
  }
}