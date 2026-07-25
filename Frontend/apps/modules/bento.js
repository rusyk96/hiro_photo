import { RAW_BASE_URL, fetchManifestPhotos } from './api.js';
import { setLightboxPhotos, initLightboxEvents } from './lightbox.js';

function parsePhotosList(manifestData) {
  return manifestData.map((fileItem, index) => {
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

export async function renderAlbumGallery() {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  const rawPhotos = await fetchManifestPhotos();
  setLightboxPhotos(rawPhotos); // Передаем список картинок в Lightbox

  const analyzedPhotos = parsePhotosList(rawPhotos);
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

    // Сценарий 1 (Новый Bento с референса): 3 горизонтали + 1 портрет
    if (landscapes.length >= 3 && portraits.length >= 1) {
      row.className = 'bento-pattern-row';
      const h1 = landscapes.shift();
      const h2 = landscapes.shift();
      const v1 = portraits.shift();
      const h3 = landscapes.shift();

      if (!isMirrored) {
        row.innerHTML = `
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
        `;
      } else {
        row.innerHTML = `
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
        `;
      }
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
    // Сценарий 3: 3 вертикали
    else if (portraits.length >= 3) {
      row.className = 'bento-row';
      const v1 = portraits.shift();
      const v2 = portraits.shift();
      const v3 = portraits.shift();

      row.innerHTML = `
        <div class="bento-col-4">${createCardHtml(v1.fileItem, v1.originalIndex)}</div>
        <div class="bento-col-4">${createCardHtml(v2.fileItem, v2.originalIndex)}</div>
        <div class="bento-col-4">${createCardHtml(v3.fileItem, v3.originalIndex)}</div>
      `;
    }
    // Сценарий 4: 2 горизонтали (50/50)
    else if (landscapes.length >= 2) {
      row.className = 'bento-row';
      const h1 = landscapes.shift();
      const h2 = landscapes.shift();

      row.innerHTML = `
        <div class="bento-col-6">${createCardHtml(h1.fileItem, h1.originalIndex)}</div>
        <div class="bento-col-6">${createCardHtml(h2.fileItem, h2.originalIndex)}</div>
      `;
    }
    // Остаток
    else {
      row.className = 'bento-row';
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

  container.appendChild(fragment);
  initLightboxEvents();
}