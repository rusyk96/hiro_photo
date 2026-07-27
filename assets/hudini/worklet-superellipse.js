registerPaint('superellipse', class {
    static get inputProperties() {
        return [
            '--squircle-radius',
            '--squircle-smoothness',
            '--superellipse-color'
        ];
    }

    paint(ctx, geom, properties) {
        const w = geom.width;
        const h = geom.height;

        // Радиус скругления угла (по умолчанию 32px)
        const rawR = properties.get('--squircle-radius');
        let r = parseFloat(rawR ? rawR.toString() : 32) || 32;
        r = Math.min(r, w / 2, h / 2); // Защита от перекрытия

        // Плавность перехода кривой (0.6 — стандарт Figma/iOS, 1.0 — максимальный сквиркл)
        const rawSmooth = properties.get('--squircle-smoothness');
        const smooth = parseFloat(rawSmooth ? rawSmooth.toString() : 0.6) || 0.6;

        const rawColor = properties.get('--superellipse-color');
        const color = rawColor ? rawColor.toString().trim() : '#ffffff';

        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();

        // Дистанция управления контрольными точками Безье
        const p = (1 + smooth) * r;

        // Рисуем контур с плоскими прямыми и органика-углами
        ctx.moveTo(r, 0);
        
        // Верхняя грань -> Правый верхний угол
        ctx.lineTo(w - r, 0);
        ctx.bezierCurveTo(w - r + p * 0.5, 0, w, r - p * 0.5, w, r);

        // Правая грань -> Правый нижний угол
        ctx.lineTo(w, h - r);
        ctx.bezierCurveTo(w, h - r + p * 0.5, w - r + p * 0.5, h, w - r, h);

        // Нижняя грань -> Левый нижний угол
        ctx.lineTo(r, h);
        ctx.bezierCurveTo(r - p * 0.5, h, 0, h - r + p * 0.5, 0, h - r);

        // Левая грань -> Левый верхний угол
        ctx.lineTo(0, r);
        ctx.bezierCurveTo(0, r - p * 0.5, r - p * 0.5, 0, r, 0);

        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }
});