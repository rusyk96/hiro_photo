/**
 * 🎬 Модуль поднятия карточки (FLIP Animation Engine)
 * Отполированная режиссура: плавное паспарту, идеальное затемнение и точечный взлет.
 */

export class CardRaiseAnimation {
  constructor() {
    this.activeClone = null;
  }

  /**
   * 🛫 Взлет кадра и плавный раскрывающийся паспарту
   */
  animateRaise(sourceImg, polaroidCard, backdropEl, onComplete) {
    if (!sourceImg || !polaroidCard) {
      if (onComplete) onComplete();
      return;
    }

    // 1. Точные координаты и стили исходика в Bento-сетке
    const rect = sourceImg.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(sourceImg);

    // 2. Прячем целевой полароид до конца анимации
    polaroidCard.style.opacity = '0';

    // 3. Создаем клон, идентичный картинке в сетке (без рамок!)
    const clone = document.createElement('div');
    const cloneImg = document.createElement('img');
    cloneImg.src = sourceImg.src;

    // Вкладываем картинку в клон для имитации паспарту
    clone.appendChild(cloneImg);
    this.activeClone = clone;

    // Стили картинки внутри клона
    Object.assign(cloneImg.style, {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: computedStyle.borderRadius || '8px',
      transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
    });

    // Стили самого летящего контейнера (на старте без паспарту)
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      padding: '0px', // Паспарту изначально 0!
      background: 'transparent',
      borderRadius: computedStyle.borderRadius || '8px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
      zIndex: '10001',
      pointerEvents: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
    });

    document.body.appendChild(clone);
    sourceImg.style.visibility = 'hidden';

    // 4. Плавно проявляем затемнение фона
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      backdropEl.style.opacity = '1';
    }

    // 5. Полет в центр с "раскрытием" паспарту
    requestAnimationFrame(() => {
      const targetRect = polaroidCard.getBoundingClientRect();

      // Контейнер превращается в белый Полароид
      Object.assign(clone.style, {
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        padding: '14px 14px 42px 14px', // 💥 Раскрываем паспарту во время полета!
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        transform: 'scale(1.02)' // Лёгкий пружинящий овершут
      });

      // Внутренняя картинка подстраивается под рамку
      Object.assign(cloneImg.style, {
        objectFit: 'contain',
        borderRadius: '4px'
      });
    });

    // 6. Передача управления настоящему лайтбоксу
    const handleTransitionEnd = (e) => {
      if (e.target !== clone) return;
      clone.removeEventListener('transitionend', handleTransitionEnd);

      polaroidCard.style.opacity = '1';
      
      if (this.activeClone) {
        this.activeClone.remove();
        this.activeClone = null;
      }
      sourceImg.style.visibility = 'visible';

      if (onComplete) onComplete();
    };

    clone.addEventListener('transitionend', handleTransitionEnd);
  }

  /**
   * 🛬 Плавная посадка обратно
   */
  animateDrop(targetImg, polaroidCard, backdropEl, onComplete) {
    if (!targetImg || !polaroidCard) {
      if (onComplete) onComplete();
      return;
    }

    const currentRect = polaroidCard.getBoundingClientRect();
    const targetRect = targetImg.getBoundingClientRect();

    // Создаем клон для обратного полета
    const clone = polaroidCard.cloneNode(true);
    this.activeClone = clone;

    Object.assign(clone.style, {
      position: 'fixed',
      top: `${currentRect.top}px`,
      left: `${currentRect.left}px`,
      width: `${currentRect.width}px`,
      height: `${currentRect.height}px`,
      margin: '0',
      zIndex: '10001',
      pointerEvents: 'none',
      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
    });

    document.body.appendChild(clone);
    polaroidCard.style.opacity = '0';
    targetImg.style.visibility = 'hidden';

    // Гасим фон
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.35s ease';
      backdropEl.style.opacity = '0';
    }

    requestAnimationFrame(() => {
      Object.assign(clone.style, {
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        padding: '0px', // Схлопываем паспарту обратно
        background: 'transparent',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        opacity: '0.2'
      });
    });

    const handleTransitionEnd = (e) => {
      if (e.target !== clone) return;
      clone.removeEventListener('transitionend', handleTransitionEnd);

      if (this.activeClone) {
        this.activeClone.remove();
        this.activeClone = null;
      }
      targetImg.style.visibility = 'visible';

      if (onComplete) onComplete();
    };

    clone.addEventListener('transitionend', handleTransitionEnd);
  }
}