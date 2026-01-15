// ============================================
// The Chrono-Splinter - Settings Menu
// ============================================

const Settings = {
    active: false,
    difficulty: 'EASY',
    selectedIndex: 0,
    inputCooldown: 0,
    onClose: null,

    options: [
        {
            name: 'RESUME',
            action: (menu) => menu.close()
        },
        {
            name: 'DIFFICULTY',
            type: 'selector',
            getValue: () => Settings.difficulty,
            action: (menu, dir) => {
                const levels = Object.keys(DIFFICULTIES);
                let idx = levels.indexOf(Settings.difficulty);
                if (idx === -1) idx = 0; // fallback
                idx = (idx + dir + levels.length) % levels.length;
                Settings.difficulty = levels[idx];
                Audio.play('laser');
            }
        },
        {
            name: 'MUSIC VOLUME',
            type: 'slider',
            getValue: () => Audio.musicVolume,
            action: (menu, dir) => {
                const step = 0.1;
                const newVal = Utils.clamp(Audio.musicVolume + dir * step, 0, 1);
                Audio.setMusicVolume(newVal);
                // Play a snippet (optional, but might be jarring if music is playing)
            }
        },
        {
            name: 'SFX VOLUME',
            type: 'slider',
            getValue: () => Audio.volume,
            action: (menu, dir) => {
                const step = 0.1;
                const newVal = Utils.clamp(Audio.volume + dir * step, 0, 1);
                Audio.setVolume(newVal);
                Audio.play('laser'); // Feedback
            }
        },
        {
            name: 'QUIT TO TITLE',
            action: (menu) => location.reload()
        }
    ],

    open(onClose) {
        this.active = true;
        this.onClose = onClose;
        this.selectedIndex = 0;
        this.inputCooldown = 300; // Initial delay to prevent accidental inputs

        // Setup input handlers
        this.setupTouch();

        // Hide Game UI
        UI.hideGameplayUI();
    },

    close() {
        this.active = false;
        this.removeTouch();

        // Show Game UI
        UI.showGameplayUI();

        if (this.onClose) this.onClose();
    },

    toggle(onClose) {
        if (this.active) this.close();
        else this.open(onClose);
    },

    setupTouch() {
        this.touchHandler = (e) => this.handleTouch(e);
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('mousedown', this.touchHandler);
        canvas.addEventListener('touchstart', this.touchHandler);
    },

    removeTouch() {
        const canvas = document.getElementById('gameCanvas');
        if (this.touchHandler) {
            canvas.removeEventListener('mousedown', this.touchHandler);
            canvas.removeEventListener('touchstart', this.touchHandler);
        }
    },

    update(deltaTime) {
        if (!this.active) return;

        if (this.inputCooldown > 0) {
            this.inputCooldown -= deltaTime;
        } else {
            Input.updateGamepad();

            // Navigation
            let dy = 0;
            if (Input.isPressed('ArrowUp') || Input.isPressed('KeyW')) dy = -1;
            if (Input.isPressed('ArrowDown') || Input.isPressed('KeyS')) dy = 1;

            if (Input.gamepad) {
                const axisY = Input.getGamepadAxis(1);
                if (axisY < -0.5 || Input.isGamepadButtonPressed(12)) dy = -1;
                if (axisY > 0.5 || Input.isGamepadButtonPressed(13)) dy = 1;
            }

            if (dy !== 0) {
                this.selectedIndex = (this.selectedIndex + dy + this.options.length) % this.options.length;
                this.inputCooldown = 200;
                Audio.play('laser');
            }

            // Action / Slider
            let dx = 0;
            const currentOption = this.options[this.selectedIndex];

            if (currentOption.type === 'slider') {
                if (Input.isPressed('ArrowLeft') || Input.isPressed('KeyA')) dx = -1;
                if (Input.isPressed('ArrowRight') || Input.isPressed('KeyD')) dx = 1;

                if (Input.gamepad) {
                    const axisX = Input.getGamepadAxis(0);
                    if (axisX < -0.5 || Input.isGamepadButtonPressed(14)) dx = -1;
                    if (axisX > 0.5 || Input.isGamepadButtonPressed(15)) dx = 1;
                }

                if (dx !== 0) {
                    currentOption.action(this, dx);
                    this.inputCooldown = 150; // Faster repeat for sliders
                }
            } else if (currentOption.type === 'selector') {
                if (Input.isPressed('ArrowLeft') || Input.isPressed('KeyA')) dx = -1;
                if (Input.isPressed('ArrowRight') || Input.isPressed('KeyD')) dx = 1;
                // Gamepad axes/dpad
                if (Input.gamepad) {
                    const axisX = Input.getGamepadAxis(0);
                    if (axisX < -0.5 || Input.isGamepadButtonPressed(14)) dx = -1;
                    if (axisX > 0.5 || Input.isGamepadButtonPressed(15)) dx = 1;
                }
                if (dx !== 0) {
                    currentOption.action(this, dx);
                    this.inputCooldown = 200;
                }
            } else {
                // Button
                if (Input.isPressed('Enter') || Input.isPressed('Space') ||
                    (Input.gamepad && Input.isGamepadButtonPressed(0))) {
                    currentOption.action(this);
                    this.inputCooldown = 300;
                }
            }

            // Close with Escape/Start
            if (Input.isPressed('Escape') || (Input.gamepad && Input.isGamepadButtonPressed(9))) {
                this.close();
                this.inputCooldown = 300;
            }
        }
    },

    handleTouch(e) {
        if (!this.active) return;
        e.preventDefault();

        // Get coordinates
        let clientX, clientY;
        if (e.type === 'touchstart') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const coords = Input.getCanvasCoords(clientX, clientY);
        const x = coords.x;
        const y = coords.y;

        const startY = 180;
        const itemHeight = 70;

        for (let i = 0; i < this.options.length; i++) {
            const itemY = startY + i * itemHeight;
            const option = this.options[i];

            // Check row bounds
            if (y > itemY - 25 && y < itemY + 35) {
                if (option.type === 'slider') {
                    // Check left/right buttons for slider
                    if (x > GAME.WIDTH / 2 + 60 && x < GAME.WIDTH / 2 + 100) {
                        // Decrease (<)
                        option.action(this, -1);
                        this.selectedIndex = i;
                    } else if (x > GAME.WIDTH / 2 + 200 && x < GAME.WIDTH / 2 + 240) {
                        // Increase (>)
                        option.action(this, 1);
                        this.selectedIndex = i;
                    }
                } else if (option.type === 'selector') {
                    // Check left/right buttons for selector (reuse slider zones roughly)
                    if (x > GAME.WIDTH / 2 + 20 && x < GAME.WIDTH / 2 + 100) {
                        // Decrease (<)
                        option.action(this, -1);
                        this.selectedIndex = i;
                    } else if (x > GAME.WIDTH / 2 + 200 && x < GAME.WIDTH / 2 + 280) {
                        // Increase (>)
                        option.action(this, 1);
                        this.selectedIndex = i;
                    }
                } else {
                    // Button click
                    if (x > GAME.WIDTH / 2 - 150 && x < GAME.WIDTH / 2 + 150) {
                        this.selectedIndex = i;
                        option.action(this);
                    }
                }
            }
        }

        // Close if click outside (optional, maybe just keep forced interaction)
    },

    draw(ctx) {
        if (!this.active) return;

        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        ctx.save();
        ctx.shadowColor = COLORS.PRIMARY;
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', GAME.WIDTH / 2, 100);
        ctx.restore();

        const startY = 180;
        const itemHeight = 70;

        for (let i = 0; i < this.options.length; i++) {
            const option = this.options[i];
            const y = startY + i * itemHeight;
            const isSelected = i === this.selectedIndex;

            // Selection indicator
            if (isSelected) {
                ctx.fillStyle = COLORS.PRIMARY;
                ctx.font = 'bold 24px "Courier New"';
                ctx.fillText('> ', GAME.WIDTH / 2 - 160, y);
                ctx.fillText(' <', GAME.WIDTH / 2 + 160, y);
            }

            ctx.fillStyle = isSelected ? '#fff' : '#888';
            ctx.font = isSelected ? 'bold 24px "Courier New"' : '24px "Courier New"';
            ctx.textAlign = 'center';

            if (option.type === 'slider') {
                ctx.fillText(option.name, GAME.WIDTH / 2 - 100, y);

                // Draw sliders
                const value = Math.round(option.getValue() * 10);
                const dots = '▮'.repeat(value) + '▯'.repeat(10 - value);

                // Draw buttons for touch
                ctx.fillStyle = isSelected ? COLORS.PRIMARY : '#666';
                ctx.fillText('<', GAME.WIDTH / 2 + 80, y);
                ctx.fillText('>', GAME.WIDTH / 2 + 220, y);

                ctx.fillStyle = isSelected ? '#fff' : '#888';
                ctx.fillText(dots, GAME.WIDTH / 2 + 150, y);

            } else if (option.type === 'selector') {
                ctx.fillText(option.name, GAME.WIDTH / 2 - 100, y);

                const value = option.getValue();
                ctx.fillStyle = isSelected ? COLORS.PRIMARY : '#ccc';
                ctx.fillText(value, GAME.WIDTH / 2 + 150, y);

                if (isSelected) {
                    ctx.fillStyle = COLORS.PRIMARY;
                    ctx.fillText('<', GAME.WIDTH / 2 + 60, y);
                    ctx.fillText('>', GAME.WIDTH / 2 + 240, y);
                }
            } else {
                ctx.fillText(option.name, GAME.WIDTH / 2, y);
            }
        }

        // Instructions
        ctx.fillStyle = '#666';
        ctx.font = '14px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('Use Arrows/Touch to Navigate', GAME.WIDTH / 2, GAME.HEIGHT - 40);
    }
};
