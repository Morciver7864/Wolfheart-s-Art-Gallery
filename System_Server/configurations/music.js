function initMusic() {
    const music = document.getElementById('bg-music');
    const overlay = document.getElementById('overlay');
    
    const startGallery = () => {
        // Start the music
        music.play().catch(error => console.log("Playback prevented:", error));
        
        // Hide the overlay
        overlay.style.display = 'none';
        
        // Clean up listeners
        document.removeEventListener('click', startGallery);
        document.removeEventListener('keydown', startGallery);
    };

    // Listen for that first mandatory interaction
    document.addEventListener('click', startGallery);
    document.addEventListener('keydown', startGallery);
}

initMusic();