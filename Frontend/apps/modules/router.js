// modules/router.js
import { includeComponent, fetchCatalog, fetchAlbumManifest } from './api.js';
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

// 🏷️ Словарь путей к логотипам для шапки галереи
const LOGO_BY_CATEGORY = {
  concert: '/assets/img/logo/logo_concert.svg',
  festival: '/assets/img/logo/logo_festival.svg',
  cosplay: '/assets/img/logo/logo_cosplay.svg',
  default: '/assets/img/logo/logo_gorisonal.svg'
};

export async function openAlbumPage(albumId) {
  mountLoader();
  await forceRender();

  try {
    // 1. Меняем хедер на шапку галереи (без табов, с кнопкой возврата)
    await includeComponent('header-slot', '/Frontend/Global_frames/heder_and_footer/Header-gallery.html');

    const loaded = await includeComponent('focus-slot', '/Frontend/Global_frames/focus_zone/focus-album-gallery.html');
    
    if (loaded) {
      // 2. Принудительно сбрасываем скролл наверх
      window.scrollTo(0, 0);

      // 3. Подгружаем манифест альбома
      const albumData = await fetchAlbumManifest(albumId);

      // 🚀 4. Точно и надежно достаем категорию из объекта каталога
      if (albumData && albumData.catalog) {
        const category = albumData.catalog.category || 'default';
        const logoImg = document.getElementById('gallery-dynamic-logo');
        
        if (logoImg) {
          const logoSrc = LOGO_BY_CATEGORY[category] || LOGO_BY_CATEGORY['default'];
          logoImg.src = logoSrc;
          console.log(`🏷️ [Header] Установлен динамический логотип для категории: "${category}" (файл: ${logoSrc})`);
        }
      }

      // 5. Рендерим чистую DOM-структуру галереи
      await renderAlbumGallery(albumId);
      await forceRender();
      initVirtualizer('album-gallery-container');
      hideLoader();
    } else {
      hideLoader();
    }
  } catch (error) {
    console.error(`Ошибка при открытии альбома [${albumId}]:`, error);
    hideLoader();
  }
}

export async function openCatalogPage(targetCategory = null) {
  mountLoader();
  await forceRender();

  try {
    // Подключаем главный хедер с табами
    await includeComponent('header-slot', '/Frontend/Global_frames/heder_and_footer/heder.html');

    const loaded = await includeComponent('focus-slot', '/Frontend/Global_frames/focus_zone/focus_catalog.html');
    
    if (loaded) {
      window.scrollTo(0, 0);
      const container = document.getElementById('catalog-cards-container');
      
      if (container) {
        const catalogData = await fetchCatalog();
        
        // 1. Узнаем дефолтный таб из HTML, если категория не пришла
        const activeTabElement = document.querySelector('.tab-btn.active');
        const defaultActiveCategory = activeTabElement ? activeTabElement.dataset.category : 'concert';
        
        const categoryToUse = targetCategory || defaultActiveCategory;

        // 2. Активируем нужную кнопку в интерфейсе
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => {
          if (t.dataset.category === categoryToUse) {
            t.classList.add('active');
          } else {
            t.classList.remove('active');
          }
        });

        if (!targetCategory && !window.location.search.includes('category=')) {
          history.replaceState({ category: categoryToUse }, '', `?category=${categoryToUse}`);
        }

        // 3. Фильтруем данные под выбранную категорию
        const initialFilteredData = catalogData.filter(item => 
          item.category === categoryToUse || (item.tags && item.tags.includes(categoryToUse))
        );

        // 4. Рендерим сетку (передаем categoryToUse в state истории, чтобы при возврате знать категорию)
        await renderCatalogGrid(container, initialFilteredData, async (albumId) => {
          history.pushState({ album: albumId, category: categoryToUse }, '', `?album=${albumId}`);
          await openAlbumPage(albumId);
        });

        initTabListeners(catalogData, container);

        await forceRender();
        hideLoader();
      } else {
        hideLoader();
      }
    } else {
      hideLoader();
    }
  } catch (error) {
    console.error('❌ [Catalog] Ошибка при открытии каталога:', error);
    hideLoader();
  }
}

export function initTabListeners(catalogData, container) {
  document.addEventListener('click', async (e) => {
    const tabBtn = e.target.closest('.tab-btn');
    if (!tabBtn) return;

    // 1. Переключаем активный класс у кнопок
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    tabBtn.classList.add('active');

    // 2. Получаем выбранную категорию и обновляем URL без перезагрузки
    const category = tabBtn.dataset.category;
    history.pushState({ category }, '', `?category=${category}`);

    // 3. Фильтруем данные
    const filteredData = category === 'all' 
      ? catalogData 
      : catalogData.filter(item => item.category === category || (item.tags && item.tags.includes(category)));

    // 4. Перерисовываем сетку каталога (также сохраняем категорию в state)
    await renderCatalogGrid(container, filteredData, async (albumId) => {
      history.pushState({ album: albumId, category: category }, '', `?album=${albumId}`);
      await openAlbumPage(albumId);
    });
  });
}

export async function initRouter() {
  await loadStyles([
    'Global_style_canvas.css',
    'fonts_faces.css',
    'Header.css',
    'catalog.css',
    `galerey.css`,
    'breadcrumbs.css',
    'footer.css',
    'louder.css'
  ]);

  const urlParams = new URLSearchParams(window.location.search);
  const currentAlbum = urlParams.get('album');
  // Пытаемся взять категорию из параметров URL либо из сохраненного state истории браузера
  const currentCategory = urlParams.get('category') || history.state?.category;

  if (currentAlbum) {
    await openAlbumPage(currentAlbum);
  } else {
    await openCatalogPage(currentCategory);
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
        // Узнаем текущую активную категорию на момент клика, чтобы запомнить её в истории
        const activeTab = document.querySelector('.tab-btn.active');
        const activeCategory = activeTab ? activeTab.dataset.category : 'concert';

        history.pushState({ album: albumId, category: activeCategory }, '', `?album=${albumId}`);
        await openAlbumPage(albumId);
      }
      return;
    }

    const backLink = e.target.closest('.crumb-link');
    if (backLink) {
      e.preventDefault();
      
      // Достаем сохраненную категорию из history.state или из URL
      const savedCategory = history.state?.category || new URLSearchParams(window.location.search).get('category') || 'concert';
      
      history.pushState({ category: savedCategory }, '', `?category=${savedCategory}`);
      await openCatalogPage(savedCategory);
      return;
    }
  });

  window.addEventListener('popstate', (e) => {
    const urlParams = new URLSearchParams(window.location.search);
    const album = urlParams.get('album');
    const category = urlParams.get('category') || e.state?.category;

    if (album) {
      openAlbumPage(album);
    } else {
      openCatalogPage(category);
    }
  });
}