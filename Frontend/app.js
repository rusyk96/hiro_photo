async function includeComponent(slotId, filePath) {
  const slot = document.getElementById(slotId);
  if (!slot) return; 

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Статус: ${response.status}`);
    const html = await response.text();
    slot.innerHTML = html;
  } catch (error) {
    console.error(`Ошибка загрузки [${filePath}]:`, error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Загружаем базовые компоненты
  includeComponent('header-slot', 'Frontend/Global_frames/heder_and_footer/heder.html');
  includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus_catalog.html');
  includeComponent('footer-slot', 'Frontend/Global_frames/heder_and_footer/footer.html');

  // Перехватываем клики внутри focus-slot для переключения страниц
  const focusSlot = document.getElementById('focus-slot');
  if (focusSlot) {
    focusSlot.addEventListener('click', (e) => {
      // 1. Переход в альбом при клике на первой карточке
      const concertCard = e.target.closest('#concert-card');
      if (concertCard) {
        e.preventDefault();
        includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus-album-gallery.html');
        return;
      }

      // 2. Возврат в каталог при клике на "Главная" в хлебных крошках
      const backLink = e.target.closest('.crumb-link');
      if (backLink) {
        e.preventDefault();
        includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus_catalog.html');
      }
    });
  }
});

const RAW_BASE_URL = "https://raw.githubusercontent.com/rusyk96/ne_spont/main/webp/";

let globalPhotoFiles = [];
let currentIndex = 0;

async function includeComponent(slotId, filePath) {
  const slot = document.getElementById(slotId);
  if (!slot) return; 

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Статус: ${response.status}`);
    const html = await response.text();
    slot.innerHTML = html;
  } catch (error) {
    console.error(`Ошибка загрузки [${filePath}]:`, error);
  }
}

function parsePhotosList(manifestData) {
  return manifestData.map((fileItem, index) => {
    const fileName = typeof fileItem === 'string' ? fileItem : fileItem.name;
    const isPortrait = typeof fileItem === 'object' && fileItem.type === 'portrait';

    return {
      fileItem,
      originalIndex: index,
      isPortrait
    };
  });
}

function createCardHtml(fileItem, index) {
  const fileName = typeof fileItem === 'string' ? fileItem : fileItem.name;
  const cleanFileName = fileName.normalize('NFC');
  const photoUrl = `${RAW_BASE_URL}${encodeURIComponent(cleanFileName)}`;

  return `
    <div class="gallery-card" onclick="openLightbox(${index})">
      <img 
        src="${photoUrl}" 
        alt="Кадр ${index + 1}" 
        class="gallery-img"
        loading="lazy"
        decoding="async"
        onerror="this.closest('.gallery-card').style.display='none';"
      />
    </div>
  `;
}
async function renderAlbumGallery(fallbackCount = 371) {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  try {
    const response = await fetch(`${RAW_BASE_URL}manifest.json?t=${Date.now()}`);
    if (response.ok) {
      globalPhotoFiles = await response.json();
    } else {
      throw new Error(`Манифест не найден (${response.status})`);
    }
  } catch (err) {
    console.warn('Работаем по резервному списку:', err.message);
    globalPhotoFiles = [];
    for (let i = 1; i <= fallbackCount; i++) {
      globalPhotoFiles.push({ name: `НЕ спонтанный концерт -${i}.webp`, type: 'landscape' });
    }
  }

  const analyzedPhotos = parsePhotosList(globalPhotoFiles);
  buildSmartBentoGallery(analyzedPhotos);
}

function buildSmartBentoGallery(photos) {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  let landscapes = photos.filter(p => !p.isPortrait);
  let portraits = photos.filter(p => p.isPortrait);

  let isMirrored = false;

  while (landscapes.length > 0 || portraits.length > 0) {
    const row = document.createElement('div');
    row.className = 'bento-row';

    if (landscapes.length >= 2 && portraits.length >= 1) {
      const h1 = landscapes.shift();
      const v1 = portraits.shift();
      const h2 = landscapes.shift();

      if (!isMirrored) {
        row.innerHTML = `
          <div class="bento-col-4">
            ${createCardHtml(h1.fileItem, h1.originalIndex)}
            ${createCardHtml(v1.fileItem, v1.originalIndex)}
          </div>
          <div class="bento-col-8">
            ${createCardHtml(h2.fileItem, h2.originalIndex)}
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="bento-col-8">
            ${createCardHtml(h2.fileItem, h2.originalIndex)}
          </div>
          <div class="bento-col-4">
            ${createCardHtml(h1.fileItem, h1.originalIndex)}
            ${createCardHtml(v1.fileItem, v1.originalIndex)}
          </div>
        `;
      }
      isMirrored = !isMirrored;
    } 
    else if (portraits.length >= 3) {
      const v1 = portraits.shift();
      const v2 = portraits.shift();
      const v3 = portraits.shift();

      row.innerHTML = `
        <div class="bento-col-4">${createCardHtml(v1.fileItem, v1.originalIndex)}</div>
        <div class="bento-col-4">${createCardHtml(v2.fileItem, v2.originalIndex)}</div>
        <div class="bento-col-4">${createCardHtml(v3.fileItem, v3.originalIndex)}</div>
      `;
    }
    else if (landscapes.length >= 2) {
      const h1 = landscapes.shift();
      const h2 = landscapes.shift();

      row.innerHTML = `
        <div class="bento-col-6">${createCardHtml(h1.fileItem, h1.originalIndex)}</div>
        <div class="bento-col-6">${createCardHtml(h2.fileItem, h2.originalIndex)}</div>
      `;
    }
    else {
      const remaining = [...landscapes, ...portraits];
      landscapes = [];
      portraits = [];

      remaining.forEach(item => {
        const col = document.createElement('div');
        col.className = 'bento-col-6';
        col.innerHTML = createCardHtml(item.fileItem, item.originalIndex);
        row.appendChild(col);
      });
    }

    fragment.appendChild(row);
  }
  // Сценарий для макета с картинки: 3 горизонтали + 1 вертикаль
if (landscapes.length >= 3 && portraits.length >= 1) {
  const h1 = landscapes.shift(); // Левый верхний
  const h2 = landscapes.shift(); // Левый нижний
  const v1 = portraits.shift();  // Правый портрет
  const h3 = landscapes.shift(); // Нижняя широкая полоса

  if (!isMirrored) {
    row.innerHTML = `
      <div class="bento-pattern-row">
        <div class="bento-top-group">
          <div class="bento-left-col">
            ${createCardHtml(h1.fileItem, h1.originalIndex)}
            ${createCardHtml(h2.fileItem, h2.originalIndex)}
          </div>
          <div class="bento-right-col">
            ${createCardHtml(v1.fileItem, v1.originalIndex)}
          </div>
        </div>
        <div class="bento-bottom-full">
          ${createCardHtml(h3.fileItem, h3.originalIndex)}
        </div>
      </div>
    `;
  } else {
    // Зеркальный вариант (портрет слева, две горизонтали справа)
    row.innerHTML = `
      <div class="bento-pattern-row">
        <div class="bento-top-group">
          <div class="bento-right-col">
            ${createCardHtml(v1.fileItem, v1.originalIndex)}
          </div>
          <div class="bento-left-col">
            ${createCardHtml(h1.fileItem, h1.originalIndex)}
            ${createCardHtml(h2.fileItem, h2.originalIndex)}
          </div>
        </div>
        <div class="bento-bottom-full">
          ${createCardHtml(h3.fileItem, h3.originalIndex)}
        </div>
      </div>
    `;
  }
  isMirrored = !isMirrored;
}
  container.appendChild(fragment);

  // Инициализируем события лайтбокса после сборки DOM
  initLightboxEvents();
}

/// --- 3. ЛОГИКА ЛАЙТБОКСА ---

// --- 3. УПРАВЛЕНИЕ ЛАЙТБОКСОМ ---

function openLightbox(index) {
  currentIndex = index;
  updateLightboxImage();
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function updateLightboxImage() {
  const imgElement = document.getElementById('lightbox-img');
  if (!imgElement || !globalPhotoFiles[currentIndex]) return;

  const rawItem = globalPhotoFiles[currentIndex];
  const fileName = typeof rawItem === 'string' ? rawItem : rawItem.name;
  const cleanFileName = fileName.normalize('NFC');

  imgElement.src = `${RAW_BASE_URL}${encodeURIComponent(cleanFileName)}`;
}

function nextSlide() {
  if (!globalPhotoFiles.length) return;
  currentIndex = (currentIndex + 1) % globalPhotoFiles.length;
  updateLightboxImage();
}

function prevSlide() {
  if (!globalPhotoFiles.length) return;
  currentIndex = (currentIndex - 1 + globalPhotoFiles.length) % globalPhotoFiles.length;
  updateLightboxImage();
}

function initLightboxEvents() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (closeBtn) closeBtn.onclick = closeLightbox;
  if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); nextSlide(); };
  if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); prevSlide(); };

  lightbox.onclick = (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  };

  window.onkeydown = (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  };
}

async function initRouter() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentAlbum = urlParams.get('album');

  if (currentAlbum === 'ne_spont') {
    await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus-album-gallery.html');
    await renderAlbumGallery();
  } else {
    await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus_catalog.html');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Подгружаем шапку и футер
  await includeComponent('header-slot', 'Frontend/Global_frames/heder_and_footer/heder.html');
  await includeComponent('footer-slot', 'Frontend/Global_frames/heder_and_footer/footer.html');

  // Запускаем роутер
  await initRouter();

  // Глобальный клик-сенсор для переключения страниц без перезагрузки
  document.addEventListener('click', async (e) => {
    const concertCard = e.target.closest('#concert-card');
    if (concertCard) {
      e.preventDefault();
      history.pushState({ album: 'ne_spont' }, '', '?album=ne_spont');
      await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus-album-gallery.html');
      await renderAlbumGallery();
      return;
    }

    const backLink = e.target.closest('.crumb-link');
    if (backLink) {
      e.preventDefault();
      history.pushState({}, '', window.location.pathname);
      await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus_catalog.html');
      return;
    }
  });

  window.addEventListener('popstate', () => {
    initRouter();
  });
});