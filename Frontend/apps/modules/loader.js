// loader.js
import { loaderTemplate } from './loader_HTML.js';

export function mountLoader() {
  if (document.getElementById('loader')) return;
  document.body.insertAdjacentHTML('afterbegin', loaderTemplate);
}

export function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  loader.classList.add('is-hidden');
  setTimeout(() => loader.remove(), 800);
}

export async function waitForFullReady(container, criticalImagesCount = 8) {
  const startTime = performance.now();
  const MIN_DISPLAY_TIME = 350;

  // 1. Находим контейнер и картинки
  const target = typeof container === 'string' ? document.querySelector(container) : container;
  const images = target 
    ? Array.from(target.querySelectorAll('.gallery-img, .catalog-item img, img')).slice(0, criticalImagesCount)
    : [];

  // 2. Ждём шрифт и картинки первыми кадрами (с таймаутом 2.5с)
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
      img.closest('.gallery-card, .catalog-item')?.classList.remove('skeleton-active');
      img.closest('.gallery-card, .catalog-item')?.classList.add('is-loaded');
    })
  ]);

  const timeoutTask = new Promise((res) => setTimeout(res, 2500));
  await Promise.race([loadTask, timeoutTask]);

  // 3. Выдерживаем минимальную паузу для отрисовки логотипа и кадра
  const elapsed = performance.now() - startTime;
  if (elapsed < MIN_DISPLAY_TIME) {
    await new Promise((res) => setTimeout(res, MIN_DISPLAY_TIME - elapsed));
  }

  void document.body.offsetHeight; // Flush WebKit/Safari
  hideLoader();
}