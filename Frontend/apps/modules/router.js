// modules/router.js
import { includeComponent, fetchCatalog } from './api.js';
import { renderAlbumGallery } from './bento_grid/bento.js';
import { mountLoader, hideLoader } from './loader.js';
import { renderCatalogGrid } from './create-card.js';
import { loadStyles } from './resolver.js';
import { initVirtualizer } from './virtualizer.js';

function forceRender() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

export async function openAlbumPage(albumId) {
  mountLoader();
  await forceRender();

  try {
    const loaded = await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus-album-gallery.html');
    
    if (loaded) {
      // 1. Принудительно сбрасываем скролл наверх, чтобы расчет геометрии в виртуализаторе начался с 0px
      window.scrollTo(0, 0);

      // 2. Рендерим чистую DOM-структуру галереи
      await renderAlbumGallery(albumId);
      
      // 3. Пропускаем кадр, чтобы браузер рассчитал размеры ячеек
      await forceRender();

      // 4. Инициализируем виртуализатор (он соберет карточки и сразу смонтирует 1-й экран + 3500px)
      initVirtualizer('album-gallery-container');

      // 5. Прячем глобальный лоудер — пользователь видит скелетоны и мгновенно проявляющиеся растры
      hideLoader();
    } else {
      hideLoader();
    }
  } catch (error) {
    console.error(`Ошибка при открытии альбома [${albumId}]:`, error);
    hideLoader();
  }
}

export async function openCatalogPage() {
  mountLoader();
  await forceRender();

  try {
    const loaded = await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus_catalog.html');
    
    if (loaded) {
      window.scrollTo(0, 0);
      const container = document.getElementById('catalog-cards-container');
      
      if (container) {
        const catalogData = await fetchCatalog();
        
        await renderCatalogGrid(container, catalogData, async (albumId) => {
          history.pushState({ album: albumId }, '', `?album=${albumId}`);
          await openAlbumPage(albumId);
        });

        await forceRender();
        hideLoader();
      } else {
        hideLoader();
      }
    } else {
      hideLoader();
    }
  } catch (error) {
    console.error('Ошибка при открытии каталога:', error);
    hideLoader();
  }
}

export async function initRouter() {
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
    const logoLink = e.target.closest('.header-logo');
    if (logoLink) {
      e.preventDefault();
      if (window.location.search !== '') {
        history.pushState({}, '', window.location.pathname);
        await openCatalogPage();
      }
      return;
    }

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

    const backLink = e.target.closest('.crumb-link');
    if (backLink) {
      e.preventDefault();
      history.pushState({}, '', window.location.pathname);
      await openCatalogPage();
      return;
    }
  });

  window.addEventListener('popstate', () => {
    initRouter();
  });
}