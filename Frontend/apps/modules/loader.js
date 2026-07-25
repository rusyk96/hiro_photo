import { loaderTemplate } from './loader_HTML'; // или твой путь к шаблону

export function mountLoader() {
  if (document.getElementById('loader')) return;
  document.body.insertAdjacentHTML('afterbegin', loaderTemplate);
}

export function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Плавное угасание через CSS transition (0.8s)
  loader.style.opacity = '0';
  loader.style.pointerEvents = 'none';

  setTimeout(() => {
    loader.remove();
  }, 800);
}