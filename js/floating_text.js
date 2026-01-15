// ============================================
// The Chrono-Splinter - Floating Text System
// ============================================

class FloatingText {
    constructor(x, y, text, color, duration = 800) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = duration;
        this.maxLife = duration;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: -2 - Math.random() * 2
        };
        this.active = true;
    }

    update(deltaTime) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life -= deltaTime;

        // Gravity/Drag
        this.velocity.y += 0.1;

        if (this.life <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        const progress = this.life / this.maxLife;
        const alpha = Math.max(0, Math.min(1, progress));
        const scale = 1 + (1 - progress) * 0.5; // Grow slightly

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;

        // Text Outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 20px "Courier New"';
        ctx.strokeText(this.text, 0, 0);

        // Text Fill
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);

        ctx.restore();
    }
}

class FloatingTextManager {
    constructor() {
        this.texts = [];
    }

    spawn(x, y, text, color) {
        this.texts.push(new FloatingText(x, y, text, color));
    }

    clear() {
        this.texts = [];
    }

    update(deltaTime) {
        for (const text of this.texts) {
            text.update(deltaTime);
        }
        this.texts = this.texts.filter(t => t.active);
    }

    draw(ctx) {
        for (const text of this.texts) {
            text.draw(ctx);
        }
    }
}
