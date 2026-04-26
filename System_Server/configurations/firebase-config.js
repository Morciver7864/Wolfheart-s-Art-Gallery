// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDdHKdC8Fk3ZuYdqiKZ2cPoGORNVBk6SFs",
    authDomain: "morciver-gallery.firebaseapp.com",
    projectId: "morciver-gallery",
    storageBucket: "morciver-gallery.firebasestorage.app",
    messagingSenderId: "96494036219",
    appId: "1:96494036219:web:6c9a1234b01ce11f44fc5e",
    measurementId: "G-K3CLRRP5XF"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the database for use in home.js and gallery.js
export const db = getFirestore(app);