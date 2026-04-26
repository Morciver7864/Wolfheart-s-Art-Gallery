document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const overlay = document.getElementById('overlay');

    const hideMenu = () => {
        navLinks.classList.remove('open');
        overlay.classList.remove('active');
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.add('open');
            overlay.classList.add('active');
        });
    }

    // Tapping the left side (overlay) now handles all closing
    if (overlay) {
        overlay.addEventListener('click', hideMenu);
    }

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setTimeout(hideMenu, 100));
    });
});