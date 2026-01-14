// ============================================
// The Chrono-Splinter - Input Handler
// Supports: Keyboard, Gamepad, Touch/Mouse drag
// ============================================

const Input = {
    keys: {},

    // Gamepad state
    gamepad: null,
    gamepadIndex: -1,
    gamepadDeadzone: 0.15,

    // Touch/Mouse state
    touch: {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        targetX: null,  // Target position for the player
        targetY: null,
    },

    // Canvas reference for touch coords
    canvas: null,

    /**
     * Initialize input listeners
     */
    init() {
        this.canvas = document.getElementById('gameCanvas');

        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Prevent default for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Handle window blur (release all keys)
        window.addEventListener('blur', () => {
            this.keys = {};
            this.touch.active = false;
        });

        // Gamepad events
        window.addEventListener('gamepadconnected', (e) => {
            console.log(`🎮 Gamepad connected: ${e.gamepad.id}`);
            this.gamepadIndex = e.gamepad.index;
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            console.log(`🎮 Gamepad disconnected: ${e.gamepad.id}`);
            if (e.gamepad.index === this.gamepadIndex) {
                this.gamepadIndex = -1;
                this.gamepad = null;
            }
        });

        // Touch events (mobile)
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });

        // Mouse events (desktop mouse drag, simulates touch)
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
    },

    /**
     * Update gamepad state (call each frame)
     */
    updateGamepad() {
        if (this.gamepadIndex < 0) return;

        const gamepads = navigator.getGamepads();
        this.gamepad = gamepads[this.gamepadIndex];
    },

    /**
     * Get canvas-relative coordinates from event
     */
    getCanvasCoords(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    },

    // Touch handlers
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
        this.touch.active = true;
        this.touch.startX = coords.x;
        this.touch.startY = coords.y;
        this.touch.currentX = coords.x;
        this.touch.currentY = coords.y;
        this.touch.targetX = coords.x;
        this.touch.targetY = coords.y;
    },

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.touch.active) return;
        const touch = e.touches[0];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
        this.touch.currentX = coords.x;
        this.touch.currentY = coords.y;
        this.touch.targetX = coords.x;
        this.touch.targetY = coords.y;
    },

    handleTouchEnd(e) {
        e.preventDefault();
        this.touch.active = false;
        this.touch.targetX = null;
        this.touch.targetY = null;
    },

    // Mouse handlers (for desktop drag testing)
    handleMouseDown(e) {
        const coords = this.getCanvasCoords(e.clientX, e.clientY);
        this.touch.active = true;
        this.touch.startX = coords.x;
        this.touch.startY = coords.y;
        this.touch.currentX = coords.x;
        this.touch.currentY = coords.y;
        this.touch.targetX = coords.x;
        this.touch.targetY = coords.y;
    },

    handleMouseMove(e) {
        if (!this.touch.active) return;
        const coords = this.getCanvasCoords(e.clientX, e.clientY);
        this.touch.currentX = coords.x;
        this.touch.currentY = coords.y;
        this.touch.targetX = coords.x;
        this.touch.targetY = coords.y;
    },

    handleMouseUp(e) {
        this.touch.active = false;
        this.touch.targetX = null;
        this.touch.targetY = null;
    },

    /**
     * Check if a key is currently pressed
     */
    isPressed(keyCode) {
        return this.keys[keyCode] === true;
    },

    /**
     * Check if a gamepad button is pressed
     * Standard mapping: 0=A/X, 1=B/O, 2=X/□, 3=Y/△, 12=Up, 13=Down, 14=Left, 15=Right
     */
    isGamepadButtonPressed(buttonIndex) {
        if (!this.gamepad) return false;
        const button = this.gamepad.buttons[buttonIndex];
        return button && button.pressed;
    },

    /**
     * Get gamepad axis value with deadzone
     */
    getGamepadAxis(axisIndex) {
        if (!this.gamepad) return 0;
        const value = this.gamepad.axes[axisIndex] || 0;
        return Math.abs(value) > this.gamepadDeadzone ? value : 0;
    },

    /**
     * Get movement direction as a vector
     * Combines keyboard, gamepad, and touch input
     */
    getMovement() {
        let dx = 0;
        let dy = 0;

        // Keyboard input
        if (this.isPressed('ArrowLeft') || this.isPressed('KeyA')) dx -= 1;
        if (this.isPressed('ArrowRight') || this.isPressed('KeyD')) dx += 1;
        if (this.isPressed('ArrowUp') || this.isPressed('KeyW')) dy -= 1;
        if (this.isPressed('ArrowDown') || this.isPressed('KeyS')) dy += 1;

        // Gamepad input
        this.updateGamepad();
        if (this.gamepad) {
            // Left stick
            dx += this.getGamepadAxis(0);
            dy += this.getGamepadAxis(1);

            // D-pad
            if (this.isGamepadButtonPressed(14)) dx -= 1; // Left
            if (this.isGamepadButtonPressed(15)) dx += 1; // Right
            if (this.isGamepadButtonPressed(12)) dy -= 1; // Up
            if (this.isGamepadButtonPressed(13)) dy += 1; // Down
        }

        // Normalize diagonal movement (only for keyboard/gamepad)
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        // Clamp to -1 to 1
        dx = Utils.clamp(dx, -1, 1);
        dy = Utils.clamp(dy, -1, 1);

        return { dx, dy };
    },

    /**
     * Get touch target position (for direct positioning mode)
     * Returns null if not using touch/mouse drag
     */
    getTouchTarget() {
        if (!this.touch.active || this.touch.targetX === null) {
            return null;
        }
        return {
            x: this.touch.targetX,
            y: this.touch.targetY
        };
    },

    /**
     * Check if touch/drag is currently active (for auto-fire)
     */
    isTouchActive() {
        return this.touch.active;
    },

    /**
     * Check if fire button is pressed
     * Keyboard: Space/Z, Gamepad: A/B/X buttons, Touch: auto-fire
     */
    isFiring() {
        // Keyboard
        if (this.isPressed('Space') || this.isPressed('KeyZ')) return true;

        // Gamepad (A, B, X, or right trigger)
        if (this.gamepad) {
            if (this.isGamepadButtonPressed(0)) return true;  // A / X
            if (this.isGamepadButtonPressed(1)) return true;  // B / O
            if (this.isGamepadButtonPressed(2)) return true;  // X / □
            if (this.isGamepadButtonPressed(7)) return true;  // Right trigger
        }

        // Touch auto-fire
        if (this.touch.active) return true;

        return false;
    },
};
