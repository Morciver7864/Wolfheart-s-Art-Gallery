// --- Carousel & Site State ---
let carouselSettings = {
    autoScroll: true,
    baseSpeed: 1, 
    friction: 0.95,
    isMuted: false
};

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

    // Toggle Modal
    openBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        // If sidebar is open on mobile, you might want to close it here
        const sidebar = document.getElementById('nav-links');
        if(sidebar.classList.contains('active')) sidebar.classList.remove('active');
        
        modal.style.display = 'flex';
    });

    closeBtn?.addEventListener('click', () => modal.style.display = 'none');

    // Slider Logic
    speedInput?.addEventListener('input', (e) => {
        carouselSettings.baseSpeed = parseFloat(e.target.value);
    });

    frictionInput?.addEventListener('input', (e) => {
        carouselSettings.friction = parseFloat(e.target.value);
    });

    // Mute Logic
    muteBtn?.addEventListener('click', () => {
        carouselSettings.isMuted = !carouselSettings.isMuted;
        muteIcon.innerText = carouselSettings.isMuted ? 'volume_off' : 'volume_up';
        
        // Logic to actually mute your audio elements
        const bgMusic = document.getElementById('bg-music'); // Example ID
        if(bgMusic) bgMusic.muted = carouselSettings.isMuted;
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    toggleNavBtn?.addEventListener('click', () => {
    // Toggle a class on the <ul> element
    navLinks.classList.toggle('icons-only');
    
    // Update button text to give feedback to the user
    if (navLinks.classList.contains('icons-only')) {
        toggleNavBtn.innerText = "Show Full Navbar";
    } else {
        toggleNavBtn.innerText = "Show Icons Only";
    }
});
}

// Call this in your main init
initSettings();