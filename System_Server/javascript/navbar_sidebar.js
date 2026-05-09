document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
// This is the <ul> or <div> that holds your links
    const navLinksContainer = document.getElementById('nav-links'); 
// These are the actual <a> tags inside it
    const navLinks = document.querySelectorAll('#nav-links a');
    const sections = document.querySelectorAll('section');
    const overlay = document.getElementById('overlay') || document.getElementById('sidebar-overlay');

    const hideMenu = () => {
    if (navLinksContainer) navLinksContainer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    };

    const switchPower = (activeId) => {
    // Select all links in your navigation
    const allLinks = document.querySelectorAll('.nav-menu a');
    
    allLinks.forEach(link => {
        // Force reset all to remove the "Ignition" glow
        link.classList.remove('active'); 

        const href = link.getAttribute('href') || '';
        
        // Logic for Home (checks for home.html or the specific home-section ID)
        if (activeId === 'home-section' && (href === 'home.html' || href.endsWith('#home-section'))) {
            link.classList.add('active');
        } 
        // Logic for About Me and other sections by matching the ID
        else if (activeId && href.includes(`#${activeId}`)) {
            link.classList.add('active');
        }
        // Add this inside your switchPower function logic
        else if (activeId === 'art-gallery-container' && href.includes('gallery.html')) {
        link.classList.add('active');
        }
    });
};

    // --- SENSITIVE SCROLL DETECTION ---
    const scrollOptions = {
        root: null,
        // rootMargin: Top is -100px to account for Navbar height, 
        // Bottom is -70% to trigger the swap early as you scroll down
        rootMargin: "-100px 0px -70% 0px", 
        threshold: 0 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When a section enters the "Active Zone" defined by rootMargin
            if (entry.isIntersecting) {
                switchPower(entry.target.id);
            }
        });
    }, scrollOptions);

    sections.forEach(sec => observer.observe(sec));
// --- KEEP THIS CORRECT VERSION ---
if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
        navLinksContainer.classList.add('active'); // Targets the container, not the list
        if (overlay) overlay.classList.add('active');
    });
}

    if (overlay) {
        overlay.addEventListener('click', hideMenu);
    }


    // --- INSTANT CLICK OVERRIDE ---
   // Inside your navLinks.forEach(link => { ... }) listener:
link.addEventListener('click', function() {
    const href = this.getAttribute('href') || '';
    let targetId = 'home-section'; // Default starting point

    if (href.includes('#')) {
        targetId = href.split('#')[1];
    }
    
    // Swap the glow NOW for better responsiveness
    switchPower(targetId);
});

    // This loop goes through every link in your sidebar
// 1. First, make sure you select the links

// 2. Wrap your listener INSIDE the loop
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        const href = this.getAttribute('href') || '';
        let targetId = 'home-section'; // Default starting point

        if (href.includes('#')) {
            targetId = href.split('#')[1];
        }
        
        // Swap the glow for better responsiveness
        if (typeof switchPower === "function") {
            switchPower(targetId);
        }
    });
});
});