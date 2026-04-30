document.addEventListener("DOMContentLoaded", () => {
    const allLinks = document.querySelectorAll(".nav-menu a");
    const homeLink = document.querySelector('.nav-menu a[href="home.html"]');
    const aboutLink = document.querySelector('.nav-menu a[href="home.html#about-section"]');
    const aboutSection = document.getElementById("about-section");

    const setActiveLink = (targetLink) => {
        allLinks.forEach((link) => link.classList.remove("active"));
        if (targetLink) targetLink.classList.add("active");
    };

    const showAboutSection = (smooth = true) => {
        if (!aboutSection) return;
        aboutSection.style.display = "block";
        aboutSection.scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
            block: "center"
        });
    };

    if (aboutLink && aboutSection) {
        aboutLink.addEventListener("click", (e) => {
            // If we're already on home, open section instead of reloading.
            const isHomePage = window.location.pathname.includes("home.html") || window.location.pathname.endsWith("/");
            if (isHomePage) {
                e.preventDefault();
                setActiveLink(aboutLink);
                showAboutSection(true);
                history.replaceState(null, "", "home.html#about-section");
            }
        });
    }

    if (homeLink) {
        homeLink.addEventListener("click", (e) => {
            const isHomePage = window.location.pathname.includes("home.html") || window.location.pathname.endsWith("/");
            if (isHomePage) {
                e.preventDefault();
                setActiveLink(homeLink);
                window.scrollTo({ top: 0, behavior: "smooth" });
                history.replaceState(null, "", "home.html");
            }
        });
    }

    // Direct navigation from other pages: home.html#about-section
    if (window.location.hash === "#about-section" && aboutLink && aboutSection) {
        setActiveLink(aboutLink);
        showAboutSection(false);
    }
});