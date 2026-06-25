// ============================================
// The Chrono-Splinter - Developer Panel
// ============================================

const DevPanel = {
    open: false,

    init() {
        const container = document.getElementById('game-container');
        if (!container) return;

        this.toggleBtn = document.createElement('button');
        this.toggleBtn.type = 'button';
        this.toggleBtn.id = 'dev-toggle';
        this.toggleBtn.className = 'dev-toggle';
        this.toggleBtn.title = 'Developer tools';
        this.toggleBtn.setAttribute('aria-label', 'Open developer panel');
        this.toggleBtn.textContent = 'DEV';

        this.panel = document.createElement('div');
        this.panel.id = 'dev-panel';
        this.panel.className = 'dev-panel hidden';
        this.panel.setAttribute('aria-hidden', 'true');
        this.panel.innerHTML = `
            <div class="dev-panel-header">
                <span>Developer</span>
                <button type="button" class="dev-close" aria-label="Close developer panel">&times;</button>
            </div>
            <div class="dev-panel-body">
                <label class="dev-row dev-toggle-row">
                    <input type="checkbox" id="dev-god-mode">
                    <span>God mode</span>
                </label>
                <div class="dev-actions">
                    <button type="button" data-action="next-wave">Next wave</button>
                    <button type="button" data-action="skip-boss">Skip to boss</button>
                    <button type="button" data-action="next-chapter">Next chapter</button>
                    <button type="button" data-action="kill-enemies">Kill all enemies</button>
                    <button type="button" data-action="add-coins">+500 coins</button>
                    <button type="button" data-action="refill-lives">Refill lives</button>
                </div>
                <div class="dev-chapter-row">
                    <label for="dev-chapter-select">Jump to chapter</label>
                    <div class="dev-chapter-controls">
                        <select id="dev-chapter-select"></select>
                        <button type="button" data-action="go-chapter">Go</button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(this.toggleBtn);
        container.appendChild(this.panel);

        this.populateChapterSelect();
        this.bindEvents();
    },

    populateChapterSelect() {
        const select = this.panel.querySelector('#dev-chapter-select');
        if (!select || !Game.chapterNames) return;

        select.innerHTML = '';
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = String(i);
            option.textContent = `${i}: ${Game.chapterNames[i]}`;
            select.appendChild(option);
        }
        select.value = String(Game.currentChapter || 1);
    },

    bindEvents() {
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setOpen(!this.open);
        });

        this.panel.querySelector('.dev-close').addEventListener('click', () => {
            this.setOpen(false);
        });

        this.panel.querySelector('#dev-god-mode').addEventListener('change', (e) => {
            Game.setDevGodMode(e.target.checked);
        });

        this.panel.querySelectorAll('[data-action]').forEach((btn) => {
            btn.addEventListener('click', () => this.runAction(btn.dataset.action));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.open) {
                this.setOpen(false);
            }
        });
    },

    setOpen(isOpen) {
        this.open = isOpen;
        this.panel.classList.toggle('hidden', !isOpen);
        this.panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        this.toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen) {
            this.syncState();
        }
    },

    syncState() {
        const godCheckbox = this.panel.querySelector('#dev-god-mode');
        if (godCheckbox) {
            godCheckbox.checked = !!Game.devGodMode;
        }
        const select = this.panel.querySelector('#dev-chapter-select');
        if (select) {
            select.value = String(Game.currentChapter || 1);
        }
    },

    runAction(action) {
        switch (action) {
            case 'next-wave':
                Game.devNextWave();
                break;
            case 'skip-boss':
                Game.devSkipToBoss();
                break;
            case 'next-chapter':
                Game.devNextChapter();
                break;
            case 'kill-enemies':
                Game.devKillAllEnemies();
                break;
            case 'add-coins':
                Game.devAddCoins(500);
                break;
            case 'refill-lives':
                Game.devRefillLives();
                break;
            case 'go-chapter': {
                const select = this.panel.querySelector('#dev-chapter-select');
                const chapter = parseInt(select?.value, 10);
                if (chapter >= 1 && chapter <= 12) {
                    Game.devJumpToChapter(chapter);
                }
                break;
            }
            default:
                break;
        }
        this.syncState();
    }
};
