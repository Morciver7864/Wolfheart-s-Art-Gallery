import { db } from '../configurations/firebase-config.js'; 
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// --- 1. Admin Visibility Logic ---
const lockBtn = document.getElementById('admin-lock');
const lockIcon = document.getElementById('lock-icon');
const adminControls = document.getElementById('admin-commission-controls');

const input = document.getElementById('comm-slots-filled');
const incBtn = document.getElementById('inc-btn');
const decBtn = document.getElementById('dec-btn');

incBtn?.addEventListener('click', () => {
    // Convert current value to a number
    let currentValue = parseInt(input.value) || 0;
    
    // Logic: Only add if it's less than your max (10)
    if (currentValue < 10) {
        input.value = currentValue + 1;
        console.log("Slots updated (+):", input.value);
    }
});

// Function to handle the Decrement (-)
decBtn?.addEventListener('click', () => {
    // Convert current value to a number
    let currentValue = parseInt(input.value) || 0;
    
    // Logic: Only subtract if it's greater than 0
    if (currentValue > 0) {
        input.value = currentValue - 1;
        console.log("Slots updated (-):", input.value);
    }
});

// --- 2. Save Data to Firebase ---
const saveBtn = document.getElementById('save-comm-status');
const isOpenElement = document.getElementById('comm-visibility-toggle');
saveBtn?.addEventListener('click', async () => {
    console.log("Attempting to save..."); 
    
    // Ensure these IDs match your HTML exactly
    const statusLabelElement = document.getElementById('comm-status-label');
    const slotsFilledElement = document.getElementById('comm-slots-filled');
    const startTimeElement = document.getElementById('admin-start-time');
    const deadlineElement = document.getElementById('admin-deadline');
    const isOpenElement = document.getElementById('comm-visibility-toggle'); // Check this ID

    const customerInputs = document.querySelectorAll('.customer-name-input');
    const customerListArray = Array.from(customerInputs).map(input => input.value);

    try {
        const commRef = doc(db, "settings", "commissions");
        
        // FIX: Ensure customerList is just one of many top-level fields
        // Inside your saveBtn listener
await updateDoc(commRef, {
    isOpen: isOpenElement.value === 'open', 
    statusLabel: statusLabelElement.value,
    slotsFilled: parseInt(slotsFilledElement.value) || 0,
    customerList: customerListArray, 
    
    // 1. Keep these for the Progress Bar (The .toMillis() logic)
    startTime: startTimeElement.value ? new Date(startTimeElement.value) : null,
    deadline: deadlineElement.value ? new Date(deadlineElement.value) : null,

    // 2. ADD THESE for the Text Labels (The "Started: 05/03/2026" logic)
    startDate: startTimeElement.value,    // This saves the raw text
    deadlineDate: deadlineElement.value, // This saves the raw text
    
    lastUpdated: new Date() 
});

        console.log("Success: Visibility, Status, and Customers synced.");
        alert("System Updated!");
    } catch (e) {
        console.error("Save failed: ", e);
        alert("Save failed. Check console.");
    }
});

// --- 3. Sync Admin Inputs ---
async function loadCurrentCommissionData() {
    const docSnap = await getDoc(doc(db, "settings", "commissions"));
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('comm-status-label').value = data.statusLabel;
        document.getElementById('comm-slots-filled').value = data.slotsFilled;
    }
}

// --- 4. Public UI Update ---
async function displayPublicStatus() {
    const statusBadge = document.getElementById('public-status-badge');
    const bar = document.getElementById('status-progress-fill');
    const slotText = document.getElementById('public-slot-count');
    const statusBox = document.querySelector('.public-comm-status'); // The main container

    if (statusBadge) statusBadge.classList.add('loading-dots');

    const docSnap = await getDoc(doc(db, "settings", "commissions"));

    if (docSnap.exists()) {
        const data = docSnap.data();

        // 1. Check if Commissions are OPEN or CLOSED
        if (!data.isOpen) {
            if (statusBadge) statusBadge.classList.remove('loading-dots');
            // Show a closed message instead of the progress bar
            statusBox.innerHTML = `
                <div style="text-align: center; padding: 10px; border: 1px dashed #ff4d4d; border-radius: 8px;">
                    <h3 style="color: #ff4d4d; margin: 0;">Commissions Closed</h3>
                    <p style="font-size: 0.8rem; margin: 5px 0 0;">Focusing on internal projects.</p>
                </div>
            `;
            return; // Stop execution here
        }

        // 2. Handle Date Displays
        if (data.startTime && data.deadline) {
            const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
            const startStr = data.startTime.toDate().toLocaleDateString(undefined, options);
            const endStr = data.deadline.toDate().toLocaleDateString(undefined, options);
                
            document.getElementById('start-date-display').innerText = `Started: ${startStr}`;
            document.getElementById('deadline-display').innerText = `Deadline: ${endStr}`;
        }

        // 3. Set Status and Slots
        if (statusBadge) {
            statusBadge.classList.remove('loading-dots');
            statusBadge.innerText = data.statusLabel;
        }
        if (slotText) slotText.innerText = `${data.slotsFilled}/10`;

        // 4. Progress Bar and Split Percentage Logic
        if (bar && data.startTime && data.deadline) {
            const start = data.startTime.toMillis();
            const end = data.deadline.toMillis();
            const now = Date.now();

            let timeProgress = ((now - start) / (end - start)) * 100;
            timeProgress = Math.max(0, Math.min(timeProgress, 100));
            const displayNum = Math.round(timeProgress);

            bar.style.width = "0%"; 
            
            setTimeout(() => {
                bar.style.width = timeProgress + "%";
                const numLabel = document.getElementById('progress-val-num');
                if (numLabel) {
                    numLabel.innerText = displayNum;
                }
            }, 150);
        }
    }
}
function updateCustomerFields() {
    const slotsInput = document.getElementById('comm-slots-filled');
    const container = document.getElementById('customer-inputs');
    if (!slotsInput || !container) return;

    const count = parseInt(slotsInput.value) || 0;
    
    // Save current values so adding a slot doesn't erase existing names
    const currentValues = Array.from(document.querySelectorAll('.customer-name-input'))
                               .map(input => input.value);
    
    container.innerHTML = ''; 

    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'customer-name-input';
        input.placeholder = `Customer for Slot #${i + 1}`;
        input.value = currentValues[i] || ''; // Restore name if it existed
        container.appendChild(input);
    }
}
// Run these on page load
loadCurrentCommissionData(); // Fills the admin inputs with current data
displayPublicStatus();       // Updates the public progress bar and badge