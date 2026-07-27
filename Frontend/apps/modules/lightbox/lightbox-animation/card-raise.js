/**
 * 🎬 Модуль вылета карточки по превью-габаритам + Проявка оригинала
 */

export class CardRaiseAnimation {
  constructor() {
    this.isAnimating = false;
  }

  /**
   * 🛫 Выдвижение с зафиксированной геометрией и последующей проявкой
   */
  animateRaise(polaroidCard, backdropEl, previewImg, fullImgUrl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    const imgElement = document.getElementById('lightbox-img');
    const polaroidFrame = polaroidCard.querySelector('.polaroid-frame');

    // 1. 🧹 РЕСЕТ СТАРОГО СОСТОЯНИЯ
    if (imgElement) {
      imgElement.classList.remove('developed');
      imgElement.src = '';
    }

    // 2. 📐 ШАГ 1: Задаем геометрические правила по превьюшке (ЕЩЁ ЗА КАДРОМ)
    if (previewImg && polaroidFrame) {
      const width = previewImg.naturalWidth || previewImg.clientWidth;
      const height = previewImg.naturalHeight || previewImg.clientHeight;

      if (width && height) {
        // Задаем точный Aspect Ratio рамки на основе быстрого превью
        polaroidFrame.style.aspectRatio = `${width} / ${height}`;
        
        // Корректируем ширину карточки, чтобы вертикалки и горизонталки смотрелись одинаково сочно
        if (height > width) {
          // Вертикальное фото
          polaroidCard.style.width = 'min(82vw, 460px)';
        } else {
          // Горизонтальное фото
          polaroidCard.style.width = 'min(88vw, 820px)';
        }
      }
    }

    // Ставим превьюшку как временную підложку
    if (imgElement && previewImg) {
      imgElement.src = previewImg.src;
    }

    // 3. 🌑 Включаем затемнение
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      backdropEl.style.opacity = '1';
    }

    // 4. 🛫 ШАГ 2: Выдвигаем карточку с уже ИДЕАЛЬНОЙ геометрией
    const startY = window.innerHeight;
    Object.assign(polaroidCard.style, {
      transition: 'none',
      transform: `translateY(${startY}px) scale(0.92)`,
      opacity: '0'
    });

    requestAnimationFrame(() => {
      Object.assign(polaroidCard.style, {
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
        transform: 'translateY(0) scale(1)',
        opacity: '1'
      });
    });

    // 5. 🧪 ШАГ 3: Загружаем оригинал и запускаем проявку поверх превью
    if (imgElement && fullImgUrl) {
      const fullImgLoader = new Image();
      fullImgLoader.src = fullImgUrl;

      const triggerDevelopment = () => {
        imgElement.src = fullImgUrl;
        setTimeout(() => {
          if (imgElement) imgElement.classList.add('developed');
        }, 80);
      };

      if (fullImgLoader.complete) {
        triggerDevelopment();
      } else {
        fullImgLoader.onload = triggerDevelopment;
      }
    }

    const handleEnd = (e) => {
      if (e.target !== polaroidCard) return;
      polaroidCard.removeEventListener('transitionend', handleEnd);
      this.isAnimating = false;
      if (onComplete) onComplete();
    };

    polaroidCard.addEventListener('transitionend', handleEnd);
  }

  /**
   * 🛬 Уход карточки обратно вниз
   */
  animateDrop(polaroidCard, backdropEl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    const imgElement = document.getElementById('lightbox-img');
    if (imgElement) {
      imgElement.classList.remove('developed');
    }

    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.35s ease';
      backdropEl.style.opacity = '0';
    }

    const endY = window.innerHeight;

    Object.assign(polaroidCard.style, {
      transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
      transform: `translateY(${endY}px) scale(0.95)`,
      opacity: '0'
    });

    const handleEnd = (e) => {
      if (e.target !== polaroidCard) return;
      polaroidCard.removeEventListener('transitionend', handleEnd);

      polaroidCard.style.transform = '';
      polaroidCard.style.opacity = '';
      polaroidCard.style.width = '';

      const polaroidFrame = polaroidCard.querySelector('.polaroid-frame');
      if (polaroidFrame) {
        polaroidFrame.style.aspectRatio = '';
      }

      if (imgElement) {
        imgElement.src = '';
      }

      this.isAnimating = false;
      if (onComplete) onComplete();
    };

    polaroidCard.addEventListener('transitionend', handleEnd);
  }
}