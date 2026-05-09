import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDdHKdC8Fk3ZuYdqiKZ2cPoGORNVBk6SFs",
    authDomain: "morciver-gallery.firebaseapp.com",
    projectId: "morciver-gallery",
    storageBucket: "morciver-gallery.firebasestorage.app",
    messagingSenderId: "96494036219",
    appId: "1:96494036219:web:6c9a1234b01ce11f44fc5e",
    measurementId: "G-K3CLRRP5XF"
};

// Initialize Firebase once
const app = initializeApp(firebaseConfig);

// Export both Database and Auth for use in your other scripts
export const db = getFirestore(app);
export const auth = getAuth(app);