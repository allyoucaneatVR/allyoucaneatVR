/**
 * Fetches an audio context from compatible browsers
 */
ayce.AudioContext = function() {
    window.AudioContext = (window.AudioContext || window.webkitAudioContext || null);

    if (window.AudioContext) {
        // Create a new audio context.
        this.audioContext = new AudioContext();
    }
    else{
        this.audioContext = {};
        console.error("AudioContext is not supported by your browser");
    }
};