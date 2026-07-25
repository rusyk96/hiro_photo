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

async function renderAlbumGallery(fallbackCount = 371) {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  // Очищаем контейнер перед рендером
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

  // Используем фрагмент, чтобы не дергать DOM на каждой из 371 карточек
  const fragment = document.createDocumentFragment();

  globalPhotoFiles.forEach((fileItem, index) => {
    const i = index + 1;
    const fileName = typeof fileItem === 'string' ? fileItem : fileItem.name;
    const cleanFileName = fileName.normalize('NFC');
    const photoUrl = `${RAW_BASE_URL}${encodeURIComponent(cleanFileName)}`;

    // Создаем карточку
    const card = document.createElement('div');
    card.className = 'gallery-card medium'; // Дефолтный размер до загрузки
    card.onclick = () => openLightbox(index);

    const img = document.createElement('img');
    img.src = photoUrl;
    img.alt = `НЕ спонтанный концерт — кадр ${i}`;
    img.className = 'gallery-img';
    img.loading = 'lazy';
    img.decoding = 'async';

    // Подстраиваем класс при загрузке
    img.onload = function() {
      adjustBentoCard(this);
    };

    // Если картинка отвалилась
    img.onerror = function() {
      const parentCard = this.closest('.gallery-card');
      if (parentCard) parentCard.style.display = 'none';
    };

    card.appendChild(img);
    fragment.appendChild(card);

    // Если картинка УЖЕ закеширована браузером, вызываем проверку вручную
    if (img.complete && img.naturalWidth !== 0) {
      adjustBentoCard(img);
    }
  });

  // Вставляем все 371 карточки одним махом!
  container.appendChild(fragment);

  if (typeof initLightboxEvents === 'function') {
    initLightboxEvents();
  }
}

// Функция подстраивает Bento-класс карточки в момент загрузки файла
function adjustBentoCard(img) {
  if (!img || img.naturalWidth === 0) return;
  
  const card = img.closest('.gallery-card');
  if (!card) return;

  const ratio = img.naturalWidth / img.naturalHeight;

  card.classList.remove('medium', 'portrait', 'landscape');

  if (ratio < 0.85) {
    card.classList.add('portrait');   // Вертикальный кадр
  } else if (ratio > 1.3) {
    card.classList.add('landscape');  // Широкий кадр
  } else {
    card.classList.add('medium');     // Обычный кадр
  }
}

// 3. Менеджер состояний (Роутер)
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

// 4. Инициализация и обработчик кликов
document.addEventListener('DOMContentLoaded', () => {
  initRouter();

  document.addEventListener('click', async (e) => {
    // Переход к альбому
    const concertCard = e.target.closest('#concert-card');
    if (concertCard) {
      e.preventDefault();
      history.pushState({ album: 'ne_spont' }, '', '?album=ne_spont');
      await includeComponent('focus-slot', 'Frontend/Global_frames/focus_zone/focus-album-gallery.html');
      await renderAlbumGallery();
      return;
    }

    // Возврат в каталог
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