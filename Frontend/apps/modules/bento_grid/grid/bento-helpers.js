// bento-helpers.js
export function createCardHtml(photoObj) {
  if (!photoObj) return '';

  const srcUrl = photoObj.thumbUrl || photoObj;
  const originalIdx = photoObj.originalIndex ?? 0;
  
  // 🚀 Первые 4 кадра загружаем мгновенно (eager), остальные лениво (lazy)
  const loadingStrategy = originalIdx < 4 ? 'eager' : 'lazy';
  const fetchPriority = originalIdx < 2 ? 'fetchpriority="high"' : '';

  return `
    <div class="gallery-card skeleton-active" onclick="openLightbox(${originalIdx})">
      <img 
        src="${srcUrl}" 
        alt="Кадр ${originalIdx + 1}" 
        class="gallery-img"
        loading="${loadingStrategy}"
        ${fetchPriority}
        decoding="async"
        onload="this.classList.add('is-loaded'); this.parentElement.classList.remove('skeleton-active');"
        onerror="this.parentElement.classList.remove('skeleton-active'); this.closest('.gallery-card').style.display='none';"
      />
    </div>
  `;
}
