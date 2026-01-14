// ============================================
// The Chrono-Splinter - Galaxy Map
// ============================================

const GameMap = {
    active: false,
    inputCooldown: 0,

    // Planet definitions
    planets: [
        { id: 1, name: 'MERCURY', color: '#ffaa00', size: 15 },
        { id: 2, name: 'VENUS', color: '#ddccaa', size: 18 },
        { id: 3, name: 'EARTH', color: '#4488ff', size: 20 },
        { id: 4, name: 'MOON', color: '#aaaaaa', size: 12 },
        { id: 5, name: 'MARS', color: '#ff4400', size: 16 },
        { id: 6, name: 'BELT', color: '#886644', size: 14 },
        { id: 7, name: 'JUPITER', color: '#dd9955', size: 30 },
        { id: 8, name: 'EUROPA', color: '#aabbff', size: 12 },
        { id: 9, name: 'SATURN', color: '#eedd88', size: 28 },
        { id: 10, name: 'URANUS', color: '#88ffff', size: 22 },
        { id: 11, name: 'NEPTUNE', color: '#4444ff', size: 22 },
        { id: 12, name: 'EDGE', color: '#220044', size: 18 },
    ],

    open() {
        this.active = true;
        this.inputCooldown = 300;
        // Pause game if not already
        if (!Game.paused && !Game.inShop && !Game.victory) {
            Game.paused = true;
        }
    },

    close() {
        this.active = false;
        this.inputCooldown = 300;
        Game.paused = false;
    },

    toggle() {
        if (this.active) this.close();
        else this.open();
    },

    update(deltaTime) {
        if (!this.active) return;

        if (this.inputCooldown > 0) {
            this.inputCooldown -= deltaTime;
        }

        Input.updateGamepad();

        if (this.inputCooldown <= 0) {
            if (Input.isPressed('Escape') || Input.isPressed('KeyM') ||
                (Input.gamepad && Input.isGamepadButtonPressed(9))) {
                this.close();
            }
        }

        if (Input.touch.active && this.inputCooldown <= 0) {
            const touch = Input.getTouchTarget() || { x: Input.touch.currentX, y: Input.touch.currentY };
            const clickedChapter = this.checkClick(touch.x, touch.y);

            if (clickedChapter) {
                console.log(`🚀 Warp to Chapter ${clickedChapter}`);
                this.close();
                Game.startChapter(clickedChapter);
            }
        }
    },

    checkClick(x, y) {
        const cx = GAME.WIDTH / 2;
        const cy = GAME.HEIGHT / 2;
        const spacing = 60; // Tighter spacing for 12 planets
        const totalWidth = (this.planets.length - 1) * spacing;
        const startX = cx - totalWidth / 2;

        for (const p of this.planets) {
            const planetX = startX + (p.id - 1) * spacing;
            const planetY = cy;

            const dx = x - planetX;
            const dy = y - planetY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < p.size + 15) {
                return p.id;
            }
        }
        return null;
    },

    draw(ctx) {
        if (!this.active) return;

        // Overlay background
        ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        const cx = GAME.WIDTH / 2;
        const cy = GAME.HEIGHT / 2;
        const spacing = 60;
        const totalWidth = (this.planets.length - 1) * spacing;
        const startX = cx - totalWidth / 2;

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('SOLAR SYSTEM MAP', cx, cy - 100);

        ctx.font = '16px "Courier New"';
        ctx.fillStyle = '#888';
        ctx.fillText('CLICK PLANET TO WARP (DEBUG)', cx, cy + 100);

        // Draw Orbital Path (Line)
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, cy);
        ctx.lineTo(startX + totalWidth, cy);
        ctx.stroke();

        // Draw Sun (Left of start)
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(startX - 60, cy, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Planets
        for (const p of this.planets) {
            const x = startX + (p.id - 1) * spacing;
            const y = cy;

            const isCurrent = p.id === Game.chapter;

            // Orbit ring highlighting
            if (isCurrent) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, p.size + 8, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Planet Body
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = isCurrent ? 15 : 0;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Label (Staggered to prevent overlap)
            ctx.fillStyle = isCurrent ? '#fff' : '#666';
            ctx.font = isCurrent ? 'bold 12px "Courier New"' : '10px "Courier New"';
            const labelY = p.id % 2 === 0 ? y + p.size + 25 : y - p.size - 15;
            ctx.fillText(p.name, x, labelY);

            if (isCurrent) {
                ctx.fillStyle = '#0f0';
                ctx.fillText('▼', x, y - p.size - 5);
            }
        }
    }
};
