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

export class VramMonitor {
  constructor() {
    this.hudElement = null;
    this.intervalId = null;
    
    if (document.body) {
      this.init();
    } else {
      window.addEventListener('DOMContentLoaded', () => this.init());
    }
  }

  init() {
    this.createHud();
    this.startLoop();
  }

  createHud() {
    // Удаляем старый плагин, если он случайно пересоздался
    const oldHud = document.getElementById('vram-monitor-hud');
    if (oldHud) oldHud.remove();

    this.hudElement = document.createElement('div');
    this.hudElement.id = 'vram-monitor-hud';
    this.hudElement.style.cssText = `
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      background: rgba(10, 10, 10, 0.9) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      color: #00ff88 !important;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      padding: 10px 14px !important;
      border-radius: 12px !important;
      z-index: 2147483647 !important; /* Максимальный Z-Index */
      pointer-events: none !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 4px !important;
      user-select: none !important;
    `;

    document.body.appendChild(this.hudElement);
  }

  calculateVram() {
    const imgs = document.getElementsByClassName('gallery-img');
    let activeCount = 0;
    let totalBytes = 0;

    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      const src = img.getAttribute('src');

      if (src && !src.startsWith('data:image/gif') && src !== '') {
        activeCount++;
        const width = img.naturalWidth || 1920;
        const height = img.naturalHeight || 1080;
        totalBytes += width * height * 4 * 1.33;
      }
    }

    const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
    return { count: activeCount, mb: totalMB };
  }

  startLoop() {
    const update = () => {
      const { count, mb } = this.calculateVram();
      
      let color = '#00ff88';
      if (mb > 200) color = '#ffb700';
      if (mb > 350) color = '#ff4444';

      if (this.hudElement) {
        this.hudElement.innerHTML = `
          <div style="font-weight:600; color:#fff; margin-bottom:2px; font-size:11px; opacity:0.6;">VRAM MONITOR</div>
          <div><span style="color:#aaa">Active Imgs:</span> <b style="color:#fff">${count}</b></div>
          <div><span style="color:#aaa">Est. VRAM:</span> <b style="color:${color}">${mb} MB</b></div>
        `;
      }
    };

    update();
    this.intervalId = setInterval(update, 200);
  }

  destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.hudElement) this.hudElement.remove();
  }
}