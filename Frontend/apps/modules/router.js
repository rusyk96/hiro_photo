import { includeComponent } from './api.js';
import { renderAlbumGallery } from './bento.js';
import { mountLoader, hideLoader } from './loader.js';

// Вспомогательная задержка для красоты анимации переходов
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function openAlbumPage() {
  mountLoader();
  try {
    await Promise.all([
      (async () => {
        await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus-album-gallery.html');
        await renderAlbumGallery();
      })(),
      delay(600) // Минимальное время показа лоудера при переходе
    ]);
  } catch (error) {
    console.error('Ошибка при открытии альбома:', error);
  } finally {
    hideLoader();
  }
}

export async function openCatalogPage() {
  mountLoader();
  try {
    await Promise.all([
      includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus_catalog.html'),
      delay(500)
    ]);
  } catch (error) {
    console.error('Ошибка при открытии каталога:', error);
  } finally {
    hideLoader();
  }
}

export async function initRouter() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentAlbum = urlParams.get('album');

  if (currentAlbum === 'ne_spont') {
    await openAlbumPage();
  } else {
    await openCatalogPage();
  }
}

export function initNavigationListeners() {
  document.addEventListener('click', async (e) => {
    const concertCard = e.target.closest('#concert-card');
    if (concertCard) {
      e.preventDefault();
      history.pushState({ album: 'ne_spont' }, '', '?album=ne_spont');
      await openAlbumPage();
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