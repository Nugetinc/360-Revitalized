// === UI STYLE SWITCHER LOGIC (CSS loader) ===
document.addEventListener("DOMContentLoaded", function () {
  const styleSelector = document.getElementById("uiStyle");
  const themeLink = document.getElementById("themeStylesheet");

  function setUIStyle(style) {
    themeLink.href = `styles/${style}.css`;
    localStorage.setItem("uiStyle", style);
  }

  // Load saved UI style from localStorage
  const savedStyle = localStorage.getItem("uiStyle") || "metro";
  styleSelector.value = savedStyle;
  setUIStyle(savedStyle);

  styleSelector.addEventListener("change", (e) => {
    setUIStyle(e.target.value);
  });
});

// === GAME DATA LOADER ===
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
        const cover = game.front && game.front.trim() !== '' ? game.front : game.logo;

        const tile = document.createElement('div');
        tile.className = 'game-tile';
        tile.style.animationDelay = `${index * 50}ms`; // Staggered pop-in
        tile.innerHTML = `
          <img src="${cover}" alt="${game.name}">
          <h3>${game.name}</h3>
          <div class="platform">${game.titleid}</div>
        `;
        tile.addEventListener('click', () => showModal(game));
        container.appendChild(tile);
      });
  });
}

// === GAME MODAL ===
function showModal(game) {
  const modal = document.getElementById('gameModal');
  document.getElementById('gameDescription').innerText = game.notes;
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

// === MODAL CLOSE LOGIC ===
document.querySelector('.close').addEventListener('click', () => {
  const modal = document.getElementById('gameModal');
  modal.classList.remove('show');
  modal.style.display = 'none';
});

// === GITHUB STATS FETCH ===
const repoOwner = 'Nugetinc';
const repoName = '360-Revitalized';

async function fetchGitHubStats() {
  const commitsApi = `https://api.github.com/repos/${repoOwner}/${repoName}/commits`;

  try {
    const response = await fetch(commitsApi);
    const commits = await response.json();

    const latestCommit = commits[0];
    const latestMessage = latestCommit.commit.message;
    const latestAuthor = latestCommit.commit.author.name;
    const totalCommits = commits.length;

    document.getElementById('githubStats').innerHTML = `
      <p><strong>Latest Commit:</strong> ${latestMessage}</p>
      <p><strong>Committer:</strong> ${latestAuthor}</p>
      <p><strong>Total Commits:</strong> ${totalCommits}</p>
    `;
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    document.getElementById('githubStats').innerHTML = `
      <p>Failed to load GitHub stats. Nuget messed something up.</p>
    `;
  }
}

fetchGitHubStats();
