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

  let htmlContent = '';

  globalPhotoFiles.forEach((fileName, index) => {
    const i = index + 1;
    const isEvenPair = Math.floor((i - 1) / 2) % 2 === 0;
    const colClass = (i % 2 !== 0) 
      ? (isEvenPair ? 'col-4' : 'col-8') 
      : (isEvenPair ? 'col-8' : 'col-4');

    const cleanFileName = fileName.normalize('NFC');
    const photoUrl = `${RAW_BASE_URL}${encodeURIComponent(cleanFileName)}`;

    htmlContent += `
      <div class="gallery-card ${colClass}" onclick="openLightbox(${index})">
        <img 
          src="${photoUrl}" 
          alt="НЕ спонтанный концерт — кадр ${i}" 
          class="gallery-img"
          loading="lazy"
          decoding="async"
          onerror="this.closest('.gallery-card').style.display='none';"
        />
      </div>
    `;
  });

  container.innerHTML = htmlContent;
  initLightboxEvents();
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