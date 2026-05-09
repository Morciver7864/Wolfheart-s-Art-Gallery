import { db } from '../configurations/firebase-config.js'; 
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const commRef = doc(db, "settings", "commissions");

onSnapshot(commRef, (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        
        const openView = document.getElementById('commissions-open-view');
        const closedView = document.getElementById('commissions-closed-view');

        if (data.isOpen === true) {
            if (openView) openView.style.display = 'block';
            if (closedView) closedView.style.display = 'none';

            const badge = document.getElementById('public-status-badge');
            const count = document.getElementById('public-slot-count');
            const startText = document.getElementById('start-date-display');
            const endText = document.getElementById('deadline-display');

            const formatMagicDate = (dateStr) => {
                if (!dateStr) return "--/--/--";
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', { 
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                });
            };

            if (badge) badge.innerText = data.statusLabel;
            if (count) count.innerText = `Slots: ${data.slotsFilled}/10`;

            if (startText && data.startDate) {
                startText.innerText = `Started: ${formatMagicDate(data.startDate)}`;
            }
            if (endText && data.deadlineDate) {
                endText.innerText = `Deadline: ${formatMagicDate(data.deadlineDate)}`;
            }

            // --- APPLIED LOGIC: Real-time Ticker ---
            const updateUI = () => {
                const bar = document.getElementById('status-progress-fill');
                const percentNum = document.getElementById('progress-val-num');

                if (bar && data.startTime && data.deadline) {
                    const start = data.startTime.toMillis();
                    const end = data.deadline.toMillis();
                    const now = Date.now();
                    
                    let progress = Math.max(0, Math.min(((now - start) / (end - start)) * 100, 100));
                    
                    bar.style.width = progress + "%"; 
                    if (percentNum) {
                        percentNum.innerText = Math.floor(progress); 
                    }
                }
            };

            // Run immediately on data load
            updateUI();

            // Refresh the progress every 60 seconds without refreshing the whole page
            if (window.commissionInterval) clearInterval(window.commissionInterval);
            window.commissionInterval = setInterval(updateUI, 60000); 
            
        } else {
            // Stop the interval if commissions are closed
            if (window.commissionInterval) clearInterval(window.commissionInterval);

            if (openView) openView.style.display = 'none';
            if (closedView) {
                closedView.style.display = 'block';
                const closedStatusText = document.getElementById('closed-status-text');
                if (closedStatusText) {
                    closedStatusText.innerText = data.statusLabel;
                }
            }
        }
    }
});