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

// 1. Загрузка данных и запуск сборщика Bento-сетки
async function renderAlbumGallery(fallbackCount = 371) {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  container.innerHTML = '';

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
      globalPhotoFiles.push(`НЕ спонтанный концерт -${i}.webp`);
    }
  }

  // Запускаем сборку блочной Bento-галереи по макетам 1-5!
  buildBentoGallery(globalPhotoFiles);
}

// 2. Основная функция сборки галереи по секциям (макеты 1-5)
function buildBentoGallery(photoList) {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  let currentIndex = 0;
  let isMirrored = false; // Переключатель для зеркалирования блоков

  while (currentIndex < photoList.length) {
    const remaining = photoList.length - currentIndex;
    const row = document.createElement('div');
    row.className = 'bento-row';

    const chunkSize = Math.min(remaining >= 4 ? 4 : remaining, 4);
    const photosChunk = photoList.slice(currentIndex, currentIndex + chunkSize);

    if (chunkSize === 4) {
      // Макет 4 / 5 (3 небольших кадра + 1 акцентный)
      if (!isMirrored) {
        row.innerHTML = `
          <div class="bento-col-4">
            ${createCardHtml(photosChunk[0], currentIndex)}
            ${createCardHtml(photosChunk[1], currentIndex + 1)}
            ${createCardHtml(photosChunk[2], currentIndex + 2)}
          </div>
          <div class="bento-col-8">
            ${createCardHtml(photosChunk[3], currentIndex + 3)}
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="bento-col-8">
            ${createCardHtml(photosChunk[3], currentIndex + 3)}
          </div>
          <div class="bento-col-4">
            ${createCardHtml(photosChunk[0], currentIndex)}
            ${createCardHtml(photosChunk[1], currentIndex + 1)}
            ${createCardHtml(photosChunk[2], currentIndex + 2)}
          </div>
        `;
      }
    } else if (chunkSize === 3) {
      // Макет 1 / 2 / 3 (2 кадра + 1 акцентный)
      if (!isMirrored) {
        row.innerHTML = `
          <div class="bento-col-4">
            ${createCardHtml(photosChunk[0], currentIndex)}
            ${createCardHtml(photosChunk[1], currentIndex + 1)}
          </div>
          <div class="bento-col-8">
            ${createCardHtml(photosChunk[2], currentIndex + 2)}
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="bento-col-8">
            ${createCardHtml(photosChunk[2], currentIndex + 2)}
          </div>
          <div class="bento-col-4">
            ${createCardHtml(photosChunk[0], currentIndex)}
            ${createCardHtml(photosChunk[1], currentIndex + 1)}
          </div>
        `;
      }
    } else {
      // Хвост альбома (1-2 кадра)
      photosChunk.forEach((file, idx) => {
        const col = document.createElement('div');
        col.className = chunkSize === 1 ? 'bento-col-8' : 'bento-col-6';
        col.innerHTML = createCardHtml(file, currentIndex + idx);
        row.appendChild(col);
      });
    }

    fragment.appendChild(row);
    currentIndex += chunkSize;
    isMirrored = !isMirrored;
  }

  container.appendChild(fragment);

  if (typeof initLightboxEvents === 'function') {
    initLightboxEvents();
  }
}

// 3. Вспомогательная функция сборки HTML одной карточки
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

// 4. Менеджер состояний (Роутер)
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

// 5. Инициализация кликов и событий DOM
document.addEventListener('DOMContentLoaded', async () => {
  // Загружаем базовые шапку и подвал
  if (typeof includeComponent === 'function') {
    await includeComponent('header-slot', 'Frontend/Global_frames/heder_and_footer/heder.html');
    await includeComponent('footer-slot', 'Frontend/Global_frames/heder_and_footer/footer.html');
  }

  // Запускаем роутинг при старте
  await initRouter();

  // Слушаем клики по всему документу для навигации
  document.addEventListener('click', async (e) => {
    const concertCard = e.target.closest('#concert-card');
    if (concertCard) {
      e.preventDefault();
      history.pushState({ album: 'ne_spont' }, '', '?album=ne_spont');
      await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus-album-gallery.html');
      await renderAlbumGallery(); // Обязательно вызываем рендер после подгрузки DOM!
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

// --- LIGHTBOX LOGIC ---
function openLightbox(index) {
  currentIndex = index;
  updateLightboxImage();
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = ''; // Возвращаем скролл
}

function updateLightboxImage() {
  const imgElement = document.getElementById('lightbox-img');
  const fileName = globalPhotoFiles[currentIndex].normalize('NFC');
  imgElement.src = `${RAW_BASE_URL}${encodeURIComponent(fileName)}`;
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % globalPhotoFiles.length;
  updateLightboxImage();
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + globalPhotoFiles.length) % globalPhotoFiles.length;
  updateLightboxImage();
}

function initLightboxEvents() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!lightbox) return;

  closeBtn.onclick = closeLightbox;
  nextBtn.onclick = (e) => { e.stopPropagation(); nextSlide(); };
  prevBtn.onclick = (e) => { e.stopPropagation(); prevSlide(); };

  // Закрытие при клике на темный фон
  lightbox.onclick = (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  };

  // Управление с клавиатуры (стрелочки + Esc)
  window.onkeydown = (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  };
}