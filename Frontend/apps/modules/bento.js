import { fetchManifestPhotos } from './api.js';
import { setLightboxPhotos, initLightboxEvents } from './lightbox.js';
import { initChunkVirtualizer } from './virtualizer.js';
import { VramMonitor } from './vram-hud.js';

new VramMonitor();

// 🎯 ВАЖНО: Используем готовый thumbUrl из api.js
function createCardHtml(photoObj) {
  // Защита: поддерживаем и объект, и случайную строку
  const srcUrl = photoObj.thumbUrl || photoObj;
  const originalIdx = photoObj.originalIndex ?? 0;

  return `
    <div class="gallery-card" onclick="openLightbox(${originalIdx})">
      <img 
        data-original-src="${srcUrl}" 
        alt="Кадр ${originalIdx + 1}" 
        class="gallery-img"
        loading="lazy"
        decoding="async"
        onerror="this.closest('.gallery-card').style.display='none';"
      />
    </div>
  `;
}

export async function renderAlbumGallery() {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  const rawPhotos = await fetchManifestPhotos();
  setLightboxPhotos(rawPhotos);

  // Проставляем оригинальные индексы для Лайтбокса
  const indexedPhotos = rawPhotos.map((item, index) => ({
    ...item,
    originalIndex: index,
    isPortrait: item.type === 'portrait'
  }));

  buildSmartBentoGallery(indexedPhotos);

  requestAnimationFrame(() => {
    initChunkVirtualizer('album-gallery-container');
  });
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

    // Сценарий 1: 3 горизонтали + 1 портрет (Большой Bento)
    if (landscapes.length >= 3 && portraits.length >= 1) {
      row.className = 'bento-pattern-row';
      const h1 = landscapes.shift();
      const h2 = landscapes.shift();
      const v1 = portraits.shift();
      const h3 = landscapes.shift();

      const leftHtml = `
        <div class="bento-left-col">
          ${createCardHtml(h1)}
          ${createCardHtml(h2)}
        </div>
      `;
      const rightHtml = `
        <div class="bento-right-col">
          ${createCardHtml(v1)}
        </div>
      `;

      row.innerHTML = `
        <div class="bento-top-group">
          ${!isMirrored ? leftHtml + rightHtml : rightHtml + leftHtml}
        </div>
        <div class="bento-bottom-full">
          ${createCardHtml(h3)}
        </div>
      `;
      isMirrored = !isMirrored;
    } 
    // Сценарий 2: 2 горизонтали + 1 портрет
    else if (landscapes.length >= 2 && portraits.length >= 1) {
      row.className = 'bento-row';
      const h1 = landscapes.shift();
      const v1 = portraits.shift();
      const h2 = landscapes.shift();

      if (!isMirrored) {
        row.innerHTML = `
          <div class="bento-col-4">
            ${createCardHtml(h1)}
            ${createCardHtml(v1)}
          </div>
          <div class="bento-col-8">
            ${createCardHtml(h2)}
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="bento-col-8">
            ${createCardHtml(h2)}
          </div>
          <div class="bento-col-4">
            ${createCardHtml(h1)}
            ${createCardHtml(v1)}
          </div>
        `;
      }
      isMirrored = !isMirrored;
    } 
    // Сценарий 3: 3 вертикали подряд
    else if (portraits.length >= 3) {
      row.className = 'bento-row';
      const v1 = portraits.shift();
      const v2 = portraits.shift();
      const v3 = portraits.shift();

      row.innerHTML = `
        <div class="bento-col-4">${createCardHtml(v1)}</div>
        <div class="bento-col-4">${createCardHtml(v2)}</div>
        <div class="bento-col-4">${createCardHtml(v3)}</div>
      `;
    }
    // Сценарий 4: Остались только горизонтали (чередуем 3 в ряд и 2 в ряд)
    else if (landscapes.length >= 3 && portraits.length === 0) {
      row.className = 'bento-row';
      if (isMirrored) {
        const h1 = landscapes.shift();
        const h2 = landscapes.shift();
        const h3 = landscapes.shift();
        row.innerHTML = `
          <div class="bento-col-4">${createCardHtml(h1)}</div>
          <div class="bento-col-4">${createCardHtml(h2)}</div>
          <div class="bento-col-4">${createCardHtml(h3)}</div>
        `;
      } else {
        const h1 = landscapes.shift();
        const h2 = landscapes.shift();
        row.innerHTML = `
          <div class="bento-col-6">${createCardHtml(h1)}</div>
          <div class="bento-col-6">${createCardHtml(h2)}</div>
        `;
      }
      isMirrored = !isMirrored;
    }
    // Сценарий 5: 2 горизонтали (50/50)
    else if (landscapes.length >= 2) {
      row.className = 'bento-row';
      const h1 = landscapes.shift();
      const h2 = landscapes.shift();

      row.innerHTML = `
        <div class="bento-col-6">${createCardHtml(h1)}</div>
        <div class="bento-col-6">${createCardHtml(h2)}</div>
      `;
    }
    // 🎯 ПОСЛЕДНИЙ ОСТАТОК (Финал альбома)
    else {
      row.className = 'bento-row bento-remainder-row';
      const remaining = [...landscapes, ...portraits];
      landscapes = [];
      portraits = [];

      if (remaining.length === 1) {
        row.innerHTML = `<div class="bento-col-12">${createCardHtml(remaining[0])}</div>`;
      } else if (remaining.length === 2) {
        row.innerHTML = `
          <div class="bento-col-6">${createCardHtml(remaining[0])}</div>
          <div class="bento-col-6">${createCardHtml(remaining[1])}</div>
        `;
      } else {
        remaining.forEach(item => {
          const col = document.createElement('div');
          col.className = 'bento-col-4';
          col.innerHTML = createCardHtml(item);
          row.appendChild(col);
        });
      }
    }

    fragment.appendChild(row);
  }

  container.appendChild(fragment);
  initLightboxEvents();
}

export function waitForFirstImages(count = 4) {
  const container = document.getElementById('album-gallery-container');
  if (!container) return Promise.resolve();

  const images = Array.from(container.querySelectorAll('img')).slice(0, count);

  if (images.length === 0) return Promise.resolve();

  const loadPromises = images.map((img) => {
    if (img.complete && img.naturalHeight !== 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  });

  return Promise.all(loadPromises);
}