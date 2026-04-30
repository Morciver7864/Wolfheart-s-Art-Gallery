// =========================================================
// 🔧 SETTINGS SYSTEM (MODAL + CONTROLS)
// =========================================================

// --- Carousel & Site State ---
let carouselSettings = {
    autoScroll: true,
    baseSpeed: 1,
    friction: 0.95,
    isMuted: false
};

// =========================================================
// 🚀 INITIALIZE SETTINGS UI
// =========================================================
function initSettings() {
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
    const NAV_MODE_KEY = "navbarDisplayMode";
    const MUTE_KEY = "audioMuted";
    const VOLUME_KEY = "audioVolume";
    const SPEED_KEY = "carouselSpeed";
    const FRICTION_KEY = "carouselFriction";

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
            muteIcon.innerText = carouselSettings.isMuted ? 'volume_off' : 'volume_up';
        }
    };

    if (navLinks) {
        const savedMode = localStorage.getItem(NAV_MODE_KEY);
        if (savedMode === "icons-only") {
            navLinks.classList.add('icons-only');
        } else if (savedMode === "full") {
            navLinks.classList.remove('icons-only');
        }
    }
    applyNavbarMode();

    const savedMuted = localStorage.getItem(MUTE_KEY);
    if (savedMuted !== null) {
        carouselSettings.isMuted = savedMuted === "true";
    }
    if (bgMusic) {
        const savedVolume = readNumber(localStorage.getItem(VOLUME_KEY), readNumber(volumeSlider?.value, 0.5));
        bgMusic.volume = Math.max(0, Math.min(1, savedVolume));
        bgMusic.muted = carouselSettings.isMuted;
        if (volumeSlider) volumeSlider.value = String(bgMusic.volume);
    }
    applyMuteUI();

    if (speedInput) {
        const savedSpeed = readNumber(localStorage.getItem(SPEED_KEY), readNumber(speedInput.value, carouselSettings.baseSpeed));
        speedInput.value = String(savedSpeed);
        carouselSettings.baseSpeed = savedSpeed;
    }

    if (frictionInput) {
        const savedFriction = readNumber(localStorage.getItem(FRICTION_KEY), readNumber(frictionInput.value, carouselSettings.friction));
        frictionInput.value = String(savedFriction);
        carouselSettings.friction = savedFriction;
    }

    // -----------------------------
    // 🧩 OPEN SETTINGS MODAL
    // -----------------------------
    openBtn?.addEventListener('click', (e) => {
        e.preventDefault();

        // Close sidebar if open
        if (navLinks?.classList.contains('active')) {
            navLinks.classList.remove('active');
        }

        if (modal) modal.style.display = 'flex';
    });

    // -----------------------------
    // ❌ CLOSE MODAL
    // -----------------------------
    closeBtn?.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
    });

    // -----------------------------
    // 🎚️ SLIDER CONTROLS
    // -----------------------------
    speedInput?.addEventListener('input', (e) => {
        carouselSettings.baseSpeed = parseFloat(e.target.value);
        localStorage.setItem(SPEED_KEY, String(carouselSettings.baseSpeed));
    });

    frictionInput?.addEventListener('input', (e) => {
        carouselSettings.friction = parseFloat(e.target.value);
        localStorage.setItem(FRICTION_KEY, String(carouselSettings.friction));
    });

    // -----------------------------
    // 🔊 MUTE BUTTON
    // -----------------------------
    muteBtn?.addEventListener('click', () => {
        carouselSettings.isMuted = !carouselSettings.isMuted;
        if (bgMusic) bgMusic.muted = carouselSettings.isMuted;
        localStorage.setItem(MUTE_KEY, String(carouselSettings.isMuted));
        applyMuteUI();
    });

    volumeSlider?.addEventListener('input', (e) => {
        const volume = Math.max(0, Math.min(1, readNumber(e.target.value, 0.5)));
        if (bgMusic) bgMusic.volume = volume;
        localStorage.setItem(VOLUME_KEY, String(volume));

        if (volume > 0 && carouselSettings.isMuted) {
            carouselSettings.isMuted = false;
            if (bgMusic) bgMusic.muted = false;
            localStorage.setItem(MUTE_KEY, "false");
            applyMuteUI();
        }
    });

    // -----------------------------
    // 🖱️ CLICK OUTSIDE MODAL
    // -----------------------------
    window.addEventListener('click', (e) => {
        if (e.target === modal && modal) modal.style.display = 'none';
    });

    // -----------------------------
    // 🔁 NAV STYLE TOGGLE
    // -----------------------------
    toggleNavBtn?.addEventListener('click', () => {
        navLinks.classList.toggle('icons-only');
        localStorage.setItem(NAV_MODE_KEY, navLinks.classList.contains('icons-only') ? "icons-only" : "full");
        applyNavbarMode();
    });
}

// Initialize
initSettings();