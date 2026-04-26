/* --- 1. Memory & Persistence --- */
let lunarniaSettings = JSON.parse(localStorage.getItem('lunarniaData')) || {
    volume: 0.5,
    isMuted: false,
    iconsOnly: false,
    speed: 1,
    friction: 0.95
};

let logoutTimer;
const ADMIN_TIMEOUT = 10 * 60 * 1000; // 10 Minutes in milliseconds

const settingsModal = document.getElementById('settings-modal');
const closeBtn = document.getElementById('close-settings');

function saveSettings() {
    localStorage.setItem('lunarniaData', JSON.stringify(lunarniaSettings));
}

/* --- 2. Main Logic --- */
function initSettings() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('open-settings');
    const navLinks = document.getElementById('nav-links');
    const iconToggle = document.getElementById('toggle-nav-style');
    const bgMusic = document.getElementById('bg-music'); 
    
    const volSlider = document.getElementById('volume-slider');
    const speedSlider = document.getElementById('speed-range');
    const frictionSlider = document.getElementById('friction-range');
    const muteBtn = document.getElementById('mute-btn');
    const muteIcon = document.getElementById('mute-icon');


    // NEW: Mobile Hamburger Elements
    const menuToggle = document.getElementById('menu-toggle');

    // --- A. APPLY SETTINGS ON LOAD ---
    if (lunarniaSettings.iconsOnly) {
        navLinks?.classList.add('icons-only');
        if (iconToggle) iconToggle.innerText = "Show Full Navbar";
    }
    if (volSlider) volSlider.value = lunarniaSettings.volume;
    if (speedSlider) speedSlider.value = lunarniaSettings.speed;
    if (frictionSlider) frictionSlider.value = lunarniaSettings.friction;
    
    if (bgMusic) {
        bgMusic.volume = lunarniaSettings.volume;
        bgMusic.muted = lunarniaSettings.isMuted;
    }
    if (muteIcon) {
        muteIcon.innerText = lunarniaSettings.isMuted ? 'volume_off' : 'volume_up';
    }

    // --- B. EVENT LISTENERS ---

    // 1. MOBILE HAMBURGER TOGGLE (Fixes your mobile issue)
    menuToggle?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // 2. Settings Modal
    openBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // 3. Smooth Sliders
    volSlider?.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (bgMusic) bgMusic.volume = val;
        lunarniaSettings.volume = val;
        saveSettings();
    });

    speedSlider?.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        lunarniaSettings.speed = val;
        saveSettings();
    });

    frictionSlider?.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        lunarniaSettings.friction = val;
        saveSettings();
    });

    // 4. Toggles
    iconToggle?.addEventListener('click', () => {
        const isIcons = navLinks.classList.toggle('icons-only');
        lunarniaSettings.iconsOnly = isIcons;
        iconToggle.innerText = isIcons ? "Show Full Navbar" : "Show Icons Only";
        saveSettings();
    });

    muteBtn?.addEventListener('click', () => {
        lunarniaSettings.isMuted = !lunarniaSettings.isMuted;
        if (bgMusic) bgMusic.muted = lunarniaSettings.isMuted;
        if (muteIcon) muteIcon.innerText = lunarniaSettings.isMuted ? 'volume_off' : 'volume_up';
        saveSettings();
    });
}

/* --- 3. Navigation Highlighting --- */
function highlightLink() {
    // Clears all glows first, then adds it to the current page link
    const currentPath = window.location.pathname.split("/").pop() || "home.html";
    document.querySelectorAll('.navbar a').forEach(link => {
        link.classList.remove('active'); // Prevents Home from glowing on other pages
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

function resetTimer() {
    clearTimeout(logoutTimer);
    // Only run this if the user is logged in as Admin
    // (Assuming you have a 'isAdmin' flag in your settings or session)
    if (localStorage.getItem('isAdmin') === 'true') {
        logoutTimer = setTimeout(adminLogout, ADMIN_TIMEOUT);
    }
}

function adminLogout() {
    alert("Session Expired: You have been logged out for security.");
    localStorage.setItem('isAdmin', 'false'); // Revoke admin status
    window.location.href = "home.html"; // Redirect to safety
}

// 1. Close when clicking the X
closeBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

// 2. Optional: Close when clicking outside the settings content box
window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

window.onload = resetTimer;
window.onmousemove = resetTimer;
window.onmousedown = resetTimer;
window.ontouchstart = resetTimer;
window.onclick = resetTimer;
window.onkeydown = resetTimer;

document.addEventListener('DOMContentLoaded', () => {
    initSettings();
    highlightLink();
});