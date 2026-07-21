// ---------------------------------------------------------
// Carnet Libanais — logique de l'application
// Toutes les données viennent de data.json : tu peux l'éditer
// librement pour ajouter tes propres mots, phrases, verbes...
// ---------------------------------------------------------

const EVAL_LIMIT = 30;

// Libellés + icônes pour chaque thème (déduits automatiquement de data.json,
// avec un joli nom si on en a un, sinon le nom brut).
const THEME_META = {
  transport:   { label: 'Transport',    icon: '🚗' },
  lieu:        { label: 'Lieux',        icon: '📍' },
  nourriture:  { label: 'Nourriture',   icon: '🍽️' },
  personnes:   { label: 'Personnes',    icon: '🧑' },
  nature:      { label: 'Nature',       icon: '🌿' },
  objet:       { label: 'Objets',       icon: '🎒' },
  'météo':     { label: 'Météo',        icon: '☁️' },
  expression:  { label: 'Expressions',  icon: '💬' },
  connecteur:  { label: 'Connecteurs',  icon: '🔗' },
  question:    { label: 'Questions',    icon: '❓' },
  famille:     { label: 'Famille',      icon: '👪' },
  direction:   { label: 'Direction',    icon: '🧭' },
  action:      { label: 'Actions',      icon: '🏃' },
  adjectifs:   { label: 'Opposés',      icon: '⚖️' },
  voyage:      { label: 'Voyage',       icon: '✈️' },
  quotidien:   { label: 'Quotidien',    icon: '🗓️' },
  salutations: { label: 'Salutations',  icon: '👋' },
};

function themeMeta(key) {
  return THEME_META[key] || { label: key.charAt(0).toUpperCase() + key.slice(1), icon: '🏷️' };
}

// ---------- Constructeurs recto / verso par type de carte ----------
const cardRenderers = {
  mot: {
    front: (item) => `
      <span class="card-eyebrow">${themeMeta(item.categorie).label}</span>
      <div class="card-main-fr">${item.fr}</div>
      <div class="card-sub">Comment le dit-on en libanais ?</div>
    `,
    back: (item) => `
      <span class="card-eyebrow">Réponse</span>
      <div class="card-main-lb">${item.lb_latin}</div>
      ${item.lb_arabic ? `<div class="card-arabic">${item.lb_arabic}</div>` : ''}
      ${item.contraire_fr ? `
        <div class="card-sub" style="margin-top:8px;">
          Contraire : <strong>${item.contraire_fr}</strong>
          <span style="font-family:var(--font-mono);color:var(--cedar);"> · ${item.contraire_lb || ''}</span>
        </div>
      ` : ''}
    `,
  },
  phrase: {
    front: (item) => `
      <span class="card-eyebrow">${themeMeta(item.theme).label}</span>
      <div class="card-main-fr">${item.fr}</div>
      <div class="card-sub">Essaie de l'écrire en libanais</div>
    `,
    back: (item) => `
      <span class="card-eyebrow">Réponse</span>
      <div class="card-main-lb">${item.lb_latin}</div>
      <div class="card-arabic">${item.lb_arabic || ''}</div>
    `,
  },
  verbe: {
    front: (item) => `
      <span class="card-eyebrow">${themeMeta(item.theme).label} · Verbe</span>
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
  chiffre: {
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

// ---------- État global ----------
const state = {
  data: null,
  navMode: 'theme',       // 'theme' | 'eval' | 'chiffres' | 'grammaire'
  selectedTheme: null,
  selectedType: null,     // 'mots' | 'phrases' | 'verbes' | 'mix'
  pool: [],                // [{ kind, item }]
  order: [],
  index: 0,
  flipped: false,
};

const els = {
  themePicker: document.getElementById('themePicker'),
  typePicker: document.getElementById('typePicker'),
  typePickerLabel: document.getElementById('typePickerLabel'),
  sessionView: document.getElementById('sessionView'),
  themeGrid: document.getElementById('themeGrid'),
  backToThemes: document.getElementById('backToThemes'),
  backToPicker: document.getElementById('backToPicker'),
  cardZone: document.getElementById('cardZone'),
  sectionTitle: document.getElementById('sectionTitle'),
  counter: document.getElementById('counter'),
  answerInput: document.getElementById('answerInput'),
  writeZone: document.getElementById('writeZone'),
  revealBtn: document.getElementById('revealBtn'),
  skipBtn: document.getElementById('skipBtn'),
  prevBtn: document.getElementById('prevBtn'),
  shuffleBtn: document.getElementById('shuffleBtn'),
  navBtns: Array.from(document.querySelectorAll('.nav-btn')),
  typeBtns: Array.from(document.querySelectorAll('.type-btn')),
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

function getAllThemes(data) {
  const set = new Set();
  data.vocabulaire.forEach((v) => v.categorie && set.add(v.categorie));
  data.phrases.forEach((p) => p.theme && set.add(p.theme));
  data.verbes.forEach((v) => v.theme && set.add(v.theme));
  return Array.from(set).sort();
}

function themeOf(entry) {
  if (entry.kind === 'mot') return entry.item.categorie;
  return entry.item.theme;
}

// Construit la liste d'items {kind, item} pour un type donné, sur TOUTES les données.
function allEntriesForType(data, type) {
  const mots = () => data.vocabulaire.map((item) => ({ kind: 'mot', item }));
  const phrases = () => data.phrases.map((item) => ({ kind: 'phrase', item }));
  const verbes = () => data.verbes.map((item) => ({ kind: 'verbe', item }));

  if (type === 'mots') return mots();
  if (type === 'phrases') return phrases();
  if (type === 'verbes') return verbes();
  return [...mots(), ...phrases(), ...verbes()]; // mix
}

function countForTheme(data, theme) {
  return allEntriesForType(data, 'mix').filter((e) => themeOf(e) === theme).length;
}

// ---------- Navigation entre écrans ----------
function showPicker(which) {
  [els.themePicker, els.typePicker, els.sessionView].forEach((el) => el.classList.remove('active'));
  which.classList.add('active');
}

function setActiveNav(mode) {
  els.navBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.mode === mode));
}

// ---------- Écran 1 : grille des thèmes ----------
function renderThemeGrid() {
  const themes = getAllThemes(state.data);
  els.themeGrid.innerHTML = themes.map((t) => {
    const meta = themeMeta(t);
    const count = countForTheme(state.data, t);
    return `
      <button class="theme-chip" data-theme="${t}">
        <span class="theme-icon">${meta.icon}</span>
        <span>${meta.label}</span>
        <span class="theme-count">${count} cartes</span>
      </button>
    `;
  }).join('');

  Array.from(els.themeGrid.querySelectorAll('.theme-chip')).forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedTheme = btn.dataset.theme;
      const meta = themeMeta(state.selectedTheme);
      els.typePickerLabel.textContent = `${meta.icon} ${meta.label} — que veux-tu réviser ?`;
      els.backToThemes.style.display = 'block';
      showPicker(els.typePicker);
    });
  });
}

// ---------- Écran 2 : choix du type ----------
els.typeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    state.selectedType = btn.dataset.type;

    let pool;
    let title;
    const meta = state.selectedTheme ? themeMeta(state.selectedTheme) : null;

    if (state.navMode === 'theme') {
      pool = allEntriesForType(state.data, state.selectedType).filter((e) => themeOf(e) === state.selectedTheme);
      title = `${meta.icon} ${meta.label}`;
    } else {
      // mode évaluation : toutes les thématiques mélangées, limité à EVAL_LIMIT
      pool = shuffle(allEntriesForType(state.data, state.selectedType)).slice(0, EVAL_LIMIT);
      title = '🎯 Évaluation';
    }

    if (pool.length === 0) {
      alert("Il n'y a pas encore de cartes pour cette combinaison. Essaie un autre type ou ajoute du contenu dans data.json !");
      return;
    }

    startSession(pool, title);
  });
});

els.backToThemes.addEventListener('click', () => {
  showPicker(els.themePicker);
});

els.backToPicker.addEventListener('click', () => {
  if (state.navMode === 'theme') {
    showPicker(els.typePicker);
  } else if (state.navMode === 'eval') {
    showPicker(els.typePicker);
  } else {
    showPicker(els.themePicker);
    setActiveNav('theme');
    state.navMode = 'theme';
  }
});

// ---------- Écran 3 : session de cartes ----------
function startSession(pool, title) {
  state.pool = pool;
  state.order = shuffle(pool.map((_, i) => i));
  state.index = 0;
  state.flipped = false;
  state.currentTitle = title;
  showPicker(els.sessionView);
  render();
}

function currentEntry() {
  const orderIndex = state.order[state.index];
  return state.pool[orderIndex];
}

function render() {
  const entry = currentEntry();
  const renderer = cardRenderers[entry.kind];

  els.sectionTitle.textContent = state.currentTitle;
  els.counter.textContent = `${state.index + 1} / ${state.pool.length}`;
  els.writeZone.style.display = renderer.hideInput ? 'none' : 'flex';
  els.answerInput.value = '';

  els.cardZone.innerHTML = `
    <div class="card ${state.flipped ? 'flipped' : ''}" id="flipCard">
      <div class="card-face front">${renderer.front(entry.item)}</div>
      <div class="card-face back">
        <span class="stamp">Vu ✓</span>
        ${renderer.back(entry.item)}
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

function stepCard(delta) {
  const len = state.pool.length;
  state.index = (state.index + delta + len) % len;
  state.flipped = false;
  render();
}

// ---------- Événements de session ----------
els.revealBtn.addEventListener('click', () => {
  state.flipped = true;
  const card = document.getElementById('flipCard');
  if (card) card.classList.add('flipped');
});

els.skipBtn.addEventListener('click', () => stepCard(1));
els.prevBtn.addEventListener('click', () => stepCard(-1));

els.shuffleBtn.addEventListener('click', () => {
  if (!state.pool.length) return;
  state.order = shuffle(state.pool.map((_, i) => i));
  state.index = 0;
  state.flipped = false;
  render();
});

els.answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    state.flipped = true;
    const card = document.getElementById('flipCard');
    if (card) card.classList.add('flipped');
  }
});

// ---------- Navigation du bas (bottom nav) ----------
els.navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    state.navMode = mode;
    setActiveNav(mode);

    if (mode === 'theme') {
      showPicker(els.themePicker);
    } else if (mode === 'eval') {
      state.selectedTheme = null;
      els.typePickerLabel.textContent = '🎯 Évaluation — mélange tous les thèmes (max 30 cartes)';
      els.backToThemes.style.display = 'none';
      showPicker(els.typePicker);
    } else if (mode === 'chiffres') {
      const pool = state.data.chiffres.map((item) => ({ kind: 'chiffre', item }));
      startSession(pool, '🔢 Chiffres');
    } else if (mode === 'grammaire') {
      const pool = state.data.grammaire.map((item) => ({ kind: 'grammaire', item }));
      startSession(pool, '📜 Grammaire');
    }
  });
});

// ---------- Démarrage ----------
fetch('data.json')
  .then((res) => res.json())
  .then((data) => {
    state.data = data;
    renderThemeGrid();
    showPicker(els.themePicker);
  })
  .catch((err) => {
    els.themePicker.classList.add('active');
    els.themeGrid.innerHTML = `<p style="color:var(--text-light);">Impossible de charger data.json. Vérifie que le fichier est bien présent à côté de index.html.</p>`;
    console.error(err);
  });
