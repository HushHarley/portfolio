const button = document.getElementById("newJokeBtn");
button.addEventListener("click", getApiInfo);

getApiInfo();

async function getApiInfo() {
    try {
        const response = await fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=racist,nsfw,explicit')
        const data = await response.json()
        afficherData(data)
    } catch (error) {
        console.error('Erreur :', error);
    }
}

function afficherData(donnees) {
    let div = document.getElementById("jokeCard");

    if (donnees.type === "twopart") {
        div.innerHTML = `
            <p class="setup">${donnees.setup}</p>
            <p class="punchline">${donnees.delivery}</p>
        `;
    } else {
        div.innerHTML = `
            <p class="setup">${donnees.joke}</p>
        `;
    }
}

// useless code apart from being able to learn from it

//first method

// div.append(title, thumbnail, short_description, genre, publisher, game_url)
// let title = document.createElement("h2");
// let thumbnail = document.createElement("img");
// let short_description = document.createElement("p");
// let genre = document.createElement("p");
// let publisher = document.createElement("p");
// let game_url = document.createElement("a")

// title.textContent = donnees[index].title;
// thumbnail.src = donnees[index].thumbnail;
// short_description.textContent = donnees[index].short_description;
// genre.textContent = donnees[index].genre;
// publisher.textContent = donnees[index].publisher;
// game_url.href = donnees[index].game_url;
// game_url.textContent = `Visit Game Here`;