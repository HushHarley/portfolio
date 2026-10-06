getApiCharacterInfo();

const audioPlayer = document.querySelector(".audioPlayerAudio");
audioPlayer.volume = 0.1; 

const muteButton = document.getElementById("muteButton");

muteButton.addEventListener("click", function () {
    audioPlayer.muted = !audioPlayer.muted;
    muteButton.textContent = audioPlayer.muted ? "🔇" : "🔊";
});

async function getApiCharacterInfo() {
    try {
        const response = await fetch('https://potterapi-fedeperin.vercel.app/en/books')
        const characters = await response.json()
        afficherData(characters)
    } catch (error) {
        console.error('Erreur :', error);
    }
}

function afficherData(donnees) {
    const bookCarteBoite = document.querySelector(".bookCarteBoite");

    for (let index = 0; index < donnees.length; index++) {
        let div = document.createElement("div");
        div.classList = "bookCarte";
        div.innerHTML = `
        <div class="borderLineLine1"></div>
        <img class="borderLineMid">
        <img class="borderLineMid" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIxNyIgdmlld0JveD0iMCAwIDMyIDE3Ij4KICAgIDxwYXRoIGZpbGw9IiM3NTc1NzUiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTguMjk1IDBsOC4yOTUgOC4yOTUtOC4yOTUgOC4yOTVMMCA4LjI5NSA4LjI5NSAwem0wIDEuNDE0bC02Ljg4IDYuODgxIDYuODggNi44ODEgNi44ODEtNi44OC02Ljg4LTYuODgyek0xNS44ODMgMGw4LjI5NSA4LjI5NS04LjI5NSA4LjI5NS04LjI5NS04LjI5NUwxNS44ODMgMHptMCAxLjQxNGwtNi44OCA2Ljg4MSA2Ljg4IDYuODgxIDYuODgtNi44OC02Ljg4LTYuODgyek0yMy40NzEgMGw4LjI5NSA4LjI5NS04LjI5NSA4LjI5NS04LjI5NS04LjI5NUwyMy40NyAwek0xNi41OSA4LjI5NWw2Ljg4IDYuODgxIDYuODgyLTYuODgtNi44ODEtNi44ODItNi44ODEgNi44ODF6IiBvcGFjaXR5PSIuMjYzIi8+Cjwvc3ZnPgo="  ></img>
        <h2 class="bookName">${donnees[index].title}</h2>
        <p class="bookDescription">${donnees[index].description}</p>
        <div class="borderLineLine2"></div>
        <img class="bookCover" src="${bookImages[index]}" alt="">
        `

        bookCarteBoite.appendChild(div);
    }
}

const bookImages = [
    "https://www.harrypotter.com/_next/image?url=%2Fimages%2Fproducts%2Fbooks%2FUK%2Frectangle-1.jpg&w=1320&q=75",
    "https://www.harrypotter.com/_next/image?url=%2Fimages%2Fproducts%2Fbooks%2FUK%2Frectangle-2.jpg&w=1320&q=75",
    "https://www.harrypotter.com/_next/image?url=%2Fimages%2Fproducts%2Fbooks%2FUK%2Frectangle-3.jpg&w=1320&q=75",
    "https://www.harrypotter.com/_next/image?url=%2Fimages%2Fproducts%2Fbooks%2FUK%2Frectangle-4.jpg&w=1320&q=75",
    "https://www.harrypotter.com/_next/image?url=%2Fimages%2Fproducts%2Fbooks%2FUK%2Frectangle-5.jpg&w=1320&q=75",
    "https://www.harrypotter.com/_next/image?url=%2Fimages%2Fproducts%2Fbooks%2FUK%2Frectangle-6.jpg&w=1320&q=75",
    "https://www.harrypotter.com/_next/image?url=%2Fimages%2Fproducts%2Fbooks%2FUK%2Frectangle-7.jpg&w=1320&q=75",
    "https://www.harrypotter.com/_next/image?url=%2Fimages%2Fproducts%2Fbooks%2FUK%2Frectangle-8.jpg&w=1320&q=75"
];
