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
        this.inputCooldown = 300;

        if (typeof Game !== 'undefined' && Game.resizeDisplay) {
            Game.resizeDisplay();
        }

        this.setupTouch();
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

    getLayout() {
        const safe = Utils.getViewSafe();
        const compact = Utils.isCompactView();
        const titleY = safe.top + (compact ? 32 : 48);
        const startY = safe.top + (compact ? 72 : 100);
        const itemHeight = compact ? 56 : 70;
        const footerY = safe.bottom - (compact ? 14 : 24);

        return {
            safe,
            compact,
            cx: safe.centerX,
            left: safe.left,
            right: safe.right,
            width: safe.contentWidth,
            titleY,
            startY,
            itemHeight,
            footerY,
        };
    },

    drawOptionRow(ctx, option, index, layout) {
        const { compact, cx, left, right, width, startY, itemHeight } = layout;
        const y = startY + index * itemHeight;
        const isSelected = index === this.selectedIndex;
        const labelSize = compact ? 14 : 18;
        const ctrlSize = compact ? 13 : 16;

        if (option.type === 'slider' || option.type === 'selector') {
            const labelY = compact ? y - 4 : y;
            const ctrlY = compact ? y + 16 : y;
            const labelW = compact ? width : width * 0.42;
            const ctrlW = compact ? width * 0.62 : width * 0.52;
            const ctrlLeft = right - ctrlW;

            ctx.fillStyle = isSelected ? '#fff' : '#888';
            Utils.drawFitLeftText(
                ctx,
                option.name,
                left,
                labelY,
                labelSize,
                10,
                isSelected ? 'bold {size}px "Courier New"' : '{size}px "Courier New"',
                labelW
            );

            if (option.type === 'selector') {
                const value = option.getValue();
                ctx.fillStyle = isSelected ? COLORS.PRIMARY : '#ccc';
                const valueSize = Utils.fitFontSize(
                    ctx,
                    value,
                    ctrlSize,
                    10,
                    'bold {size}px "Courier New"',
                    ctrlW * 0.45
                );
                ctx.font = Utils._font('bold {size}px "Courier New"', valueSize);

                if (isSelected) {
                    ctx.textAlign = 'left';
                    ctx.fillStyle = COLORS.PRIMARY;
                    ctx.fillText('<', ctrlLeft, ctrlY);
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(value, ctrlLeft + ctrlW * 0.5, ctrlY);
                    ctx.textAlign = 'right';
                    ctx.fillStyle = COLORS.PRIMARY;
                    ctx.fillText('>', right, ctrlY);
                } else {
                    ctx.textAlign = 'right';
                    ctx.fillStyle = '#ccc';
                    ctx.fillText(value, right, ctrlY);
                }
            } else {
                const value = Math.round(option.getValue() * 10);
                const dots = '▮'.repeat(value) + '▯'.repeat(10 - value);
                ctx.fillStyle = isSelected ? '#fff' : '#888';

                if (isSelected) {
                    ctx.textAlign = 'left';
                    ctx.fillStyle = COLORS.PRIMARY;
                    ctx.fillText('<', ctrlLeft, ctrlY);
                    Utils.drawFitCenterText(
                        ctx,
                        dots,
                        ctrlY,
                        ctrlSize,
                        10,
                        '{size}px "Courier New"',
                        ctrlLeft + ctrlW * 0.5,
                        ctrlW * 0.55
                    );
                    ctx.textAlign = 'right';
                    ctx.fillStyle = COLORS.PRIMARY;
                    ctx.fillText('>', right, ctrlY);
                } else {
                    ctx.textAlign = 'right';
                    ctx.fillStyle = '#888';
                    Utils.drawFitCenterText(
                        ctx,
                        dots,
                        ctrlY,
                        ctrlSize,
                        10,
                        '{size}px "Courier New"',
                        right - ctrlW * 0.25,
                        ctrlW * 0.5
                    );
                }
            }
            return { y, ctrlLeft, ctrlW, ctrlY };
        }

        const label = isSelected ? `> ${option.name} <` : option.name;
        ctx.fillStyle = isSelected ? '#fff' : '#888';
        Utils.drawFitCenterText(
            ctx,
            label,
            y,
            compact ? 18 : 24,
            12,
            isSelected ? 'bold {size}px "Courier New"' : '{size}px "Courier New"',
            cx,
            width
        );
        return { y, ctrlLeft: left, ctrlW: width, ctrlY: y };
    },

    handleTouch(e) {
        if (!this.active) return;
        e.preventDefault();

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
        const layout = this.getLayout();

        for (let i = 0; i < this.options.length; i++) {
            const option = this.options[i];
            const rowY = layout.startY + i * layout.itemHeight;
            const rowTop = rowY - (layout.compact ? 18 : 24);
            const rowBottom = rowY + (layout.compact ? 28 : 20);

            if (y < rowTop || y > rowBottom) continue;

            if (option.type === 'slider' || option.type === 'selector') {
                const ctrlW = layout.compact ? layout.width * 0.62 : layout.width * 0.52;
                const ctrlLeft = layout.right - ctrlW;
                const ctrlMid = ctrlLeft + ctrlW * 0.5;

                if (x < ctrlMid) {
                    option.action(this, -1);
                    this.selectedIndex = i;
                } else if (x > ctrlMid) {
                    option.action(this, 1);
                    this.selectedIndex = i;
                } else {
                    this.selectedIndex = i;
                }
                return;
            }

            this.selectedIndex = i;
            option.action(this);
            return;
        }
    },

    draw(ctx) {
        if (!this.active) return;

        const layout = this.getLayout();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        ctx.save();
        ctx.shadowColor = COLORS.PRIMARY;
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#fff';
        Utils.drawFitCenterText(
            ctx,
            'PAUSED',
            layout.titleY,
            layout.compact ? 32 : 48,
            20,
            'bold {size}px "Courier New"',
            layout.cx,
            layout.width
        );
        ctx.restore();

        for (let i = 0; i < this.options.length; i++) {
            this.drawOptionRow(ctx, this.options[i], i, layout);
        }

        ctx.fillStyle = '#666';
        const footer = layout.compact ? 'Tap rows to change · arrows to move' : 'Use Arrows/Touch to Navigate';
        Utils.drawFitCenterText(
            ctx,
            footer,
            layout.footerY,
            layout.compact ? 10 : 14,
            8,
            '{size}px "Courier New"',
            layout.cx,
            layout.width
        );
    }
};
