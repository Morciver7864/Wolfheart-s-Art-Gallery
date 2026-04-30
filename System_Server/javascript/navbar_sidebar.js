document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const overlay = document.getElementById('overlay') || document.getElementById('sidebar-overlay');

    const setActiveByCurrentPath = () => {
        if (!navLinks) return;
        const links = navLinks.querySelectorAll('a[href]');
        const currentPath = window.location.pathname.toLowerCase();

        links.forEach((link) => {
            const href = (link.getAttribute('href') || '').toLowerCase();
            if (!href || href.startsWith('javascript:')) {
                return;
            }
            const isHome = href === 'home.html' && (currentPath.endsWith('/') || currentPath.endsWith('/home.html'));
            const isMatch = currentPath.endsWith(`/${href}`);
            if (isHome || isMatch) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    const hideMenu = () => {
        if (navLinks) navLinks.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    };

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.add('active');
            if (overlay) overlay.classList.add('active');
        });
    }

    // Tapping the left side (overlay) now handles all closing
    if (overlay) {
        overlay.addEventListener('click', hideMenu);
    }

    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.querySelectorAll('a').forEach((item) => item.classList.remove('active'));
                if (!link.getAttribute('href')?.startsWith('javascript:')) {
                    link.classList.add('active');
                }
            });
            link.addEventListener('click', () => setTimeout(hideMenu, 100));
        });
    }

    setActiveByCurrentPath();
});