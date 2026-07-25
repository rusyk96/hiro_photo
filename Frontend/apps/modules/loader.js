import { loaderTemplate } from './loader_HTML.js'; // Добавили .js

export function mountLoader() {
  if (document.getElementById('loader')) return;
  document.body.insertAdjacentHTML('afterbegin', loaderTemplate);
}

export function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Вешаем класс для плавного CSS-затухания
  loader.classList.add('is-hidden');

  // Ждём 800ms (время transition из CSS) и удаляем из DOM
  setTimeout(() => {
    loader.remove();
  }, 1400);
}