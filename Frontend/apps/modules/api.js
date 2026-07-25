export const RAW_BASE_URL = "https://raw.githubusercontent.com/rusyk96/ne_spont/main/webp/";

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
  try {
    const response = await fetch(`${RAW_BASE_URL}manifest.json?t=${Date.now()}`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error(`Манифест не найден (${response.status})`);
  } catch (err) {
    console.warn('Работаем по резервному списку:', err.message);
    const fallbackList = [];
    for (let i = 1; i <= fallbackCount; i++) {
      fallbackList.push({ name: `НЕ спонтанный концерт -${i}.webp`, type: 'landscape' });
    }
    return fallbackList;
  }
}