fetch('games.json')
  .then(res => res.json())
  .then(data => {
    loadCategory(data.games, 'gameList');
    loadCategory(data.xbla, 'xblaList');
    loadCategory(data.dlcs, 'dlcList');
  });

  
  function loadCategory(gamePaths, containerId) {
    const container = document.getElementById(containerId);
    gamePaths.forEach((path, index) => {
      fetch(path)
        .then(res => res.json())
        .then(game => {
          const tile = document.createElement('div');
          tile.className = 'game-tile';
          tile.style.animationDelay = `${index * 50}ms`; // 👈 staggered pop-in
          tile.innerHTML = `
            <img src="${game.image}" alt="${game.title}">
            <h3>${game.title}</h3>
            <div class="platform">${game.platform}</div>
          `;
          tile.addEventListener('click', () => showModal(game));
          container.appendChild(tile);
        });
    });
  }
// Function to show the modal with game details  

function showModal(game) {
  const modal = document.getElementById('gameModal');
  document.getElementById('gameDescription').innerText = game.description;
  document.getElementById('gameLogo').src = game.logo;

  const gallery = document.getElementById('gameScreenshots');
  gallery.innerHTML = '';
  if (Array.isArray(game.screenshots)) {
    game.screenshots.forEach(screenshot => {
      const img = document.createElement('img');
      img.src = screenshot;
      gallery.appendChild(img);
    });
  }

  const downloadLink = document.getElementById('downloadLink');
  downloadLink.href = game.download;
  downloadLink.textContent = 'Download';

  modal.classList.add('show');
  modal.style.display = 'flex';
}

document.querySelector('.close').addEventListener('click', () => {
  const modal = document.getElementById('gameModal');
  modal.classList.remove('show');
  modal.style.display = 'none';
});
