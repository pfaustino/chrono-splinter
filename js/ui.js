// ============================================
// The Chrono-Splinter - UI System
// ============================================

const UI = {
    scoreEl: null,
    coinsEl: null,
    livesEl: null,
    chapterEl: null,
    weaponSlots: [],

    init() {
        this.scoreEl = document.getElementById('score');
        this.coinsEl = document.getElementById('coins');
        this.livesEl = document.getElementById('lives-display');
        this.chapterEl = document.getElementById('chapter-label');
        this.weaponSlots = [
            document.getElementById('weapon-slot-1'),
            document.getElementById('weapon-slot-2'),
        ];

        // Hide UI by default (Title Screen)
        this.hideGameplayUI();
    },

    showGameplayUI() {
        document.getElementById('hud').style.opacity = '1';
        document.getElementById('weapon-bar').style.opacity = '1';
    },

    hideGameplayUI() {
        document.getElementById('hud').style.opacity = '0';
        document.getElementById('weapon-bar').style.opacity = '0';
    },

    update(player, chapter) {
        this.scoreEl.textContent = Utils.padNumber(player.score, 7);
        this.coinsEl.textContent = player.coins;

        // Lives hearts
        let hearts = '';
        for (let i = 0; i < PLAYER.MAX_LIVES; i++) {
            hearts += i < player.lives ? '♥' : '♡';
        }
        this.livesEl.textContent = hearts;

        // Weapon slots
        for (let i = 0; i < 2; i++) {
            const slot = this.weaponSlots[i];
            if (player.weaponMods[i]) {
                const mod = POWERUP_TYPES[player.weaponMods[i]];
                slot.textContent = mod.symbol;
                slot.style.borderColor = mod.color;
                slot.classList.remove('empty');
                slot.classList.add('active');
            } else {
                slot.textContent = '';
                slot.style.borderColor = '';
                slot.classList.add('empty');
                slot.classList.remove('active');
            }
        }
    },

    setChapter(num, name) {
        this.chapterEl.textContent = `CHAPTER ${num}: ${name.toUpperCase()}`;
    },

    /**
     * Draw the Pause Button (Cogwheel)
     */
    /**
     * Draw the Pause Button (Cogwheel) and Map Button
     */
    drawPauseButton(ctx) {
        // Settings Icon (Cogwheel) - Moved down
        const settingsX = GAME.WIDTH - 40;
        const settingsY = 80;
        const r = 15;

        // Map Icon (Solar System) - Left of Settings
        const mapX = GAME.WIDTH - 90;
        const mapY = 80;
        const mapR = 15;

        // --- Draw Map Icon ---
        ctx.save();
        ctx.translate(mapX, mapY);

        // Background circle
        ctx.fillStyle = '#223';
        ctx.beginPath();
        ctx.arc(0, 0, mapR + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#445';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Sun
        ctx.fillStyle = '#fc0';
        ctx.beginPath();
        ctx.arc(-6, 6, 6, 0, Math.PI * 2);
        ctx.fill();

        // Orbit
        ctx.strokeStyle = '#667';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Planet
        ctx.fillStyle = '#48f';
        ctx.beginPath();
        ctx.arc(7, -7, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();


        // --- Draw Settings Icon ---
        ctx.save();
        ctx.translate(settingsX, settingsY);

        // Cogwheel body
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Teeth
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 4;
        for (let i = 0; i < 8; i++) {
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(r + 5, 0);
            ctx.stroke();
        }

        ctx.restore();
    },

    drawVersion(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '10px "Courier New"';
        ctx.textAlign = 'right';
        ctx.fillText(`v${GAME.VERSION}`, GAME.WIDTH - 10, GAME.HEIGHT - 10);
        ctx.restore();
    },

    /**
     * Check if Pause button was clicked
     */
    checkPauseClick(x, y) {
        // Settings Button (Right)
        if (x > GAME.WIDTH - 60 && y > 60 && y < 100) {
            return 'settings';
        }
        // Map Button (Left of Settings)
        if (x > GAME.WIDTH - 110 && x < GAME.WIDTH - 60 && y > 60 && y < 100) {
            return 'map';
        }
        return null;
    }
};
