import { db } from '../configurations/firebase-config.js';
import { 
    collection, addDoc, doc, getDoc, updateDoc, arrayUnion, serverTimestamp, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const requestForm = document.getElementById('art-request-form');
const commRef = doc(db, "settings", "commissions");

// --- PART 1: THE SUBMISSION (Writing to Firebase) ---
requestForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newName = document.getElementById('cust-name').value;
    const requestData = {
        name: newName,
        email: document.getElementById('cust-email').value,
        paymentMethod: document.getElementById('cust-payment').value,
        description: document.getElementById('cust-desc').value,
        status: "pending",
        submittedAt: serverTimestamp()
    };

    try {
        // 1. Save private detailed record
        await addDoc(collection(db, "requests"), requestData);

        // 2. Try to add to the public Active List
        const docSnap = await getDoc(commRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const currentList = data.customerList || [];

            if (currentList.length < 10) {
                await updateDoc(commRef, {
                    customerList: arrayUnion(newName),
                    slotsFilled: currentList.length + 1
                });
                alert("Success! You are now on the active list.");
            } else {
                alert("Request received! My active slots are full, so you've been added to the queue.");
            }
        }
        requestForm.reset();
    } catch (error) {
        console.error("System Error:", error);
        alert("Critical failure in transmission. Please try again.");
    }
});

// --- PART 2: THE DISPLAY (Reading from Firebase Live) ---
onSnapshot(commRef, (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        const customerDisplay = document.getElementById('customer-list-display');

        if (customerDisplay && data.customerList) {
            customerDisplay.innerHTML = ''; // Clear for fresh render

            data.customerList.forEach((name, index) => {
                if (name.trim() !== "") {
                    const nameEl = document.createElement('div');
                    nameEl.className = 'active-customer-item';
                    
                    // Added the button here specifically for your HTML structure
                    nameEl.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 8px;">
                            <div>
                                <span style="color: #00f2ff; margin-right: 10px;">[${index + 1}]</span>
                                <span style="color: #fff;">${name.toUpperCase()}</span>
                            </div>
                            <button onclick="markAsDone('${name}')" class="done-btn">
                                DONE
                            </button>
                        </div>
                    `;
                    customerDisplay.appendChild(nameEl);
                }
            });

            if (data.customerList.length === 0) {
                customerDisplay.innerHTML = '<p style="color: rgba(255,255,255,0.3);">NO ACTIVE DATA</p>';
            }
        }
    }
});

// This function is triggered when you click the button in your Admin UI
// Add this to your script so the button knows what to do
window.markAsDone = async function(customerName) {
    const confirmDone = confirm(`Mark ${customerName} as completed?`);
    if (!confirmDone) return;

    try {
        await updateDoc(commRef, {
            customerList: arrayRemove(customerName),
            slotsFilled: increment(-1)
        });
        // Note: The record remains in your 'requests' collection for your system records.
    } catch (error) {
        console.error("Error:", error);
    }
};