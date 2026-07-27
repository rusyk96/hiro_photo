/**
 * 🎬 Модуль выдвижения карточки с ориентацией из JSON (type: 'landscape' | 'portrait')
 */

export class CardRaiseAnimation {
  constructor() {
    this.isAnimating = false;
  }

  /**
   * 🛫 Выдвижение с зафиксированным типом из JSON и последующей проявкой
   */
  animateRaise(polaroidCard, backdropEl, photoData, fullImgUrl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    const imgElement = document.getElementById('lightbox-img');

    // 1. 🧹 РЕСЕТ СТАРОГО СОСТОЯНИЯ
    if (imgElement) {
      imgElement.classList.remove('developed');
      imgElement.style.opacity = '0';
      imgElement.src = '';
    }

    // 2. 📐 МГНОВЕННАЯ УСТАНОВКА ОРИЕНТАЦИИ ИЗ JSON (ЗА КАДРОМ)
    polaroidCard.classList.remove('landscape', 'portrait');

    const cardType = photoData?.type === 'portrait' ? 'portrait' : 'landscape';
    polaroidCard.classList.add(cardType);

    // 3. 🌑 Затемнение фона (300ms для быстрого отклика)
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      backdropEl.style.opacity = '1';
    }

    // 4. 🛫 Взлет карточки (ускорен до 0.35s)
    const startY = window.innerHeight;
    Object.assign(polaroidCard.style, {
      transition: 'none',
      transform: `translateY(${startY}px) scale(0.92)`,
      opacity: '0'
    });

    requestAnimationFrame(() => {
      Object.assign(polaroidCard.style, {
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
        transform: 'translateY(0) scale(1)',
        opacity: '1'
      });
    });

    // 5. 🧪 Подгрузка и химическая проявка (ровно 1s по CSS)
    if (imgElement && fullImgUrl) {
      const loader = new Image();
      loader.src = fullImgUrl;

      const triggerDevelopment = () => {
        imgElement.src = fullImgUrl;
        // Небольшой микротаск для гарантированного применения transition
        requestAnimationFrame(() => {
          if (imgElement) {
            imgElement.style.opacity = '';
            imgElement.classList.add('developed');
          }
        });
      };

      if (loader.complete) {
        triggerDevelopment();
      } else {
        loader.onload = triggerDevelopment;
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
   * 🛬 Быстрый уход карточки обратно вниз (250ms)
   */
  animateDrop(polaroidCard, backdropEl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    const imgElement = document.getElementById('lightbox-img');
    if (imgElement) {
      imgElement.classList.remove('developed');
      imgElement.style.opacity = '0';
    }

    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.25s ease';
      backdropEl.style.opacity = '0';
    }

    const endY = window.innerHeight;

    Object.assign(polaroidCard.style, {
      transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
      transform: `translateY(${endY}px) scale(0.95)`,
      opacity: '0'
    });

    const handleEnd = (e) => {
      if (e.target !== polaroidCard) return;
      polaroidCard.removeEventListener('transitionend', handleEnd);

      polaroidCard.style.transform = '';
      polaroidCard.style.opacity = '';
      polaroidCard.classList.remove('landscape', 'portrait');

      if (imgElement) {
        imgElement.src = '';
      }

      this.isAnimating = false;
      if (onComplete) onComplete();
    };

    polaroidCard.addEventListener('transitionend', handleEnd);
  }
}