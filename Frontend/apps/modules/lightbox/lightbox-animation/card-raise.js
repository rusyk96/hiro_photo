/**
 * 🎬 Модуль выдвижения карточки с ориентацией из JSON (type: 'landscape' | 'portrait')
 */

export class CardRaiseAnimation {
  constructor() {
    this.isAnimating = false;
  }

  /**
   * 🛫 Выдвижение с зафиксированным типом из JSON и последующей проявкой
   * @param {HTMLElement} polaroidCard 
   * @param {HTMLElement} backdropEl 
   * @param {Object} photoData - объект из JSON вида { name: "...", type: "landscape" }
   * @param {string} fullImgUrl - полный путь к картинке
   * @param {Function} onComplete 
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

    // Считываем поле "type" напрямую из твоего JSON
    const cardType = photoData?.type === 'portrait' ? 'portrait' : 'landscape';
    polaroidCard.classList.add(cardType);

    // 3. 🌑 Затемнение фона
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      backdropEl.style.opacity = '1';
    }

    // 4. 🛫 Взлет карточки с зафиксированными пропорциями
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

    // 5. 🧪 Подгрузка и химическая проявка
    if (imgElement && fullImgUrl) {
      const loader = new Image();
      loader.src = fullImgUrl;

      const triggerDevelopment = () => {
        imgElement.src = fullImgUrl;
        setTimeout(() => {
          if (imgElement) {
            imgElement.style.opacity = '';
            imgElement.classList.add('developed');
          }
        }, 30);
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
   * 🛬 Уход карточки обратно вниз
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