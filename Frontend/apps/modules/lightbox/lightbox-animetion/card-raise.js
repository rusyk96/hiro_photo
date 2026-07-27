/**
 * 🎬 Модуль поднятия карточки (FLIP Animation Engine)
 * Отвечает за физику оторванной карточки: взлет из сетки, полет и обратную посадку.
 */

export class CardRaiseAnimation {
  constructor() {
    this.activeClone = null;
  }

  /**
   * 🛫 ФАЗА 1 и 2: Взлет карточки из Bento-сетки в центр лайтбокса
   */
  animateRaise(sourceImg, polaroidCard, onComplete) {
    if (!sourceImg || !polaroidCard) {
      if (onComplete) onComplete();
      return;
    }

    // 1. Снимаем геометрические координаты исходной карточки в сетке
    const rect = sourceImg.getBoundingClientRect();

    // 2. Делаем целевую модалку видимой в DOM, но прячем оригинальный полароид на время полёта
    polaroidCard.style.opacity = '0';

    // 3. Создаем временный «летящий» клон
    const clone = sourceImg.cloneNode(true);
    this.activeClone = clone;

    // Придаем клону стилистику полароида для плавного превращения
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: '0',
      objectFit: 'cover',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      zIndex: '10001',
      pointerEvents: 'none',
      transformOrigin: 'center center',
      transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
    });

    document.body.appendChild(clone);

    // Скрываем исходник в сетке, чтобы не дублировался визуально
    sourceImg.style.visibility = 'hidden';

    // 4. На следующем кадре пересчитываем координаты и запускаем полет в центр
    requestAnimationFrame(() => {
      const targetRect = polaroidCard.getBoundingClientRect();

      Object.assign(clone.style, {
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        borderRadius: '12px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        transform: 'scale(1.02)' // Микро-овершут (Elastic effect)
      });
    });

    // 5. Завершение полета: передаем эстафету настоящему полароиду
    const handleTransitionEnd = () => {
      clone.removeEventListener('transitionend', handleTransitionEnd);
      
      // Показываем настоящий полароид и убираем клон
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
   * 🛬 ФАЗА 3: Обратная посадка карточки из лайтбокса в Bento-сетку
   */
  animateDrop(targetImg, polaroidCard, onComplete) {
    if (!targetImg || !polaroidCard) {
      if (onComplete) onComplete();
      return;
    }

    const currentRect = polaroidCard.getBoundingClientRect();
    const targetRect = targetImg.getBoundingClientRect();

    // Создаем клон для полета назад
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

    requestAnimationFrame(() => {
      Object.assign(clone.style, {
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        opacity: '0.5'
      });
    });

    const handleTransitionEnd = () => {
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