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
    let isAdmin = false;
    let logoutTimer; // Only one declaration needed

    const container = document.getElementById('art-gallery-container');

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
        renderGallery(); // Now this will find the function below
    } catch (error) { 
        console.error("Load error:", error); 
    }
}

function renderGallery() {
    const container = document.getElementById('art-gallery-container');
    container.innerHTML = ""; // Clear existing items before re-rendering

    myArtworks.forEach((art) => {
        const item = document.createElement('div');
        item.className = 'gallery-item loading'; 
        item.setAttribute('data-title', art.search || "");

        // Define adminControls or a fallback
        const adminControls = `
            <button onclick="openEditModal('${art.id}')">Edit</button>
            <button onclick="removeArt('${art.id}')">Delete</button>
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
    onAuthStateChanged(auth, (user) => {
        isAdmin = !!user;
        const btn = document.getElementById('admin-lock');
        if (btn) {
            btn.innerHTML = user ? "🔓" : "🔒";
            btn.style.backgroundColor = user ? "#324b7a" : "#4a4a4a";
        }
        if (isAdmin) {
            resetLogoutTimer();
        } else {
            clearTimeout(logoutTimer);
        }
        loadArtFromFirebase();
    });

    document.getElementById('admin-lock')?.addEventListener('click', async () => {
        if (isAdmin) {
            if (confirm("Logout?")) {
                await signOut(auth);
                window.location.reload(); // Force refresh to clear UI
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

    /* --- 6. UPLOAD / UPDATE LOGIC --- */
    document.getElementById('show-upload-icon')?.addEventListener('click', () => {
        if (!isAdmin) return alert("Admin login required.");
        document.getElementById('modal-title').innerText = "Add New Masterpiece";
        document.getElementById('new-image-title').value = "";
        document.getElementById('new-image-date').value = "";
        document.getElementById('new-image-desc').value = "";
        document.getElementById('file-input-container').style.display = "block";
        const submitBtn = document.getElementById('submit-new-image');
        submitBtn.innerText = "Submit";
        submitBtn.removeAttribute('data-edit-id');
        document.getElementById('upload-modal').style.display = 'flex';
    });

    document.getElementById('submit-new-image')?.addEventListener('click', async () => {
        const title = document.getElementById('new-image-title').value;
        const date = document.getElementById('new-image-date').value;
        const desc = document.getElementById('new-image-desc').value;
        const editId = document.getElementById('submit-new-image').getAttribute('data-edit-id');
        if (!title) return alert("Please provide a title.");

        if (editId) {
            await updateDoc(doc(db, "artworks", editId), {
                title, search: title.toLowerCase(), date, description: desc
            });
            location.reload();
        } else {
            const file = document.getElementById('new-image-file').files[0];
            if (!file) return alert("Choose an image.");
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async (e) => {
                await addDoc(collection(db, "artworks"), {
                    file: e.target.result, title, search: title.toLowerCase(),
                    date, description: desc, timestamp: Date.now()
                });
                location.reload();
            };
        }
    });

    /* --- 7. SEARCH & UI TOGGLES --- */
document.getElementById('art-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.gallery-item').forEach(item => {
        const artTitle = item.getAttribute('data-title') || "";
        item.style.display = artTitle.includes(term) ? "inline-block" : "none";
    });
});

    document.getElementById('close-upload-modal').onclick = () => document.getElementById('upload-modal').style.display = 'none';
    document.getElementById('close-viewer').onclick = () => document.getElementById('view-modal').style.display = 'none';
    loadArtFromFirebase();
});

// Sidebar logic outside of DOMContentLoaded is fine as long as elements exist
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('nav-links');
    const menuBtn = document.getElementById('menu-toggle');
    const sideOverlay = document.getElementById('sidebar-overlay');
    if (sidebar && sidebar.classList.contains('active')) {
        if (!sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
            sidebar.classList.remove('active');
            if (sideOverlay) sideOverlay.classList.remove('active');
        }
    }
});

const sideOverlay = document.getElementById('sidebar-overlay');
if (sideOverlay) {
    sideOverlay.addEventListener('click', () => {
        document.getElementById('nav-links').classList.remove('active');
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