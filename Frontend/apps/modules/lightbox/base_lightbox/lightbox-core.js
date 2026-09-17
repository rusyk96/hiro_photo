let globalPhotoFiles = [];
let currentIndex = 0;

export function setPhotos(photos) {
  globalPhotoFiles = photos;
}

export function getPhotos() {
  return globalPhotoFiles;
}

export function getCurrentIndex() {
  return currentIndex;
}

export function setCurrentIndex(index) {
  if (index >= 0 && index < globalPhotoFiles.length) {
    currentIndex = index;
  }
}

export function getCurrentImageUrl() {
  if (!globalPhotoFiles[currentIndex]) return '';
  const rawItem = globalPhotoFiles[currentIndex];
  
  // URL берём строго из уже сформированного объекта
  return rawItem.fullUrl || rawItem.url || rawItem.src || '';
}

export function stepNext() {
  if (!globalPhotoFiles.length) return;
  currentIndex = (currentIndex + 1) % globalPhotoFiles.length;
}

export function stepPrev() {
  if (!globalPhotoFiles.length) return;
  currentIndex = (currentIndex - 1 + globalPhotoFiles.length) % globalPhotoFiles.length;
}

