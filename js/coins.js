// ============================================
// The Chrono-Splinter - Coin System
// ============================================

class Coin {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.width = 15;
        this.height = 15;
        this.active = true;
        this.speed = 1;
        this.bobPhase = Math.random() * Math.PI * 2;
    }

    update(deltaTime, player) {
        // Magnet attraction
        if (player.activePowerups.MAGNET) {
            const dist = Utils.distance(this.x, this.y, player.x + player.width / 2, player.y + player.height / 2);
            if (dist < 200) {
                const angle = Utils.angle(this.x, this.y, player.x + player.width / 2, player.y + player.height / 2);
                this.x += Math.cos(angle) * 8;
                this.y += Math.sin(angle) * 8;
            }
        } else {
            this.y += this.speed;
        }

        this.bobPhase += deltaTime / 150;

        if (this.y > GAME.HEIGHT + 50) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.save();
        const scale = 1 + Math.sin(this.bobPhase) * 0.1;

        ctx.fillStyle = COLORS.COINS;
        ctx.shadowColor = COLORS.COINS;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#b8860b';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('◆', this.x, this.y);

        ctx.restore();
    }
}

class CoinManager {
    constructor() {
        this.coins = [];
    }

    spawn(x, y, amount) {
        for (let i = 0; i < amount; i++) {
            const offsetX = Utils.random(-20, 20);
            const offsetY = Utils.random(-20, 20);
            this.coins.push(new Coin(x + offsetX, y + offsetY, 1));
        }
    }

    update(deltaTime, player) {
        for (const coin of this.coins) {
            coin.update(deltaTime, player);
        }
        this.coins = this.coins.filter(c => c.active);
    }

    checkCollection(player) {
        for (const coin of this.coins) {
            if (Utils.rectCollision(coin, player)) {
                player.addCoins(coin.value);
                coin.active = false;
            }
        }
    }

    draw(ctx) {
        for (const coin of this.coins) {
            coin.draw(ctx);
        }
    }

    clear() {
        this.coins = [];
    }
}
