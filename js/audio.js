// ============================================
// The Chrono-Splinter - Audio System
// ============================================

const Audio = {
    sounds: {},
    music: {},
    voices: {},
    currentMusic: null,
    currentVoice: null,
    enabled: true,
    volume: 0.5,
    musicVolume: 0.4, // Music slightly quieter than SFX by default

    init() {
        // Preload sound effects
        this.load('laser', 'assets/laser-shot.mp3');
        this.load('explosion', 'assets/explosion.mp3');
        this.load('gameover', 'assets/gameover.mp3');

        // Preload music
        if (typeof MUSIC !== 'undefined') {
            this.loadMusic('intro', MUSIC.INTRO);
            this.loadMusic('chapter1_2', MUSIC.CHAPTER_1_2);
            this.loadMusic('chapter3', MUSIC.CHAPTER_3);
            this.loadMusic('boss', MUSIC.BOSS);
        }

        // Preload voices
        this.preloadVoices();

        console.log('🔊 Audio system initialized');
    },

    load(name, src) {
        const audio = new window.Audio(src);
        audio.preload = 'auto';
        audio.volume = this.volume;
        this.sounds[name] = audio;
    },

    loadMusic(name, src) {
        const audio = new window.Audio(src);
        audio.preload = 'auto';
        audio.loop = true;
        audio.volume = this.musicVolume;
        this.music[name] = audio;
    },

    loadVoice(name, src) {
        const audio = new window.Audio(src);
        audio.preload = 'auto';
        audio.loop = false;
        audio.volume = 1.0; // Max volume for voices
        this.voices[name] = audio;
    },

    preloadVoices() {
        const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        for (let i = 1; i <= 12; i++) {
            const num = roman[i - 1];
            if (num) {
                this.loadVoice(`chapter_${i}`, `assets/voice/chapter-${num}.mp3`);
            }
        }
    },

    play(name) {
        if (!this.enabled) return;

        const sound = this.sounds[name];
        if (sound) {
            // Clone the audio to allow overlapping sounds
            const clone = sound.cloneNode();
            clone.volume = this.volume;
            clone.play().catch(() => {
                // Ignore autoplay errors (user hasn't interacted yet)
            });
        }
    },

    playMusic(name) {
        if (!this.enabled) return;
        if (this.currentMusic === name) return; // Already playing

        this.stopMusic();

        const track = this.music[name];
        if (track) {
            track.currentTime = 0;
            track.volume = this.musicVolume;
            track.play().catch(e => console.log('Music play failed:', e));
            this.currentMusic = name;
            console.log(`🎵 Playing music: ${name}`);
        }
    },

    playVoice(name) {
        if (!this.enabled) return;

        this.stopVoice();

        const track = this.voices[name];
        if (track) {
            track.currentTime = 0;
            track.volume = 1.0; // Ensure max volume
            track.play().catch(e => console.log('Voice play failed:', e));
            this.currentVoice = name;
        }
    },

    stopVoice() {
        if (this.currentVoice && this.voices[this.currentVoice]) {
            this.voices[this.currentVoice].pause();
            this.voices[this.currentVoice].currentTime = 0;
        }
        this.currentVoice = null;
    },

    stopMusic() {
        // Force pause all music tracks to prevent overlap
        Object.values(this.music).forEach(track => {
            track.pause();
            track.currentTime = 0;
        });
        this.currentMusic = null;
    },

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        for (const name in this.sounds) {
            this.sounds[name].volume = this.volume;
        }
        for (const name in this.voices) {
            this.voices[name].volume = this.volume;
        }
    },

    setMusicVolume(vol) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        for (const name in this.music) {
            this.music[name].volume = this.musicVolume;
        }
    },

    toggle() {
        this.enabled = !this.enabled;

        if (!this.enabled) {
            this.stopMusic();
            this.stopVoice();
        } else if (this.currentMusic) {
            // Resume music if it was tracked
            this.playMusic(this.currentMusic);
        }

        return this.enabled;
    }
};
