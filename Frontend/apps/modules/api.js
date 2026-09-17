// --- MODULES/API.JS ---

export const CATALOG_URL = new URL('catalog.json', import.meta.url).href;

/**
 * Вставляет HTML-компонент в выбранный DOM-слот
 */
export async function includeComponent(slotId, filePath) {
  const slot = document.getElementById(slotId);
  if (!slot) return false; 

  try {
    const response = await fetch(`${filePath}?t=${Date.now()}`);
    if (!response.ok) throw new Error(`Статус: ${response.status}`);
    const html = await response.text();
    slot.innerHTML = html;
    return true;
  } catch (error) {
    console.error(`Ошибка загрузки компонента [${filePath}]:`, error);
    return false;
  }
}

/**
 * Читает главный catalog.json
 */
export async function fetchCatalog() {
  try {
    const response = await fetch(`${CATALOG_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error(`Ошибка загрузки каталога (${response.status})`);
    return await response.json();
  } catch (err) {
    console.error('Ошибка при чтении catalog.json:', err);
    return [];
  }
}

/**
 * Загружает манифест конкретного альбома по его ID из catalog.json
 */
export async function fetchAlbumManifest(albumId) {
  if (!albumId) {
    console.error('ID альбома не передан');
    return null;
  }

  const catalog = await fetchCatalog();
  const albumInfo = catalog.find(item => item.id === albumId || item.slug === albumId);

  if (!albumInfo) {
    console.error(`❌ Альбом с id "${albumId}" не найден в catalog.json`);
    return null;
  }

  try {
    const rawManifestUrl = (albumInfo.manifest_url || '').trim();

    // Загружаем манифест прямо по ссылке с GitHub CDN
    const manifestUrlObj = new URL(rawManifestUrl);
    manifestUrlObj.searchParams.set('t', Date.now());

    const response = await fetch(manifestUrlObj.toString());
    if (!response.ok) throw new Error(`Манифест альбома не найден (${response.status})`);
    const manifestData = await response.json();

    const rawList = manifestData.photos || manifestData.gallery || (Array.isArray(manifestData) ? manifestData : []);

    if (!rawList.length) {
      console.warn(`⚠️ В манифесте альбома "${albumId}" не найдены фотографии.`);
    }

    // Так как manifest.json лежит в корне (main/), корень для папок webp/ и webp_thumb/ — это rootBase
    const rootBase = rawManifestUrl.substring(0, rawManifestUrl.lastIndexOf('/') + 1);

    const baseUrl = manifestData.raw_base_url || albumInfo.raw_base_url || `${rootBase}webp/`;
    const thumbBaseUrl = manifestData.thumb_base_url || albumInfo.thumb_base_url || `${rootBase}webp_thumb/`;

    const photos = rawList.map((photo) => {
      const fileName = typeof photo === 'string' ? photo : (photo.name || photo.file);
      const photoType = typeof photo === 'object' ? (photo.type || (photo.isPortrait ? 'portrait' : 'landscape')) : 'landscape';
      const isPortrait = photoType === 'portrait' || photo.isPortrait === true;

      const thumbUrl = photo.thumbUrl || `${thumbBaseUrl}${encodeURIComponent(fileName)}`;
      const fullUrl = photo.fullUrl || `${baseUrl}${encodeURIComponent(fileName)}`;

      return {
        ...(typeof photo === 'object' ? photo : {}),
        name: fileName,
        type: photoType,
        isPortrait: isPortrait,
        thumbUrl: thumbUrl,
        fullUrl: fullUrl
      };
    });

    return {
      id: albumId,
      catalog: manifestData.catalog || albumInfo || {},
      polaroid: manifestData.polaroid || {},
      photos: photos
    };

  } catch (err) {
    console.error(`Ошибка загрузки манифеста [${albumId}]:`, err);
    return null;
  }
}

/**
 * Обёртка для получения массива фотографий
 */
export async function fetchManifestPhotos(albumId) {
  const albumData = await fetchAlbumManifest(albumId);
  return albumData ? albumData.photos : [];
}