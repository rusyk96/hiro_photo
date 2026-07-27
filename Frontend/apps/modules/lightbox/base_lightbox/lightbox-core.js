import { RAW_BASE_URL } from '../../api.js';

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
  const fileName = typeof rawItem === 'string' ? rawItem : rawItem.name;
  const cleanFileName = fileName.normalize('NFC');

  return `${RAW_BASE_URL}${encodeURIComponent(cleanFileName)}`;
}

export function stepNext() {
  if (!globalPhotoFiles.length) return;
  currentIndex = (currentIndex + 1) % globalPhotoFiles.length;
}

export function stepPrev() {
  if (!globalPhotoFiles.length) return;
  currentIndex = (currentIndex - 1 + globalPhotoFiles.length) % globalPhotoFiles.length;
}