// loader.js
import { loaderTemplate } from './loader_HTML.js';

export function mountLoader() {
  if (document.getElementById('loader')) return;
  document.body.insertAdjacentHTML('afterbegin', loaderTemplate);
  setLoaderProgress(10); // Стартуем с малого значения
}

export function setLoaderProgress(percent) {
  const bar = document.getElementById('loader-progress-bar');
  if (bar) {
    const clamped = Math.max(0, Math.min(100, percent));
    bar.style.width = `${clamped}%`;
  }
}

export function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  setLoaderProgress(100); // Добиваем до конца
  setTimeout(() => {
    loader.classList.add('is-hidden');
    setTimeout(() => loader.remove(), 800);
  }, 200);
}

export async function waitForFullReady(container, criticalImagesCount = 8) {
  const startTime = performance.now();
  const MIN_DISPLAY_TIME = 350;

  setLoaderProgress(30); // Шрифты и инициализация

  // 1. Находим контейнер и картинки
  const target = typeof container === 'string' ? document.querySelector(container) : container;
  const images = target 
    ? Array.from(target.querySelectorAll('.gallery-img, .catalog-item img, img')).slice(0, criticalImagesCount)
    : [];

  setLoaderProgress(50); // Начинаем загрузку критических картинок

  let loadedCount = 0;
  const totalImages = images.length || 1;

  // 2. Ждём шрифт и картинки первыми кадрами
  const loadTask = Promise.all([
    document.fonts?.ready.catch(() => {}),
    ...images.map(async (img) => {
      if (!img.complete) {
        await new Promise((res) => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
        });
      }
      if (img.decode) {
        await Promise.race([img.decode(), new Promise((r) => setTimeout(r, 300))]).catch(() => {});
      }
      loadedCount++;
      // Плавный прирост прогресса по мере загрузки картинок (от 50% до 85%)
      const currentProgress = 50 + Math.floor((loadedCount / totalImages) * 35);
      setLoaderProgress(currentProgress);

      img.closest('.gallery-card, .catalog-item')?.classList.remove('skeleton-active');
      img.closest('.gallery-card, .catalog-item')?.classList.add('is-loaded');
    })
  ]);

  const timeoutTask = new Promise((res) => setTimeout(res, 2500));
  await Promise.race([loadTask, timeoutTask]);

  setLoaderProgress(90); // Финальные штрихи

  // 3. Выдерживаем минимальную паузу
  const elapsed = performance.now() - startTime;
  if (elapsed < MIN_DISPLAY_TIME) {
    await new Promise((res) => setTimeout(res, MIN_DISPLAY_TIME - elapsed));
  }

  void document.body.offsetHeight; 
  hideLoader();
}