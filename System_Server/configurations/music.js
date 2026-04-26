function initMusic() {
    const music = document.getElementById('bg-music');
    
    // Function to start music and remove the listeners
    const startMusic = () => {
        music.play().catch(error => console.log("Playback prevented:", error));
        // Remove listeners so we don't keep trying to play it
        document.removeEventListener('click', startMusic);
        document.removeEventListener('keydown', startMusic);
    };

    // Listen for the first click or key press
    document.addEventListener('click', startMusic);
    document.addEventListener('keydown', startMusic);
}

// Call it when the page loads
initMusic();