import { db } from '../configurations/firebase-config.js';
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- GLOBAL SETTINGS ---
let carouselSettings = {
    autoScroll: true,
    baseSpeed: 1, 
    dragSensitivity: 1.5,
    momentumFriction: 0.95
};

let currentX = 0;
let isDown = false;
let velocity = -carouselSettings.baseSpeed; 
let animationId;

async function initHomeCarousel() {
    const track = document.getElementById('dynamic-carousel-track');
    if (!track) return;

    try {
        const artworksRef = collection(db, "artworks");
        const q = query(artworksRef, orderBy("timestamp", "desc"), limit(12));
        const querySnapshot = await getDocs(q);
        
        let itemsHTML = "";
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const displayTitle = (data.title || data.search || "Untitled masterpiece").replace(/'/g, "\\'");
            const displayDesc = (data.description || "No lore recorded.").replace(/'/g, "\\'").replace(/\n/g, " ");
            const displayDate = data.date || "Unknown Date"; 

            if (data.file) {
                // 1. We keep 'loading' class and set img opacity to 0 by default
                itemsHTML += `
                    <div class="carousel-item loading" onclick="openZoom('${data.file}', '${displayTitle}', '${displayDesc}', '${displayDate}')">
                        <img src="${data.file}" alt="${displayTitle}" style="opacity: 0;" onload="revealImage(this)" onerror="failImageLoad(this)">
                        <div class="item-info">
                            <h3>${displayTitle}</h3>
                            <p class="carousel-date">${displayDate}</p>
                        </div>
                    </div>`;
            }
        });

        if (itemsHTML !== "") {
            track.innerHTML = itemsHTML + itemsHTML; 
            
            // 2. Handle images that are already cached
            document.querySelectorAll('.carousel-item img').forEach(img => {
                if (img.complete) revealImage(img);
            });

            setupSearch();
            setupOptions(); 
            startSmartLoop(track); 
        }
    } catch (e) { console.error("LumaNexus Error:", e); }
}

// 3. New helper function to create a smooth transition
window.revealImage = (img) => {
    // We add a tiny delay (200ms) so the user's eye actually sees the skeleton shimmer
    setTimeout(() => {
        const parent = img.closest('.carousel-item');
        if (parent) parent.classList.remove('loading');
        img.classList.add('loaded');
        img.style.opacity = "1";
    }, 200);
};

window.failImageLoad = (img) => {
    const parent = img.closest('.carousel-item');
    if (parent) parent.classList.remove('loading');
    img.style.opacity = "0.35";
};

function startSmartLoop(track) {
    let lastX = 0;
    const render = () => {
        if (!isDown) {
            if (carouselSettings.autoScroll) {
                currentX += velocity;
                const direction = velocity > 0 ? 1 : -1;
                const targetVelocity = direction * carouselSettings.baseSpeed;
                if (Math.abs(velocity) > carouselSettings.baseSpeed) {
                    velocity *= carouselSettings.momentumFriction;
                } else {
                    velocity = targetVelocity;
                }
            } else {
                currentX += velocity;
                velocity *= carouselSettings.momentumFriction;
                if (Math.abs(velocity) < 0.1) velocity = 0;
            }
        }

        const halfWidth = track.scrollWidth / 2;
        if (currentX <= -halfWidth) currentX = 0;
        if (currentX > 0) currentX = -halfWidth;

        track.style.transform = `translateX(${currentX}px)`;
        animationId = requestAnimationFrame(render);
    };

    const handleStart = (x) => { isDown = true; track.classList.add('grabbing'); lastX = x; };
    const handleMove = (x) => {
        if (!isDown) return;
        const walk = (x - lastX) * carouselSettings.dragSensitivity;
        lastX = x;
        currentX += walk;
        velocity = walk; 
    };
    const handleEnd = () => {
        isDown = false;
        track.classList.remove('grabbing');
        if (Math.abs(velocity) < 0.1) {
            velocity = (velocity >= 0) ? carouselSettings.baseSpeed : -carouselSettings.baseSpeed;
        }
    };

    track.addEventListener('mousedown', (e) => handleStart(e.pageX));
    window.addEventListener('mousemove', (e) => handleMove(e.pageX));
    window.addEventListener('mouseup', handleEnd);
    track.addEventListener('touchstart', (e) => handleStart(e.touches[0].pageX));
    window.addEventListener('touchmove', (e) => handleMove(e.touches[0].pageX), { passive: false });
    window.addEventListener('touchend', handleEnd);

    animationId = requestAnimationFrame(render);
}

// --- ZOOM & SIDEBAR LOGIC ---
window.openZoom = (imgSrc, imgTitle, imgDesc, imgDate) => {
    // 1. Close Sidebar and Overlay immediately
    const sidebar = document.getElementById('nav-links');
    const sideOverlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (sideOverlay) sideOverlay.classList.remove('active');

    // 2. Populate Zoom Modal
    document.getElementById('zoom-img').src = imgSrc;
    document.getElementById('zoom-title').innerText = imgTitle;
    document.getElementById('zoom-description').innerText = imgDesc;
    const dateEl = document.getElementById('zoom-date');
    if (dateEl) dateEl.innerText = `Recorded on: ${imgDate}`;
    
    // 3. Show Zoom Overlay
    document.getElementById('zoom-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
};

window.closeZoom = () => {
    document.getElementById('zoom-overlay').style.display = 'none';
    document.body.style.overflow = 'auto';
};

// --- OUTSIDE CLICK LOGIC ---
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('nav-links');
    const menuBtn = document.getElementById('menu-toggle');
    const sideOverlay = document.getElementById('sidebar-overlay');

    if (sidebar && sidebar.classList.contains('active')) {
        // If click is not on sidebar AND not on the toggle button
        if (!sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
            sidebar.classList.remove('active');
            if (sideOverlay) sideOverlay.classList.remove('active');
        }
    }
});

// Click the dark overlay directly
const sideOverlay = document.getElementById('sidebar-overlay');
if (sideOverlay) {
    sideOverlay.addEventListener('click', () => {
        document.getElementById('nav-links').classList.remove('active');
        sideOverlay.classList.remove('active');
    });
}

function setupOptions() {
    const speedRange = document.getElementById('speed-range');
    const frictionRange = document.getElementById('friction-range');

    if (speedRange) {
        carouselSettings.baseSpeed = parseFloat(speedRange.value) || carouselSettings.baseSpeed;
        speedRange.addEventListener('input', (e) => {
            carouselSettings.baseSpeed = parseFloat(e.target.value);
        });
    }

    if (frictionRange) {
        carouselSettings.momentumFriction = parseFloat(frictionRange.value) || carouselSettings.momentumFriction;
        frictionRange.addEventListener('input', (e) => {
            carouselSettings.momentumFriction = parseFloat(e.target.value);
        });
    }
}

function setupSearch() {
    const searchInput = document.getElementById('artSearch');
    const track = document.getElementById('dynamic-carousel-track');
    if (!searchInput || !track) return;
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.carousel-item');
        if (term !== "") {
            cancelAnimationFrame(animationId);
            track.style.transform = 'translateX(0)';
        } else {
            animationId = requestAnimationFrame(() => startSmartLoop(track));
        }
        items.forEach((item, index) => {
            const title = item.querySelector('h3').innerText.toLowerCase();
            item.style.display = (term === "" || (title.includes(term) && index < items.length/2)) ? "block" : "none";
        });
    });
}

initHomeCarousel();