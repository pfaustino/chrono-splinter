// ============================================
// The Chrono-Splinter - Upgrade Shop
// ============================================

const Shop = {
    active: false,
    selectedIndex: 0,

    upgrades: [
        { stat: 'ATK', name: 'ATTACK', desc: 'Increase bullet damage', baseCost: 50, perLevel: 30 },
        { stat: 'DEF', name: 'DEFENSE', desc: 'Reduce damage taken', baseCost: 50, perLevel: 30 },
        { stat: 'SPD', name: 'SPEED', desc: 'Move faster', baseCost: 40, perLevel: 25 },
        { stat: 'FIRE_RATE', name: 'FIRE RATE', desc: 'Shoot faster', baseCost: 60, perLevel: 35 },
    ],

    maxLevel: 5,

    // Input cooldowns
    inputCooldown: 0,
    inputRepeatDelay: 200,

    open(player, onClose) {
        this.active = true;
        this.player = player;
        this.onClose = onClose;
        this.selectedIndex = 0;
        this.inputCooldown = 0;

        if (typeof Game !== 'undefined' && Game.resizeDisplay) {
            Game.resizeDisplay();
        }

        // Hide UI
        UI.hideGameplayUI();

        // Set up input handling
        this.keyHandler = (e) => this.handleInput(e);
        window.addEventListener('keydown', this.keyHandler);

        // Touch/Click handler
        this.touchHandler = (e) => this.handleTouch(e);
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('mousedown', this.touchHandler);
        canvas.addEventListener('touchstart', this.touchHandler);
    },

    close() {
        this.active = false;
        window.removeEventListener('keydown', this.keyHandler);

        const canvas = document.getElementById('gameCanvas');
        canvas.removeEventListener('mousedown', this.touchHandler);
        canvas.removeEventListener('touchstart', this.touchHandler);

        if (this.onClose) this.onClose();
    },

    update(deltaTime) {
        if (!this.active) return;

        // Handle Gamepad Input
        if (this.inputCooldown > 0) {
            this.inputCooldown -= deltaTime;
        } else {
            Input.updateGamepad();
            if (Input.gamepad) {
                // Navigation (Stick or D-pad)
                const axisY = Input.getGamepadAxis(1);
                const dpadUp = Input.isGamepadButtonPressed(12);
                const dpadDown = Input.isGamepadButtonPressed(13);

                if (axisY < -0.5 || dpadUp) {
                    this.selectedIndex = (this.selectedIndex - 1 + this.upgrades.length) % this.upgrades.length;
                    this.inputCooldown = this.inputRepeatDelay;
                    Audio.play('laser'); // Slight feedback
                } else if (axisY > 0.5 || dpadDown) {
                    this.selectedIndex = (this.selectedIndex + 1) % this.upgrades.length;
                    this.inputCooldown = this.inputRepeatDelay;
                    Audio.play('laser');
                }

                // Purchase (A / X)
                if (Input.isGamepadButtonPressed(0)) {
                    this.purchaseSelected();
                    this.inputCooldown = 300;
                }

                // Close/Continue (B / O / Start)
                if (Input.isGamepadButtonPressed(1) || Input.isGamepadButtonPressed(9)) {
                    this.close();
                    this.inputCooldown = 500;
                }
            }
        }
    },

    handleInput(e) {
        if (!this.active) return;

        switch (e.code) {
            case 'ArrowUp':
                this.selectedIndex = (this.selectedIndex - 1 + this.upgrades.length) % this.upgrades.length;
                Audio.play('laser');
                break;
            case 'ArrowDown':
                this.selectedIndex = (this.selectedIndex + 1) % this.upgrades.length;
                Audio.play('laser');
                break;
            case 'Space':
            case 'Enter':
                this.purchaseSelected();
                break;
            case 'KeyC':
                this.close();
                break;
            // Removed Escape from here to let Main handle Pause, but if in shop, main should check shop active
            // We'll keep KeyC for continue
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
        const layout = this.getLayout();
        const { panelLeft, panelW, listTop, itemHeight, continueY, btnW, safe } = layout;

        for (let i = 0; i < this.upgrades.length; i++) {
            const rowY = listTop + i * itemHeight;
            const rowH = itemHeight - 8;
            if (x > panelLeft && x < panelLeft + panelW &&
                y > rowY && y < rowY + rowH) {
                if (this.selectedIndex === i) {
                    this.purchaseSelected();
                } else {
                    this.selectedIndex = i;
                    Audio.play('laser');
                }
                return;
            }
        }

        const cx = safe.centerX;
        if (x > cx - btnW / 2 && x < cx + btnW / 2 &&
            y > continueY - 22 && y < continueY + (layout.compact ? 36 : 40)) {
            this.close();
        }
    },

    getCost(upgrade, player) {
        const level = player.upgrades[upgrade.stat];
        if (level >= this.maxLevel) return null;
        return upgrade.baseCost + upgrade.perLevel * level;
    },

    purchaseSelected() {
        const upgrade = this.upgrades[this.selectedIndex];
        const cost = this.getCost(upgrade, this.player);

        if (cost === null) return; // Max level
        if (this.player.coins < cost) return; // Can't afford

        this.player.coins -= cost;
        this.player.upgrades[upgrade.stat]++;

        // Apply stat changes
        this.applyUpgrade(upgrade.stat);

        Audio.play('laser'); // Reuse laser sound for purchase
    },

    applyUpgrade(stat) {
        switch (stat) {
            case 'ATK':
                this.player.atk = PLAYER.BASE_ATK + this.player.upgrades.ATK * 5;
                break;
            case 'DEF':
                this.player.def = PLAYER.BASE_DEF + this.player.upgrades.DEF * 10;
                break;
            case 'SPD':
                this.player.speed = PLAYER.SPEED + this.player.upgrades.SPD * 1;
                break;
            case 'FIRE_RATE':
                this.player.fireRate = PLAYER.FIRE_RATE - this.player.upgrades.FIRE_RATE * 30;
                break;
        }
    },

    getLayout() {
        const safe = Utils.getViewSafe();
        const compact = Utils.isCompactView();
        const panelW = safe.contentWidth;
        const panelLeft = safe.left;
        const innerPad = 12;
        const continueBlockH = compact ? 58 : 52;
        const continueY = safe.bottom - continueBlockH;
        const btnW = Math.min(200, panelW * 0.9);

        let y = safe.top + (compact ? 6 : 10);
        y += compact ? 36 : 48;
        y += compact ? 24 : 32;

        const listTop = y;
        const listBottom = continueY - (compact ? 12 : 16);
        const itemHeight = Math.min(
            compact ? 58 : 72,
            Math.floor((listBottom - listTop) / this.upgrades.length)
        );

        return {
            safe,
            compact,
            panelW,
            panelLeft,
            innerPad,
            listTop,
            itemHeight,
            continueY,
            btnW,
        };
    },

    draw(ctx) {
        if (!this.active) return;

        const layout = this.getLayout();
        const {
            safe, compact, panelW, panelLeft, innerPad, listTop, itemHeight, continueY, btnW,
        } = layout;
        const cx = safe.centerX;
        const textLeft = panelLeft + innerPad;
        const textRight = safe.right - innerPad;
        const innerW = textRight - textLeft;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        let y = safe.top + (compact ? 6 : 10);

        ctx.fillStyle = COLORS.PRIMARY;
        Utils.drawFitCenterText(
            ctx,
            'UPGRADE SHOP',
            y + (compact ? 16 : 22),
            compact ? 26 : 36,
            14,
            'bold {size}px "Courier New"',
            cx,
            panelW
        );
        y += compact ? 36 : 48;

        ctx.fillStyle = COLORS.COINS;
        Utils.drawFitCenterText(
            ctx,
            `◆ ${this.player.coins} COINS`,
            y,
            compact ? 16 : 24,
            11,
            '{size}px "Courier New"',
            cx,
            panelW
        );

        for (let i = 0; i < this.upgrades.length; i++) {
            const upgrade = this.upgrades[i];
            const rowY = listTop + i * itemHeight;
            const level = this.player.upgrades[upgrade.stat];
            const cost = this.getCost(upgrade, this.player);
            const isSelected = i === this.selectedIndex;
            const canAfford = cost !== null && this.player.coins >= cost;
            const rowH = itemHeight - 8;

            if (isSelected) {
                ctx.strokeStyle = COLORS.PRIMARY;
                ctx.lineWidth = 2;
                ctx.strokeRect(panelLeft, rowY, panelW, rowH);
            }

            ctx.fillStyle = isSelected ? COLORS.PRIMARY : '#aaa';
            Utils.drawFitLeftText(
                ctx,
                upgrade.name,
                textLeft,
                rowY + (compact ? 14 : 16),
                compact ? 16 : 20,
                11,
                'bold {size}px "Courier New"',
                innerW * 0.55
            );

            const barW = Math.min(compact ? 90 : 120, innerW * 0.42);
            const barY = rowY + (compact ? 22 : 26);
            ctx.fillStyle = '#333';
            ctx.fillRect(textLeft, barY, barW, compact ? 10 : 12);
            ctx.fillStyle = COLORS.PRIMARY;
            ctx.fillRect(textLeft, barY, (level / this.maxLevel) * barW, compact ? 10 : 12);

            ctx.fillStyle = '#fff';
            Utils.drawFitLeftText(
                ctx,
                `LV ${level}/${this.maxLevel}`,
                textLeft + barW + 6,
                barY + (compact ? 9 : 10),
                compact ? 11 : 14,
                9,
                '{size}px "Courier New"',
                innerW * 0.25
            );

            const costText = cost === null ? 'MAX' : `◆ ${cost}`;
            ctx.fillStyle = cost === null ? '#888' : (canAfford ? COLORS.COINS : '#666');
            const costSize = Utils.fitFontSize(
                ctx,
                costText,
                compact ? 14 : 16,
                10,
                'bold {size}px "Courier New"',
                innerW * 0.22
            );
            ctx.font = Utils._font('bold {size}px "Courier New"', costSize);
            ctx.textAlign = 'right';
            ctx.fillText(costText, textRight, rowY + (compact ? 14 : 16));

            ctx.fillStyle = '#666';
            Utils.drawFitLeftText(
                ctx,
                upgrade.desc,
                textLeft,
                rowY + (compact ? 38 : 46),
                compact ? 10 : 12,
                8,
                '{size}px "Courier New"',
                innerW
            );
        }

        ctx.fillStyle = '#333';
        ctx.fillRect(cx - btnW / 2, continueY - 22, btnW, compact ? 36 : 40);

        ctx.fillStyle = '#fff';
        Utils.drawFitCenterText(
            ctx,
            'CONTINUE',
            continueY + (compact ? 0 : 2),
            compact ? 16 : 20,
            12,
            'bold {size}px "Courier New"',
            cx,
            btnW
        );

        ctx.fillStyle = '#666';
        const continuePrompt = compact ? 'Tap here to continue' : 'PRESS C / START / TAP HERE';
        Utils.drawFitCenterText(
            ctx,
            continuePrompt,
            continueY + (compact ? 22 : 25),
            compact ? 10 : 12,
            8,
            '{size}px "Courier New"',
            cx,
            btnW
        );
    }
};
