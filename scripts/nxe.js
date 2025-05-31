
document.addEventListener("DOMContentLoaded", function () {
  const styleSelector = document.getElementById("uiStyle");
  const themeLink = document.getElementById("themeStylesheet");

  function setUIStyle(style) {
    themeLink.href = `styles/${style}.css`;
    localStorage.setItem("uiStyle", style);
  }
});

fetch('games.json')
  .then(res => res.json())
  .then(data => {
    loadCategory(data.games, 'gameList');
    loadCategory(data.xbla, 'xblaList');
    loadCategory(data.dlcs, 'dlcList');
  });

function loadCategory(gamePaths, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  gamePaths.forEach((path, index) => {
    fetch(path)
      .then(res => res.json())
      .then(game => {
        const cover = game.front && game.front.trim() !== '' ? game.front : game.logo;

        const tile = document.createElement('div');
        tile.className = 'game-tile';
        tile.style.animationDelay = `${index * 50}ms`;
        tile.innerHTML = `
          <img src="${cover}" alt="${game.name}">
          <div class="game-info">
            <div class="game-title" title="${game.name}">${game.name}</div>
            <div class="game-id">${game.titleid}</div>
          </div>
        `;

        tile.addEventListener('click', () => showModal(game));
        container.appendChild(tile);
      })
      .catch(err => {
        console.error(`Failed to load game file at ${path}:`, err);
      });
  });
}
function showModal(game) {
  const modal = document.getElementById('gameModal');
  document.getElementById('gameDescription').innerText = game.notes || "No description available.";
  document.getElementById('gameLogo').src = game.logo || "";

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
  if (game.download) {
    downloadLink.href = game.download;
    downloadLink.textContent = 'Download';
    downloadLink.style.display = 'inline-block';
  } else {
    downloadLink.style.display = 'none';
  }

  modal.classList.add('show');
  modal.style.display = 'flex';
}

document.querySelector('.close').addEventListener('click', () => {
  const modal = document.getElementById('gameModal');
  modal.classList.remove('show');
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  const modal = document.getElementById('gameModal');
  if (e.target === modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
  }
});

const repoOwner = 'Nugetinc';
const repoName = '360-Revitalized';

async function fetchGitHubStats() {
  const commitsApi = `https://api.github.com/repos/${repoOwner}/${repoName}/commits`;

  try {
    const response = await fetch(commitsApi);
    const commits = await response.json();

    if (Array.isArray(commits) && commits.length > 0) {
      const latestCommit = commits[0];
      const latestMessage = latestCommit.commit.message;
      const latestAuthor = latestCommit.commit.author.name;
      const totalCommits = commits.length;

      document.getElementById('githubStats').innerHTML = `
        <p><strong>Latest Commit:</strong> ${latestMessage}</p>
        <p><strong>Committer:</strong> ${latestAuthor}</p>
        <p><strong>Total Commits:</strong> ${totalCommits}</p>
      `;
    } else {
      document.getElementById('githubStats').innerHTML = `<p>No commits found.</p>`;
    }
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    document.getElementById('githubStats').innerHTML = `
      <p>Failed to load GitHub stats. Nuget messed something up.</p>
    `;
  }
}

fetchGitHubStats();
