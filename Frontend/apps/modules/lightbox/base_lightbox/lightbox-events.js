export function bindLightboxEvents({ onClose, onNext, onPrev }) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (closeBtn) closeBtn.onclick = onClose;
  if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); onNext(); };
  if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); onPrev(); };

  lightbox.onclick = (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      onClose();
    }
  };

  window.onkeydown = (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  };
}