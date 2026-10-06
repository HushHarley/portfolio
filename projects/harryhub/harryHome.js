const soundVolume = document.querySelector(".audioPlayerAudio");

soundVolume.volume = 0.2;

const muteButton = document.getElementById("muteButton");

muteButton.addEventListener("click", function () {
    soundVolume.muted = !soundVolume.muted;
    muteButton.textContent = soundVolume.muted ? "🔇" : "🔊";
    
});