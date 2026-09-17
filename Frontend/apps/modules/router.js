// modules/router.js

import { includeComponent, fetchCatalog } from './api.js';
import { renderAlbumGallery } from './bento_grid/bento.js';
import { mountLoader, hideLoader } from './loader.js';
import { renderCatalogGrid } from './create-card.js';
import { loadStyles } from './resolver.js';
//import { VramMonitor } from './vram-hud.js';

// Прокидываем в глобальный контекст для доступа из консоли DevTools
//window.VramMonitor = VramMonitor;
//window.vramMonitor = new VramMonitor();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function openAlbumPage(albumId) {
  mountLoader();
  try {
    // 1. Загружаем фокус-зону галереи
    const loaded = await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus-album-gallery.html');
    
    if (loaded) {
      // Пауза в 1 микрозадачу, чтобы браузер распарсил innerHTML в реальный DOM
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // 2. Рендерим сетку альбома
      await renderAlbumGallery(albumId);
    }
  } catch (error) {
    console.error(`Ошибка при открытии альбома [${albumId}]:`, error);
  } finally {
    hideLoader();
  }
}

export async function openCatalogPage() {
  mountLoader();
  try {
    await Promise.all([
      (async () => {
        // 1. Загружаем фокус-зону каталога
        await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus_catalog.html');
        
        // 2. Подтягиваем catalog.json и рендерим карточки
        const container = document.getElementById('catalog-cards-container');
        if (container) {
          const catalogData = await fetchCatalog();
          renderCatalogGrid(container, catalogData, async (albumId) => {
            history.pushState({ album: albumId }, '', `?album=${albumId}`);
            await openAlbumPage(albumId);
          });
        }
      })(),
      delay(500)
    ]);
  } catch (error) {
    console.error('Ошибка при открытии каталога:', error);
  } finally {
    hideLoader();
  }
}

// ЕДИНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ РОУТЕРА
export async function initRouter() {
  // 1. Первым делом подтягиваем стили через наш нативный резолвер
  await loadStyles([
    'Global_style_canvas.css',
    'fonts_faces.css',
    'Header.css',
    'catalog.css',
    'galerey.css',
    'breadcrumbs.css',
    'footer.css',
    'louder.css'
  ]);

  // 2. Разбираем URL и открываем нужный экран
  const urlParams = new URLSearchParams(window.location.search);
  const currentAlbum = urlParams.get('album');

  if (currentAlbum) {
    await openAlbumPage(currentAlbum);
  } else {
    await openCatalogPage();
  }
}

export function initNavigationListeners() {
  document.addEventListener('click', async (e) => {
    // 1. Перехватываем клик по логотипу
    const logoLink = e.target.closest('.header-logo');
    if (logoLink) {
      e.preventDefault(); // Запрещаем браузеру перезагружать страницу
      
      // Переходим в каталог только если мы находимся внутри альбома
      if (window.location.search !== '') {
        history.pushState({}, '', window.location.pathname);
        await openCatalogPage();
      }
      return;
    }

    // 2. Клик по активной карточке альбома
    const catalogItem = e.target.closest('.catalog-item:not(.card-disabled)');
    if (catalogItem) {
      e.preventDefault();
      const albumId = catalogItem.dataset.id;
      if (albumId) {
        history.pushState({ album: albumId }, '', `?album=${albumId}`);
        await openAlbumPage(albumId);
      }
      return;
    }

    // 3. Клик по хлебным крошкам "Главная"
    const backLink = e.target.closest('.crumb-link');
    if (backLink) {
      e.preventDefault();
      history.pushState({}, '', window.location.pathname);
      await openCatalogPage();
      return;
    }
  });

  // Обработка стрелок «Назад / Вперед» в браузере
  window.addEventListener('popstate', () => {
    initRouter();
  });
}

