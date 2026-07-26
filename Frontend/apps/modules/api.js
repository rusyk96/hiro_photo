// Базовый путь к оригиналам (для Лайтбокса)
export const RAW_BASE_URL = "https://raw.githubusercontent.com/rusyk96/ne_spont/main/webp/";

// Базовый путь к легким превьюшкам (для Bento-сетки)
export const THUMB_BASE_URL = "https://raw.githubusercontent.com/rusyk96/ne_spont/main/webp/webp_thumb/";

export async function includeComponent(slotId, filePath) {
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

export async function fetchManifestPhotos(fallbackCount = 371) {
  let rawList = [];

  try {
    const response = await fetch(`${RAW_BASE_URL}manifest.json?t=${Date.now()}`);
    if (response.ok) {
      rawList = await response.json();
    } else {
      throw new Error(`Манифест не найден (${response.status})`);
    }
  } catch (err) {
    console.warn('Работаем по резервному списку:', err.message);
    for (let i = 1; i <= fallbackCount; i++) {
      rawList.push({ name: `НЕ спонтанный концерт -${i}.webp`, type: 'landscape' });
    }
  }

  // 🎯 Мапим массив, выдавая сразу два готовых URL для каждого кадра
  return rawList.map((photo) => {
    // В зависимости от структуры манифеста берем имя файла
    const fileName = typeof photo === 'string' ? photo : photo.name;
    const photoType = typeof photo === 'object' ? photo.type : 'landscape';

    return {
      ...photo,
      name: fileName,
      type: photoType,
      // URL для рендера в сетку (всего ~3 МБ VRAM)
      thumbUrl: `${THUMB_BASE_URL}${encodeURIComponent(fileName)}`,
      // URL для полноэкранного просмотра при клике
      fullUrl: `${RAW_BASE_URL}${encodeURIComponent(fileName)}`
    };
  });
}