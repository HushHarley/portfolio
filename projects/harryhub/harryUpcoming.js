document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let estValide = true;

    // reset old errors 
    document.querySelectorAll(".error-message").forEach(function (span) {
        span.textContent = "";
    });

    // name check
    const nom = document.getElementById("formName");
    if (nom.value.trim() === "") {
        document.getElementById("formNameError").textContent = "Besoin du nom";
        estValide = false;
    }

    // basic email check
    const email = document.getElementById("formEmail");
    const emailValue = email.value.trim();
    if (!emailValue.includes("@") || !emailValue.includes(".")) {
        document.getElementById("formEmailError").textContent = "Si'il vous plait entre un courielle valide.";
        estValide = false;
    }

    // pass length
    const password = document.getElementById("formPassword");
    if (password.value.length < 6) {
        document.getElementById("formPasswordError").textContent = "mot de passe dois etre au moins 6 characters.";
        estValide = false;
    }

    if (estValide) {
        alert("Merci pour le sub!");
        document.getElementById("contactForm").reset();
    }
});

const soundVolume = document.querySelector(".audioPlayerAudio");
soundVolume.volume = 0.1;

const muteButton = document.getElementById("muteButton");

muteButton.addEventListener("click", function () {
    soundVolume.muted = !soundVolume.muted;
    muteButton.textContent = soundVolume.muted ? "🔇" : "🔊";
});