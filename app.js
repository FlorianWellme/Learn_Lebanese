// ---------------------------------------------------------
// Carnet Libanais — logique de l'application
// Toutes les données viennent de data.json : tu peux l'éditer
// librement pour ajouter tes propres mots, phrases, verbes...
// ---------------------------------------------------------

const state = {
  data: null,
  section: 'vocabulaire',
  order: [],
  index: 0,
  flipped: false,
};

const els = {
  cardZone: document.getElementById('cardZone'),
  sectionTitle: document.getElementById('sectionTitle'),
  counter: document.getElementById('counter'),
  answerInput: document.getElementById('answerInput'),
  writeZone: document.getElementById('writeZone'),
  revealBtn: document.getElementById('revealBtn'),
  skipBtn: document.getElementById('skipBtn'),
  shuffleBtn: document.getElementById('shuffleBtn'),
  navBtns: Array.from(document.querySelectorAll('.nav-btn')),
};

// ---------- Configuration de chaque section ----------
// Chaque section sait comment lire ses propres items et
// comment construire le recto / verso de la carte.
const sectionConfig = {
  vocabulaire: {
    title: 'Vocabulaire',
    getItems: (d) => d.vocabulaire,
    front: (item) => `
      <span class="card-eyebrow">Vocabulaire · ${item.categorie || ''}</span>
      <div class="card-main-fr">${item.fr}</div>
      <div class="card-sub">Comment le dit-on en libanais ?</div>
    `,
    back: (item) => `
      <span class="card-eyebrow">Réponse</span>
      <div class="card-main-lb">${item.lb_latin}</div>
      <div class="card-arabic">${item.lb_arabic || ''}</div>
    `,
  },
  phrases: {
    title: 'Phrases',
    getItems: (d) => d.phrases,
    front: (item) => `
      <span class="card-eyebrow">Phrase à traduire</span>
      <div class="card-main-fr">${item.fr}</div>
      <div class="card-sub">Essaie de l'écrire en libanais</div>
    `,
    back: (item) => `
      <span class="card-eyebrow">Réponse</span>
      <div class="card-main-lb">${item.lb_latin}</div>
      <div class="card-arabic">${item.lb_arabic || ''}</div>
    `,
  },
  verbes: {
    title: 'Verbes',
    getItems: (d) => d.verbes,
    front: (item) => `
      <span class="card-eyebrow">Verbe</span>
      <div class="card-main-fr">${item.infinitif_fr}</div>
      <div class="card-sub">Conjugue-le au présent</div>
    `,
    back: (item) => `
      <span class="card-eyebrow">Conjugaison</span>
      <div class="card-arabic" style="font-size:20px;margin-bottom:4px;">${item.infinitif_lb_arabic || ''}</div>
      ${item.conjugaison ? `
        <table class="conj-table">
          ${Object.entries(item.conjugaison).map(([pronom, forme]) => `
            <tr><td>${pronom}</td><td>${forme}</td></tr>
          `).join('')}
        </table>
      ` : `
        <p class="grammar-explain">Pas encore de conjugaison complète — retiens la forme de base : <strong>${item.infinitif_lb_latin}</strong></p>
      `}
      ${item.passe_exemple ? `
        <div class="card-sub" style="margin-top:8px;">Passé (exemple) : <strong style="color:var(--cedar);font-family:var(--font-mono);">${item.passe_exemple}</strong></div>
      ` : ''}
    `,
  },
  chiffres: {
    title: 'Chiffres',
    getItems: (d) => d.chiffres,
    front: (item) => `
      <span class="card-eyebrow">Chiffre</span>
      <div class="card-main-fr" style="font-size:40px;">${item.nombre}</div>
      <div class="card-sub">${item.fr}</div>
    `,
    back: (item) => `
      <span class="card-eyebrow">Réponse</span>
      <div class="card-main-lb">${item.lb_latin}</div>
      <div class="card-arabic">${item.lb_arabic || ''}</div>
    `,
  },
  grammaire: {
    title: 'Grammaire',
    getItems: (d) => d.grammaire,
    hideInput: true,
    front: (item) => `
      <span class="card-eyebrow">Notion</span>
      <div class="card-main-fr" style="font-size:21px;">${item.titre}</div>
      <div class="card-sub">Touche la carte pour voir l'explication</div>
    `,
    back: (item) => `
      <span class="card-eyebrow">Explication</span>
      <p class="grammar-explain">${item.explication_fr}</p>
      <div class="card-main-fr" style="font-size:16px;margin-top:6px;">${item.exemple_fr}</div>
      <div class="card-main-lb" style="font-size:19px;">${item.exemple_lb_latin}</div>
      <div class="card-arabic" style="font-size:20px;">${item.exemple_lb_arabic || ''}</div>
    `,
  },
};

// ---------- Utilitaires ----------
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function currentConfig() {
  return sectionConfig[state.section];
}

function currentItems() {
  return currentConfig().getItems(state.data);
}

function currentItem() {
  const items = currentItems();
  const orderIndex = state.order[state.index];
  return items[orderIndex];
}

// ---------- Rendu ----------
function render() {
  const cfg = currentConfig();
  const items = currentItems();
  const item = currentItem();

  els.sectionTitle.textContent = cfg.title;
  els.counter.textContent = `${state.index + 1} / ${items.length}`;
  els.writeZone.style.display = cfg.hideInput ? 'none' : 'flex';
  els.answerInput.value = '';

  els.cardZone.innerHTML = `
    <div class="card ${state.flipped ? 'flipped' : ''}" id="flipCard">
      <div class="card-face front">${cfg.front(item)}</div>
      <div class="card-face back">
        <span class="stamp">Vu ✓</span>
        ${cfg.back(item)}
      </div>
    </div>
  `;

  document.getElementById('flipCard').addEventListener('click', toggleFlip);
}

function toggleFlip() {
  state.flipped = !state.flipped;
  const card = document.getElementById('flipCard');
  if (card) card.classList.toggle('flipped', state.flipped);
}

function goToSection(sectionKey) {
  state.section = sectionKey;
  const items = currentItems();
  state.order = shuffle(items.map((_, i) => i));
  state.index = 0;
  state.flipped = false;

  els.navBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.section === sectionKey);
  });

  render();
}

function nextCard() {
  const items = currentItems();
  state.index = (state.index + 1) % items.length;
  state.flipped = false;
  render();
}

function reshuffleCurrent() {
  const items = currentItems();
  state.order = shuffle(items.map((_, i) => i));
  state.index = 0;
  state.flipped = false;
  render();
}

// ---------- Événements ----------
els.revealBtn.addEventListener('click', () => {
  state.flipped = true;
  const card = document.getElementById('flipCard');
  if (card) card.classList.add('flipped');
});

els.skipBtn.addEventListener('click', nextCard);

els.shuffleBtn.addEventListener('click', reshuffleCurrent);

els.navBtns.forEach((btn) => {
  btn.addEventListener('click', () => goToSection(btn.dataset.section));
});

els.answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    state.flipped = true;
    const card = document.getElementById('flipCard');
    if (card) card.classList.add('flipped');
  }
});

// ---------- Démarrage ----------
fetch('data.json')
  .then((res) => res.json())
  .then((data) => {
    state.data = data;
    goToSection('vocabulaire');
  })
  .catch((err) => {
    els.cardZone.innerHTML = `
      <div class="card">
        <div class="card-face front">
          <span class="card-eyebrow">Erreur</span>
          <div class="card-main-fr" style="font-size:16px;">Impossible de charger data.json. Vérifie que le fichier est bien présent à côté de index.html.</div>
        </div>
      </div>
    `;
    console.error(err);
  });
