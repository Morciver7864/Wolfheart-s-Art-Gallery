// =========================================================
// 🔧 SETTINGS SYSTEM (MODAL + CONTROLS)
// =========================================================

// --- GLOBAL STATE ---
const carouselSettings = {
    autoScroll: true,
    baseSpeed: 1,
    friction: 0.95,
    isMuted: false
};

// =========================================================
// 🚀 INITIALIZE SETTINGS UI
// =========================================================
function initSettings() {

    // -----------------------------
    // 📦 ELEMENTS
    // -----------------------------
    const openBtn = document.getElementById('open-settings');
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('close-settings');
    const toggleNavBtn = document.getElementById('toggle-nav-style');
    const navLinks = document.getElementById('nav-links');
    const speedInput = document.getElementById('speed-range');
    const frictionInput = document.getElementById('friction-range');
    const muteBtn = document.getElementById('mute-btn');
    const muteIcon = document.getElementById('mute-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const bgMusic = document.getElementById('bg-music');

    // -----------------------------
    // 💾 STORAGE KEYS
    // -----------------------------
    const STORAGE = {
        NAV_MODE: "navbarDisplayMode",
        MUTE: "audioMuted",
        VOLUME: "audioVolume",
        SPEED: "carouselSpeed",
        FRICTION: "carouselFriction"
    };

    // -----------------------------
    // 🧠 HELPERS
    // -----------------------------
    const readNumber = (value, fallback) => {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? fallback : parsed;
    };

    const applyNavbarMode = () => {
        if (!toggleNavBtn || !navLinks) return;

        toggleNavBtn.innerText = navLinks.classList.contains('icons-only')
            ? "Show Full Navbar"
            : "Show Icons Only";
    };

    const applyMuteUI = () => {
        if (muteIcon) {
            muteIcon.innerText = carouselSettings.isMuted
                ? 'volume_off'
                : 'volume_up';
        }
    };

    // -----------------------------
    // 🔄 LOAD SAVED SETTINGS
    // -----------------------------

    // Navbar mode
    if (navLinks) {
        const savedMode = localStorage.getItem(STORAGE.NAV_MODE);
        navLinks.classList.toggle('icons-only', savedMode === "icons-only");
    }
    applyNavbarMode();

    // Audio
    const savedMuted = localStorage.getItem(STORAGE.MUTE);
    if (savedMuted !== null) {
        carouselSettings.isMuted = savedMuted === "true";
    }

    if (bgMusic) {
        const savedVolume = readNumber(
            localStorage.getItem(STORAGE.VOLUME),
            readNumber(volumeSlider?.value, 0.5)
        );

        bgMusic.volume = Math.max(0, Math.min(1, savedVolume));
        bgMusic.muted = carouselSettings.isMuted;

        if (volumeSlider) volumeSlider.value = String(bgMusic.volume);
    }

    applyMuteUI();

    // Speed
    if (speedInput) {
        const savedSpeed = readNumber(
            localStorage.getItem(STORAGE.SPEED),
            readNumber(speedInput.value, carouselSettings.baseSpeed)
        );

        speedInput.value = String(savedSpeed);
        carouselSettings.baseSpeed = savedSpeed;
    }

    // Friction
    if (frictionInput) {
        const savedFriction = readNumber(
            localStorage.getItem(STORAGE.FRICTION),
            readNumber(frictionInput.value, carouselSettings.friction)
        );

        frictionInput.value = String(savedFriction);
        carouselSettings.friction = savedFriction;
    }

    // =====================================================
    // 🎛️ EVENT LISTENERS
    // =====================================================

    // 🧩 OPEN MODAL
    openBtn?.addEventListener('click', (e) => {
        e.preventDefault();

        // Close mobile sidebar if open
        navLinks?.classList.remove('active');

        if (modal) modal.style.display = 'flex';
    });

    // ❌ CLOSE MODAL
    closeBtn?.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
    });

    // 🖱️ CLICK OUTSIDE
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // 🎚️ SPEED
    speedInput?.addEventListener('input', (e) => {
        const value = readNumber(e.target.value, 1);
        carouselSettings.baseSpeed = value;
        localStorage.setItem(STORAGE.SPEED, value);
    });

    // 🎚️ FRICTION
    frictionInput?.addEventListener('input', (e) => {
        const value = readNumber(e.target.value, 0.95);
        carouselSettings.friction = value;
        localStorage.setItem(STORAGE.FRICTION, value);
    });

    // 🔊 MUTE
    muteBtn?.addEventListener('click', () => {
        carouselSettings.isMuted = !carouselSettings.isMuted;

        if (bgMusic) bgMusic.muted = carouselSettings.isMuted;

        localStorage.setItem(STORAGE.MUTE, carouselSettings.isMuted);
        applyMuteUI();
    });

    // 🔉 VOLUME
    volumeSlider?.addEventListener('input', (e) => {
        const volume = Math.max(0, Math.min(1, readNumber(e.target.value, 0.5)));

        if (bgMusic) bgMusic.volume = volume;
        localStorage.setItem(STORAGE.VOLUME, volume);

        // Auto-unmute if volume increased
        if (volume > 0 && carouselSettings.isMuted) {
            carouselSettings.isMuted = false;

            if (bgMusic) bgMusic.muted = false;

            localStorage.setItem(STORAGE.MUTE, false);
            applyMuteUI();
        }
    });

    // 🔁 NAV STYLE TOGGLE
    toggleNavBtn?.addEventListener('click', () => {
        navLinks.classList.toggle('icons-only');

        localStorage.setItem(
            STORAGE.NAV_MODE,
            navLinks.classList.contains('icons-only')
                ? "icons-only"
                : "full"
        );

        applyNavbarMode();
    });
}

// =========================================================
// ▶️ INIT
// =========================================================
document.addEventListener('DOMContentLoaded', initSettings);