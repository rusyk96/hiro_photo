/**
 * Dev-инструмент для мониторинга VRAM в реальном времени
 */
export class VramMonitor {
  constructor() {
    this.hudElement = null;
    this.createHud();
    this.startLoop();
  }

  createHud() {
    this.hudElement = document.createElement('div');
    this.hudElement.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #00ff88;
      font-family: monospace;
      font-size: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      z-index: 999999;
      pointer-events: none;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      gap: 4px;
    `;
    document.body.appendChild(this.hudElement);
  }

  calculateVram() {
    // Находим все картинки, у которых СЕЙЧАС загружен src
    const activeImages = Array.from(document.querySelectorAll('.gallery-img')).filter(img => {
      const src = img.getAttribute('src');
      return src && src !== '' && !src.startsWith('data:image/gif');
    });

    let totalBytes = 0;

    activeImages.forEach(img => {
      // Берём реальное разрешение сжатого кадра в пикселях
      const width = img.naturalWidth || 1920; 
      const height = img.naturalHeight || 1080;
      
      // В VRAM картинка раскладывается в RGBA (4 байта на пиксель)
      // + добавляем ~33% запаса на Mipmaps/Render Surfaces
      const bytesInGpu = width * height * 4 * 1.33; 
      totalBytes += bytesInGpu;
    });

    const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
    return { count: activeImages.length, mb: totalMB };
  }

  startLoop() {
    const update = () => {
      const { count, mb } = this.calculateVram();
      
      // Цвет индикатора в зависимости от опасности вылета Safari (> 350 MB)
      let color = '#00ff88';
      if (mb > 200) color = '#ffb700';
      if (mb > 350) color = '#ff4444';

      this.hudElement.innerHTML = `
        <div><span style="color:#aaa">GPU Active Imgs:</span> <b>${count}</b></div>
        <div><span style="color:#aaa">Est. VRAM Usage:</span> <b style="color:${color}">${mb} MB</b></div>
      `;

      requestAnimationFrame(update);
    };

    update();
  }
}