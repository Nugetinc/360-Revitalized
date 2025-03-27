async function loadGames() {
    const response = await fetch("games.json");
    const data = await response.json();

    // Load Games
    const gameContainer = document.getElementById("gameList");
    gameContainer.innerHTML = "";
    for (const gameFile of data.games) {
        const gameData = await fetch(gameFile).then(res => res.json());
        createGameTile(gameData, "game");
    }

    // Load DLCs
    const dlcContainer = document.getElementById("dlcList");
    dlcContainer.innerHTML = "";
    for (const dlcFile of data.dlcs) {
        const dlcData = await fetch(dlcFile).then(res => res.json());
        createGameTile(dlcData, "dlc");
    }
}

function createGameTile(item, category) {
    let gameTile = document.createElement("div");
    gameTile.classList.add("game-tile");
    gameTile.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <h3>${item.title}</h3>
    `;
    gameTile.onclick = () => openModal(item, category);
    if (category === "game") {
        document.getElementById("gameList").appendChild(gameTile);
    } else {
        document.getElementById("dlcList").appendChild(gameTile);
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
