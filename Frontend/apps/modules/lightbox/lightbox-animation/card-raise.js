/**
 * 🎬 Модуль поднятия карточки (Bottom-Up Cinema Lift)
 * Карточка элегантно поднимается снизу экрана с легким зумом и раскрытием паспарту.
 */

export class CardRaiseAnimation {
  constructor() {
    this.isAnimating = false;
  }

  /**
   * 🛫 Взлет карточки снизу вверх
   */
  animateRaise(polaroidCard, backdropEl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    // 1. Включаем плавность для фона
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      backdropEl.style.opacity = '1';
    }

    // 2. Задаем начальное положение карточки (внизу экрана, чуть уменьшена)
    Object.assign(polaroidCard.style, {
      transform: 'translateY(80px) scale(0.92)',
      opacity: '0',
      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease'
    });

    // 3. Запускаем подъем в центр
    requestAnimationFrame(() => {
      Object.assign(polaroidCard.style, {
        transform: 'translateY(0) scale(1)',
        opacity: '1'
      });
    });

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

    // Гасим фон
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.3s ease';
      backdropEl.style.opacity = '0';
    }

    // Опускаем карточку вниз
    Object.assign(polaroidCard.style, {
      transform: 'translateY(60px) scale(0.95)',
      opacity: '0',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease'
    });

    const handleEnd = (e) => {
      if (e.target !== polaroidCard) return;
      polaroidCard.removeEventListener('transitionend', handleEnd);
      
      // Сбрасываем стили для следующего открытия
      polaroidCard.style.transform = '';
      polaroidCard.style.opacity = '';
      
      this.isAnimating = false;
      if (onComplete) onComplete();
    };

    polaroidCard.addEventListener('transitionend', handleEnd);
  }
}