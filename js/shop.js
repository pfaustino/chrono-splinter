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
        this.selectedIndex = 0;
        this.inputCooldown = 0;

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

        // Check UI bounds
        const startY = 180;
        const itemHeight = 80;

        // Check upgrade items
        for (let i = 0; i < this.upgrades.length; i++) {
            const itemY = startY + i * itemHeight;
            // Hitbox for the row
            if (x > GAME.WIDTH / 2 - 200 && x < GAME.WIDTH / 2 + 200 &&
                y > itemY - 25 && y < itemY + 45) {

                if (this.selectedIndex === i) {
                    // Already selected, try to buy
                    this.purchaseSelected();
                } else {
                    // Select it
                    this.selectedIndex = i;
                    Audio.play('laser');
                }
                return;
            }
        }

        // Check Continue Button (bottom area)
        if (y > GAME.HEIGHT - 80) {
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

    draw(ctx) {
        if (!this.active) return;

        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        // Title
        ctx.fillStyle = COLORS.PRIMARY;
        ctx.font = 'bold 36px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('UPGRADE SHOP', GAME.WIDTH / 2, 80);

        // Coins display
        ctx.fillStyle = COLORS.COINS;
        ctx.font = '24px "Courier New"';
        ctx.fillText(`◆ ${this.player.coins} COINS`, GAME.WIDTH / 2, 120);

        // Upgrade options
        const startY = 180;
        const itemHeight = 80;

        for (let i = 0; i < this.upgrades.length; i++) {
            const upgrade = this.upgrades[i];
            const y = startY + i * itemHeight;
            const level = this.player.upgrades[upgrade.stat];
            const cost = this.getCost(upgrade, this.player);
            const isSelected = i === this.selectedIndex;
            const canAfford = cost !== null && this.player.coins >= cost;

            // Selection box
            if (isSelected) {
                ctx.strokeStyle = COLORS.PRIMARY;
                ctx.lineWidth = 2;
                ctx.strokeRect(GAME.WIDTH / 2 - 200, y - 25, 400, 70);
            }

            // Upgrade name
            ctx.fillStyle = isSelected ? COLORS.PRIMARY : '#aaa';
            ctx.font = 'bold 20px "Courier New"';
            ctx.textAlign = 'left';
            ctx.fillText(upgrade.name, GAME.WIDTH / 2 - 180, y);

            // Level bar
            ctx.fillStyle = '#333';
            ctx.fillRect(GAME.WIDTH / 2 - 180, y + 10, 150, 15);
            ctx.fillStyle = COLORS.PRIMARY;
            ctx.fillRect(GAME.WIDTH / 2 - 180, y + 10, (level / this.maxLevel) * 150, 15);

            // Level text
            ctx.fillStyle = '#fff';
            ctx.font = '14px "Courier New"';
            ctx.fillText(`LV ${level}/${this.maxLevel}`, GAME.WIDTH / 2 - 20, y + 22);

            // Cost or MAX
            ctx.textAlign = 'right';
            if (cost === null) {
                ctx.fillStyle = '#888';
                ctx.fillText('MAX', GAME.WIDTH / 2 + 180, y + 5);
            } else {
                ctx.fillStyle = canAfford ? COLORS.COINS : '#666';
                ctx.fillText(`◆ ${cost}`, GAME.WIDTH / 2 + 180, y + 5);
            }

            // Description
            ctx.fillStyle = '#666';
            ctx.font = '12px "Courier New"';
            ctx.textAlign = 'left';
            ctx.fillText(upgrade.desc, GAME.WIDTH / 2 - 180, y + 38);
        }

        // Instructions/Continue Button
        const continueY = GAME.HEIGHT - 50;

        // Draw Continue "Button" area for touch reference
        ctx.fillStyle = '#333';
        ctx.fillRect(GAME.WIDTH / 2 - 100, continueY - 25, 200, 40);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('CONTINUE', GAME.WIDTH / 2, continueY + 2);

        ctx.fillStyle = '#666';
        ctx.font = '12px "Courier New"';
        ctx.fillText('PRESS C / START / TAP HERE', GAME.WIDTH / 2, continueY + 25);
    }
};
