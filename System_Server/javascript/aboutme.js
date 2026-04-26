document.addEventListener("DOMContentLoaded", () => {
    const aboutLink = document.querySelector('a[href="about.html"]');
    const allLinks = document.querySelectorAll('.nav-menu a');
    const aboutSection = document.getElementById('about-section');

    if (aboutLink && aboutSection) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();

            // --- THE GLOW FIX START ---
            // 1. Remove .active from all other links (like Home)
            allLinks.forEach(link => link.classList.remove('active'));
            
            // 2. Add .active to the About Me link so it glows yellow
            aboutLink.classList.add('active');
            // --- THE GLOW FIX END ---

            // Show and Scroll
            aboutSection.style.display = 'block';
            aboutSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const allLinks = document.querySelectorAll('.nav-menu a');
    const homeLink = document.querySelector('a[href="home.html"]');
    const aboutLink = document.querySelector('a[href="about.html"]');
    const aboutSection = document.getElementById('about-section');

    // --- FUNCTION TO SWITCH GLOW ---
    const setActiveLink = (targetLink) => {
        allLinks.forEach(link => link.classList.remove('active'));
        targetLink.classList.add('active');
    };

    // --- ABOUT ME CLICK ---
    if (aboutLink && aboutSection) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveLink(aboutLink); // Make "About Me" glow yellow
            
            aboutSection.style.display = 'block';
            aboutSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        });
    }

    // --- HOME CLICK ---
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            // Check if we are already on the home page
            const isHomePage = window.location.pathname.includes('home.html') || window.location.pathname.endsWith('/');
            
            if (isHomePage) {
                e.preventDefault();
                setActiveLink(homeLink); // Switch yellow glow back to "Home"
                
                // Scroll smoothly back to the top of the page
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }
});