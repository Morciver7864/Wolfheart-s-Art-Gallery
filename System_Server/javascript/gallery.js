/* --- 1. FIREBASE SETUP --- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const viewModal = document.getElementById('view-modal');
const fullImg = document.getElementById('full-image');
const imagePanel = document.querySelector('.view-image-panel');

const firebaseConfig = {
    apiKey: "AIzaSyDdHKdC8Fk3ZuYdqiKZ2cPoGORNVBk6SFs",
    authDomain: "morciver-gallery.firebaseapp.com",
    projectId: "morciver-gallery",
    storageBucket: "morciver-gallery.firebasestorage.app",
    messagingSenderId: "96494036219",
    appId: "1:96494036219:web:6c9a1234b01ce11f44fc5e"
};

document.addEventListener("DOMContentLoaded", () => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    let myArtworks = [];
    let filteredArtworks = [];
    let isAdmin = false;
    let logoutTimer; // Only one declaration needed
    let currentPage = 1;
    const PAGE_SIZE = 12;
    let currentSearchTerm = "";

    const container = document.getElementById('art-gallery-container');
    const pagination = document.getElementById('gallery-pagination');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    const uploadModal = document.getElementById('upload-modal');
    const submitBtn = document.getElementById('submit-new-image');
    const titleInput = document.getElementById('new-image-title');
    const dateInput = document.getElementById('new-image-date');
    const descInput = document.getElementById('new-image-desc');
    const fileInput = document.getElementById('new-image-file');
    const fileInputContainer = document.getElementById('file-input-container');
    const modalTitle = document.getElementById('modal-title');

    function resetUploadFormToCreateMode() {
        if (modalTitle) modalTitle.innerText = "Add New Masterpiece";
        if (titleInput) titleInput.value = "";
        if (dateInput) dateInput.value = "";
        if (descInput) descInput.value = "";
        if (fileInput) fileInput.value = "";
        if (fileInputContainer) fileInputContainer.style.display = "block";
        if (submitBtn) {
            submitBtn.innerText = "Submit";
            submitBtn.removeAttribute('data-edit-id');
            submitBtn.disabled = false;
        }
    }

    async function compressImageToDataUrl(file) {
        const MAX_BASE64_LENGTH = 850000;
        const MIN_QUALITY = 0.45;
        let quality = 0.85;
        let maxDimension = 1600;

        const objectUrl = URL.createObjectURL(file);
        const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error("Failed to load image for compression."));
            image.src = objectUrl;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            throw new Error("Canvas is not available in this browser.");
        }

        while (true) {
            const ratio = Math.min(1, maxDimension / Math.max(img.width, img.height));
            const width = Math.max(1, Math.round(img.width * ratio));
            const height = Math.max(1, Math.round(img.height * ratio));
            canvas.width = width;
            canvas.height = height;
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL("image/jpeg", quality);
            if (dataUrl.length <= MAX_BASE64_LENGTH) {
                URL.revokeObjectURL(objectUrl);
                return dataUrl;
            }

            if (quality > MIN_QUALITY) {
                quality = Math.max(MIN_QUALITY, quality - 0.1);
                continue;
            }

            if (maxDimension > 900) {
                maxDimension = Math.round(maxDimension * 0.85);
                quality = 0.85;
                continue;
            }

            URL.revokeObjectURL(objectUrl);
            throw new Error("Image is still too large after compression. Please choose a smaller file.");
        }
    }

    /* --- 2. AUTO-LOGOUT LOGIC (STRICT) --- */
    async function performAutoLogout() {
        if (isAdmin) {
            try {
                await signOut(auth);
                window.location.reload(); 
            } catch (err) {
                window.location.reload(); 
            }
        }
    }

    function resetLogoutTimer() {
        if (!isAdmin) return;
        clearTimeout(logoutTimer);
        // 300000ms = 5 minutes
        logoutTimer = setTimeout(performAutoLogout, 300000); 
    }

    // Activity Listeners (Properly grouped)
    ['mousemove', 'keypress', 'scroll', 'click', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, resetLogoutTimer);
    });

 /* --- 3. DATA LOADING & RENDERING --- */
async function loadArtFromFirebase() {
    try {
        const q = query(collection(db, "artworks"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        myArtworks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applySearchFilter();
    } catch (error) { 
        console.error("Load error:", error); 
    }
}

function renderGallery() {
    const container = document.getElementById('art-gallery-container');
    container.innerHTML = ""; // Clear existing items before re-rendering
    const pageItems = getCurrentPageItems();

    pageItems.forEach((art) => {
        const item = document.createElement('div');
        item.className = 'gallery-item loading'; 
        item.setAttribute('data-title', art.search || "");

        // Define adminControls or a fallback
        const adminControls = `
            <div class="admin-actions">
                <button type="button" class="admin-btn edit-btn" data-id="${art.id}" title="Edit">✎</button>
                <button type="button" class="admin-btn delete delete-btn" data-id="${art.id}" title="Delete">🗑</button>
            </div>
        `;

        item.innerHTML = `
            <div class="box" style="position:relative;">
                ${isAdmin ? adminControls : ""}
                <img src="${art.file}" class="gallery-img">
                <figcaption>${art.title}</figcaption>
            </div>
        `;

        const img = item.querySelector('.gallery-img');
        
        const showImage = () => {
            setTimeout(() => {
                item.classList.remove('loading');
                img.classList.add('loaded');
            }, 300); 
        };

        if (img.complete) {
            showImage();
        } else {
            img.onload = showImage;
            img.onerror = () => item.classList.remove('loading');
        }

        img.onclick = () => openGalleryView(art);
        container.appendChild(item);
    });
    renderPagination();
}

function getCurrentPageItems() {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredArtworks.slice(start, start + PAGE_SIZE);
}

function getTotalPages() {
    return Math.max(1, Math.ceil(filteredArtworks.length / PAGE_SIZE));
}

function renderPagination() {
    if (!pagination || !pageNumbers || !prevPageBtn || !nextPageBtn) return;
    const totalPages = getTotalPages();
    pagination.style.display = "flex";
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;

    pageNumbers.innerHTML = "";
    const pagesToRender = [];
    if (totalPages <= 7) {
        for (let page = 1; page <= totalPages; page++) pagesToRender.push(page);
    } else if (currentPage <= 3) {
        pagesToRender.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
        pagesToRender.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
        pagesToRender.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }

    pagesToRender.forEach((page) => {
        if (page === "...") {
            const dots = document.createElement("span");
            dots.className = "page-ellipsis";
            dots.textContent = "...";
            pageNumbers.appendChild(dots);
            return;
        }

        const pageBtn = document.createElement("button");
        pageBtn.type = "button";
        pageBtn.className = `page-btn ${page === currentPage ? "active" : ""}`;
        pageBtn.setAttribute("data-page", String(page));
        pageBtn.textContent = String(page);
        pageNumbers.appendChild(pageBtn);
    });
}

function applySearchFilter() {
    const term = currentSearchTerm.trim().toLowerCase();
    filteredArtworks = term
        ? myArtworks.filter((art) => (art.search || "").includes(term))
        : [...myArtworks];
    currentPage = 1;
    renderGallery();
}

    /* --- 4. GLOBAL FUNCTIONS --- */
    window.openEditModal = (id) => {
        const art = myArtworks.find(a => a.id === id);
        if (!art) return;
        document.getElementById('modal-title').innerText = "Edit Masterpiece";
        document.getElementById('new-image-title').value = art.title || "";
        document.getElementById('new-image-date').value = art.date || "";
        document.getElementById('new-image-desc').value = art.description || "";
        document.getElementById('file-input-container').style.display = "none";
        const submitBtn = document.getElementById('submit-new-image');
        submitBtn.innerText = "Update Info";
        submitBtn.setAttribute('data-edit-id', id);
        document.getElementById('upload-modal').style.display = 'flex';
    };

    window.removeArt = async (id) => {
        if (confirm("Delete this masterpiece forever?") && isAdmin) {
            try {
                await deleteDoc(doc(db, "artworks", id));
                loadArtFromFirebase();
            } catch (e) { alert(e.message); }
        }
    };

    /* --- 5. AUTHENTICATION & LOGIN --- */
/* --- 5. AUTHENTICATION & LOGIN (UPDATED) --- */
onAuthStateChanged(auth, (user) => {
    isAdmin = !!user;
    const btn = document.getElementById('admin-lock');
    const adminControls = document.getElementById('admin-controls');

    // Update the Lock Icon
    if (btn) {
        btn.innerHTML = user ? "🔓" : "🔒";
        btn.style.backgroundColor = user ? "#324b7a" : "#4a4a4a";
    }

    if (isAdmin) {
        // Show the admin configuration panel
        if (adminControls) adminControls.style.display = 'block';
        
        // AUTO-OPEN: Reveal the Lore form immediately upon login
        if (uploadModal) {
            uploadModal.style.display = 'flex';
            resetUploadFormToCreateMode();
        }
        
        resetLogoutTimer();
    } else {
        // Hide admin UI and form if logged out
        if (adminControls) adminControls.style.display = 'none';
        if (uploadModal) uploadModal.style.display = 'none';
        
        clearTimeout(logoutTimer);
    }
    
    loadArtFromFirebase();
});

/* --- Keep your existing admin-lock click listener exactly as is --- */
document.getElementById('admin-lock')?.addEventListener('click', async () => {
    if (isAdmin) {
        if (confirm("Logout?")) {
            await signOut(auth);
            window.location.reload(); 
        }
        return;
    }
    let email = prompt("Admin Email:");
    if (email?.toUpperCase() === "RESET") {
        await sendPasswordResetEmail(auth, "morciver7864@gmail.com");
        return alert("Reset sent!");
    }
    let pass = prompt("Password:");
    if (email && pass) {
        await signInWithEmailAndPassword(auth, email, pass)
            .then(() => alert("Welcome back, Morc!"))
            .catch(e => alert("Login Failed: " + e.message));
    }
});

    // Reliable delegated handlers for dynamically-rendered admin buttons.
    container?.addEventListener('click', (event) => {
        const editBtn = event.target.closest('.edit-btn');
        if (editBtn) {
            event.stopPropagation();
            window.openEditModal(editBtn.dataset.id);
            return;
        }

        const deleteBtn = event.target.closest('.delete-btn');
        if (deleteBtn) {
            event.stopPropagation();
            window.removeArt(deleteBtn.dataset.id);
        }
    });

    const editModeBtn = document.getElementById('edit-mode-btn');
    const deleteModeBtn = document.getElementById('delete-mode-btn');
    editModeBtn?.addEventListener('click', () => {
        container?.classList.toggle('show-admin-actions');
    });
    deleteModeBtn?.addEventListener('click', () => {
        container?.classList.toggle('show-admin-actions');
    });

    /* --- 6. UPLOAD / UPDATE LOGIC --- */
    document.getElementById('show-upload-icon')?.addEventListener('click', () => {
        if (!isAdmin) return alert("Admin login required.");
        resetUploadFormToCreateMode();
        if (uploadModal) uploadModal.style.display = 'flex';
    });

    document.getElementById('submit-new-image')?.addEventListener('click', async () => {
        if (!isAdmin) return alert("Admin login required.");
        const title = titleInput?.value?.trim() || "";
        const date = dateInput?.value || "";
        const desc = descInput?.value || "";
        const editId = submitBtn?.getAttribute('data-edit-id');
        if (!title) return alert("Please provide a title.");

        if (submitBtn) submitBtn.disabled = true;
        try {
            if (editId) {
                await updateDoc(doc(db, "artworks", editId), {
                    title, search: title.toLowerCase(), date, description: desc
                });
                location.reload();
            } else {
                const file = fileInput?.files?.[0];
                if (!file) {
                    if (submitBtn) submitBtn.disabled = false;
                    return alert("Choose an image.");
                }
                const compressedDataUrl = await compressImageToDataUrl(file);
                await addDoc(collection(db, "artworks"), {
                    file: compressedDataUrl, title, search: title.toLowerCase(),
                    date, description: desc, timestamp: Date.now()
                });
                location.reload();
            }
        } catch (error) {
            if (submitBtn) submitBtn.disabled = false;
            alert("Failed to save artwork: " + error.message);
        }
    });

    /* --- 7. SEARCH & UI TOGGLES --- */
document.getElementById('art-search')?.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value || "";
    applySearchFilter();
});

prevPageBtn?.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage -= 1;
        renderGallery();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

nextPageBtn?.addEventListener('click', () => {
    const totalPages = getTotalPages();
    if (currentPage < totalPages) {
        currentPage += 1;
        renderGallery();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

pageNumbers?.addEventListener('click', (event) => {
    const btn = event.target.closest('.page-btn');
    if (!btn) return;
    const targetPage = parseInt(btn.dataset.page, 10);
    if (!Number.isNaN(targetPage) && targetPage !== currentPage) {
        currentPage = targetPage;
        renderGallery();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

    document.getElementById('close-upload-modal').onclick = () => {
        if (uploadModal) uploadModal.style.display = 'none';
        resetUploadFormToCreateMode();
    };
    document.getElementById('close-viewer').onclick = () => document.getElementById('view-modal').style.display = 'none';
});

// Sidebar logic outside of DOMContentLoaded is fine as long as elements exist
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('nav-links');
    const menuBtn = document.getElementById('menu-toggle');
    const sideOverlay = document.getElementById('overlay');
    if (sidebar && sidebar.classList.contains('active')) {
        if (!sidebar.contains(event.target) && (!menuBtn || !menuBtn.contains(event.target))) {
            sidebar.classList.remove('active');
            if (sideOverlay) sideOverlay.classList.remove('active');
        }
    }
});

const sideOverlay = document.getElementById('overlay');
if (sideOverlay) {
    sideOverlay.addEventListener('click', () => {
        const navLinks = document.getElementById('nav-links');
        if (navLinks) navLinks.classList.remove('active');
        sideOverlay.classList.remove('active');
    });
}

function openGalleryView(art) {
    fullImg.classList.remove('loaded');
    imagePanel.classList.add('loading'); 
    fullImg.src = art.file;
    fullImg.onload = () => {
        setTimeout(() => {
            imagePanel.classList.remove('loading');
            fullImg.classList.add('loaded');
        }, 100);
    };
    document.getElementById('view-title').innerText = art.title;
    document.getElementById('view-description').innerText = art.description || "No lore recorded.";
    const dateEl = document.getElementById('view-date');
    if (dateEl) {
        dateEl.innerText = art.date ? `Recorded on: ${art.date}` : "Unknown Date";
    }
    viewModal.style.display = "flex";
}