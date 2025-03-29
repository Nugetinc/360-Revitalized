async function loadGames() {
    const response = await fetch("games.json");
    const data = await response.json();

    const gameContainer = document.getElementById("gameList");
    const dlcContainer = document.getElementById("dlcList");
    const xblaContainer = document.getElementById("xblaList");

    gameContainer.innerHTML = "";
    dlcContainer.innerHTML = "";
    xblaContainer.innerHTML = "";

    // Load all game data in parallel
    const gameData = await Promise.all(data.games.map(gameFile => fetch(gameFile).then(res => res.json())));
    const dlcData = await Promise.all(data.dlcs.map(dlcFile => fetch(dlcFile).then(res => res.json())));
    const xblaData = await Promise.all(data.xbla.map(xblaFile => fetch(xblaFile).then(res => res.json())));

    gameData.forEach(game => createGameTile(game, "game"));
    dlcData.forEach(dlc => createGameTile(dlc, "dlc"));
    xblaData.forEach(xbla => createGameTile(xbla, "xbla"));
}

function createGameTile(item, category) {
    let gameTile = document.createElement("div");
    gameTile.classList.add("game-tile");
    gameTile.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <h3>${item.title}</h3>
    `;
    gameTile.onclick = () => openModal(item);

    if (category === "game") {
        document.getElementById("gameList").appendChild(gameTile);
    } else if (category === "dlc") {
        document.getElementById("dlcList").appendChild(gameTile);
    } else {
        document.getElementById("xblaList").appendChild(gameTile);
    }
}


function openModal(item, category) {
    const modal = document.getElementById("gameModal");
    const modalContent = document.querySelector(".modal-content");

    // Set hero image as background with fade effect
    modalContent.style.backgroundImage = `url(${item.hero})`;
    modalContent.style.backgroundSize = "cover";
    modalContent.style.backgroundPosition = "center";

    document.getElementById("gameTitle").textContent = item.title;
    document.getElementById("gameDescription").textContent = item.description;
    document.getElementById("downloadLink").href = item.download;

    modal.classList.add("show");
    modal.style.display = "flex";
}


// Close Modal on click outside or close button
document.addEventListener("DOMContentLoaded", () => {
    loadGames();

    const modal = document.getElementById("gameModal");
    const closeButton = document.querySelector(".close");

    closeButton.onclick = () => {
        modal.style.display = "none";
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
});
