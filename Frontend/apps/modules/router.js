import { includeComponent } from './api.js';
import { renderAlbumGallery } from './bento.js';

export async function openAlbumPage() {
  await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus-album-gallery.html');
  await renderAlbumGallery();
}

export async function openCatalogPage() {
  await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus_catalog.html');
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