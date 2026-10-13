'use strict';
// ---------------------------------------------------------
// Carnet Libanais — v2 (apprentissage rapide)
// Les données viennent de data.json (inchangé).
// ---------------------------------------------------------

const DAILY_SIZE = 15, EXERCISE_SIZE = 15, THEME_SIZE = 20, EVAL_SIZE = 30;

const THEME_META = {
  transport: { label: 'Transport', icon: '🚗' }, lieu: { label: 'Lieux', icon: '📍' },
  nourriture: { label: 'Nourriture', icon: '🍽️' }, personnes: { label: 'Personnes', icon: '🧑' },
  nature: { label: 'Nature', icon: '🌿' }, objet: { label: 'Objets', icon: '🎒' },
  'météo': { label: 'Météo', icon: '☁️' }, expression: { label: 'Expressions', icon: '💬' },
  connecteur: { label: 'Connecteurs', icon: '🔗' }, question: { label: 'Questions', icon: '❓' },
  famille: { label: 'Famille', icon: '👪' }, direction: { label: 'Direction', icon: '🧭' },
  action: { label: 'Actions', icon: '🏃' }, adjectifs: { label: 'Adjectifs', icon: '⚖️' },
  voyage: { label: 'Voyage', icon: '✈️' }, quotidien: { label: 'Quotidien', icon: '🗓️' },
  salutations: { label: 'Salutations', icon: '👋' }, temps: { label: 'Temps & jours', icon: '📅' },
  adverbes: { label: 'Adverbes', icon: '⏱️' }, corps: { label: 'Corps humain', icon: '🫀' },
  chiffres: { label: 'Chiffres', icon: '🔢' },
};
const themeMeta = (k) => THEME_META[k] || { label: k.charAt(0).toUpperCase() + k.slice(1), icon: '🏷️' };

const EX_META = {
  decouverte: { label: 'Découverte', icon: '🌱' }, ecrire: { label: 'Écrire', icon: '✍️' },
  inverse: { label: 'Sens inverse', icon: '🔁' }, qcm: { label: 'QCM éclair', icon: '⚡' },
  qcm_inv: { label: 'QCM éclair', icon: '⚡' }, verbe: { label: 'Conjugaison', icon: '⚙️' },
  chiffre_w: { label: 'Chiffres', icon: '🔢' }, chiffre_q: { label: 'Chiffres', icon: '🔢' },
  ordre: { label: 'Remets dans l’ordre', icon: '🧩' }, trous: { label: 'Complète', icon: '🕳️' },
};

// ---------- Utilitaires ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* ignore */ } };
function weighted(pairs) {
  const tot = pairs.reduce((s, p) => s + p[1], 0); let r = Math.random() * tot;
  for (const [v, w] of pairs) { if ((r -= w) <= 0) return v; }
  return pairs[0][0];
}

// ---------- Données ----------
const CARDS = { mots: [], phrases: [], verbes: [], chiffres: [] };
const allCards = () => [...CARDS.mots, ...CARDS.phrases, ...CARDS.verbes];

function buildCards(d) {
  CARDS.mots = d.vocabulaire.map((v) => ({ kind: 'mot', id: v.id, fr: v.fr, lb: v.lb_latin, ar: v.lb_arabic || '', theme: v.categorie || 'autre', cfr: v.contraire_fr || '', clb: v.contraire_lb || '' }));
  CARDS.phrases = d.phrases.map((p) => ({ kind: 'phrase', id: p.id, fr: p.fr, lb: p.lb_latin, ar: p.lb_arabic || '', theme: p.theme || 'expression' }));
  CARDS.verbes = d.verbes.map((v) => ({ kind: 'verbe', id: v.id, fr: v.infinitif_fr, lb: v.infinitif_lb_latin, ar: v.infinitif_lb_arabic || '', theme: v.theme || 'quotidien', conj: v.conjugaison || null, passe: v.passe_exemple || '' }));
  CARDS.chiffres = d.chiffres.map((n) => ({ kind: 'chiffre', id: n.id, fr: n.fr, lb: n.lb_latin, ar: n.lb_arabic || '', n: n.nombre, theme: 'chiffres' }));
}

// ---------- Comparaison tolérante des réponses ----------
function strip(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function key(s) {
  s = strip(String(s).toLowerCase()).replace(/[’`´ʿʾ]/g, "'");
  s = s.replace(/\(.*?\)/g, '').replace(/[?!.,;:«»"…]/g, ' ').replace(/'/g, '');
  s = s.replace(/ou|oo|uu/g, 'u').replace(/ee|ii|ei/g, 'i').replace(/aa/g, 'a').replace(/ch/g, 'sh');
  s = s.replace(/e/g, 'i').replace(/o/g, 'u').replace(/[\s\-_]+/g, '').replace(/(.)\1+/g, '$1');
  return s;
}
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
const splitAlt = (s) => String(s).split(/\s+\/\s+/).map((x) => x.trim()).filter(Boolean);
function judge(input, answers) {
  const k = key(input); if (!k) return 'wrong';
  let near = false;
  for (const a of answers) {
    const ka = key(a); if (!ka) continue;
    if (k === ka) return 'exact';
    const tol = ka.length <= 4 ? 0 : ka.length <= 9 ? 1 : Math.floor(ka.length * 0.12);
    if (lev(k, ka) <= tol) near = true;
  }
  return near ? 'near' : 'wrong';
}
// Toutes les réponses acceptables : celles de la carte + celles des cartes qui ont le même mot français
function answersFor(card) {
  const fr = card.fr.trim().toLowerCase(); const out = [];
  const pool = card.kind === 'chiffre' ? CARDS.chiffres : card.kind === 'phrase' ? CARDS.phrases : card.kind === 'verbe' ? CARDS.verbes : CARDS.mots;
  pool.filter((c) => c.fr.trim().toLowerCase() === fr).forEach((c) => splitAlt(c.lb).forEach((x) => out.push(x)));
  return out.length ? out : splitAlt(card.lb);
}

// ---------- Création des exercices ----------
const tokens = (s) => s.trim().split(/\s+/);
const canReorder = (c) => c.kind === 'phrase' && !/[\/…]|\.\.\./.test(c.lb) && tokens(c.lb).length >= 3 && tokens(c.lb).length <= 9;
const wordKey = (t) => key(t);

function forcedType(card, ex) {
  switch (ex) {
    case 'decouverte': return 'decouverte';
    case 'inverse': return 'inverse';
    case 'qcm': return card.kind === 'chiffre' ? 'chiffre_q' : (Math.random() < 0.5 ? 'qcm' : 'qcm_inv');
    case 'verbes': return card.conj ? 'verbe' : 'ecrire';
    case 'chiffres': return Math.random() < 0.5 ? 'chiffre_w' : 'chiffre_q';
    case 'phrases': return canReorder(card) ? (Math.random() < 0.55 ? 'ordre' : 'trous') : 'ecrire';
  }
  return 'ecrire';
}

function pickType(card, ctx) {
  if (ctx.retry) {
    if (card.kind === 'verbe') return card.conj ? 'verbe' : 'ecrire';
    if (card.kind === 'chiffre') return 'chiffre_w';
    if (card.kind === 'phrase') return canReorder(card) ? 'trous' : 'ecrire';
    return Math.random() < 0.5 ? 'qcm' : 'ecrire';
  }
  if (ctx.forced) return forcedType(card, ctx.forced);
  const ev = ctx.mode === 'eval';
  if (card.kind === 'chiffre') return Math.random() < 0.5 ? 'chiffre_w' : 'chiffre_q';
  if (card.kind === 'verbe') return card.conj ? (!ev && Math.random() < 0.15 ? 'decouverte' : 'verbe') : (ev ? 'ecrire' : weighted([['decouverte', 0.4], ['ecrire', 0.6]]));
  if (card.kind === 'phrase') {
    const o = [['ecrire', 0.35]];
    if (canReorder(card)) o.push(['ordre', 0.35], ['trous', 0.3]);
    if (!ev) o.push(['decouverte', 0.15]);
    return weighted(o);
  }
  return ev ? weighted([['ecrire', 0.5], ['qcm', 0.3], ['qcm_inv', 0.2]])
            : weighted([['decouverte', 0.2], ['qcm', 0.22], ['qcm_inv', 0.1], ['ecrire', 0.28], ['inverse', 0.2]]);
}

let taskSeq = 0;
function makeTask(card, ctx) {
  const ex = pickType(card, ctx);
  const t = { id: ++taskSeq, ex, card, retry: !!ctx.retry };
  if (ex === 'verbe') {
    const e = ctx.extra || (() => { const [label, answer] = sample(Object.entries(card.conj), 1)[0]; return { label, answer }; })();
    t.extra = e;
  }
  return t;
}

// ---------- État de session ----------
let S = null;
let swipe = null;

function startSession({ title, cards, mode, forced }) {
  if (!cards.length) return;
  S = { title, mode, forced, cards, tasks: cards.map((c) => makeTask(c, { mode, forced })), i: 0, done: 0, missed: new Map(), requeued: new Set() };
  go('session');
  history.pushState({ session: true }, '');
  renderTask();
}

function updateTop() {
  $('#counter').textContent = `${Math.min(S.i + 1, S.tasks.length)} / ${S.tasks.length}`;
  $('#bar').style.width = `${(S.done / S.tasks.length) * 100}%`;
}

function finish(ok) {
  const t = S.tasks[S.i]; S.done++;
  swipe = null;
  if (!ok) {
    S.missed.set(t.card.id, t.card);
    if (!t.retry && !S.requeued.has(t.card.id)) {
      S.requeued.add(t.card.id);
      S.tasks.splice(Math.min(S.tasks.length, S.i + 5), 0, makeTask(t.card, { retry: true, extra: t.extra }));
    }
  }
  buzz(ok ? 12 : 25);
  S.i++;
  if (S.i >= S.tasks.length) { $('#bar').style.width = '100%'; setTimeout(showSummary, 200); return; }
  renderTask();
}

function renderTask() {
  const t = S.tasks[S.i]; swipe = null; updateTop();
  const card = $('#taskCard');
  card.className = 'task-card enter'; card.style.transform = '';
  RENDER[t.ex](t, card);
  requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('enter')));
}

// ---------- Pied de page (boutons) ----------
let footHandlers = [];
function setFooter(btns) {
  footHandlers = btns.map((b) => b.on);
  $('#footer').innerHTML = btns.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}" ${b.disabled ? 'disabled' : ''}>${b.label}</button>`).join('');
}
function setHint(text) { footHandlers = []; $('#footer').innerHTML = `<div class="foot-hint">${text}</div>`; }
$('#footer').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]'); if (!b || b.disabled) return;
  const h = footHandlers[+b.dataset.i]; if (h) h();
});

function setJudge(pref, rightLabel) {
  setFooter([
    { label: 'À revoir', cls: pref === 'bad' ? 'btn-bad' : 'btn-ghost', on: () => finish(false) },
    { label: rightLabel || 'Acquis ✓', cls: pref === 'ok' ? 'btn-ok' : 'btn-ghost', on: () => finish(true) },
  ]);
  swipe = { left: () => finish(false), right: () => finish(true) };
}

// Glisser : droite = acquis, gauche = à revoir
(function initSwipe() {
  const card = $('#taskCard'); let x0 = null, dx = 0;
  card.addEventListener('touchstart', (e) => { if (!swipe) return; x0 = e.touches[0].clientX; dx = 0; card.style.transition = 'none'; }, { passive: true });
  card.addEventListener('touchmove', (e) => {
    if (x0 === null) return; dx = e.touches[0].clientX - x0;
    card.style.transform = `translateX(${dx}px) rotate(${dx / 50}deg)`;
    card.classList.toggle('lean-r', dx > 40); card.classList.toggle('lean-l', dx < -40);
  }, { passive: true });
  card.addEventListener('touchend', () => {
    if (x0 === null) return; const s = swipe; x0 = null;
    card.style.transition = ''; card.classList.remove('lean-r', 'lean-l');
    if (s && dx > 90) { card.style.transform = 'translateX(120%)'; setTimeout(s.right, 120); }
    else if (s && dx < -90) { card.style.transform = 'translateX(-120%)'; setTimeout(s.left, 120); }
    else card.style.transform = '';
    dx = 0;
  });
})();

// ---------- Gabarits ----------
const head = (t) => `<div class="eyebrow"><span>${EX_META[t.ex].icon} ${EX_META[t.ex].label}</span><span>${esc(themeMeta(t.card.theme).label)}</span></div>`;

function extrasHtml(card, extra) {
  let h = '';
  if (card.kind === 'mot' && card.cfr) h += `<div class="ans-note">Contraire : <b>${esc(card.cfr)}</b> · <span class="mono">${esc(card.clb)}</span></div>`;
  if (card.kind === 'verbe') {
    if (card.conj) h += `<table class="mini-conj">${Object.entries(card.conj).map(([k, v]) => `<tr class="${extra && extra.label === k ? 'me' : ''}"><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>`;
    if (card.passe) h += `<div class="ans-note">Passé (exemple) : <span class="mono">${esc(card.passe)}</span></div>`;
  }
  return h;
}
function answerBox(lb, ar, card, extra, showFr) {
  return `<div class="ans">${showFr ? `<div class="ans-fr">${esc(card.fr)}</div>` : ''}<div class="ans-lb">${esc(lb)}</div>${ar ? `<div class="ans-ar">${esc(ar)}</div>` : ''}${extrasHtml(card, extra)}</div>`;
}

// ---------- Exercices à écrire ----------
function writeTask(t, el, cfg) {
  el.innerHTML = `${head(t)}<div class="prompt">${cfg.prompt}</div>
    <div class="write">
      <input id="inp" class="input" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Écris en libanais">
      <div class="chars">${['3', '7', "'", 'é'].map((c) => `<button type="button" class="char" data-c="${c}">${c}</button>`).join('')}</div>
    </div><div id="fb"></div>`;
  const inp = $('#inp', el);
  $$('.char', el).forEach((b) => b.addEventListener('mousedown', (e) => e.preventDefault()));
  $$('.char', el).forEach((b) => b.addEventListener('click', () => {
    const s = inp.selectionStart ?? inp.value.length, e2 = inp.selectionEnd ?? s;
    inp.value = inp.value.slice(0, s) + b.dataset.c + inp.value.slice(e2); inp.focus(); inp.setSelectionRange(s + 1, s + 1);
  }));
  const show = (verdict, typed) => {
    inp.disabled = true; $('.chars', el).style.display = 'none';
    const txt = { exact: '✓ Correct', near: '≈ Presque — regarde l’orthographe', bad: typed ? '✗ À revoir' : 'Voilà la réponse' }[verdict];
    $('#fb', el).innerHTML = `<div class="verdict ${verdict === 'bad' && !typed ? 'neutral' : verdict}">${txt}</div>
      ${typed && verdict === 'bad' ? `<div class="typed">Tu as écrit : <s>${esc(typed)}</s></div>` : ''}
      ${answerBox(cfg.display, cfg.ar, t.card, t.extra, cfg.showFr)}`;
    if (verdict === 'bad') { setJudge('bad', 'J’avais bon ✓'); buzz(25); } else { setJudge('ok'); buzz(12); }
  };
  const validate = () => {
    const v = inp.value.trim();
    if (!v) { inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); return; }
    const r = judge(v, cfg.answers); show(r === 'wrong' ? 'bad' : r, v);
  };
  setFooter([{ label: 'Je ne sais pas', cls: 'btn-ghost', on: () => show('bad', '') }, { label: 'Valider', cls: 'btn-primary', on: validate }]);
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); validate(); } });
  setTimeout(() => inp.focus(), 60);
}

// ---------- Exercices à choisir ----------
function distract(card, field, n) {
  const pool = card.kind === 'chiffre' ? CARDS.chiffres : card.kind === 'phrase' ? CARDS.phrases : CARDS.mots;
  const other = field === 'lb' ? 'fr' : 'lb';
  const cands = shuffle(pool.filter((c) => c.id !== card.id && c[other] !== card[other] && c.theme === card.theme)).concat(shuffle(pool.filter((c) => c.id !== card.id && c[other] !== card[other])));
  const out = [], seen = new Set([String(card[field]).toLowerCase()]);
  for (const c of cands) { const k = String(c[field]).toLowerCase(); if (seen.has(k)) continue; seen.add(k); out.push(c[field]); if (out.length >= n) break; }
  return out;
}

function choiceTask(t, el, cfg) {
  el.innerHTML = `${head(t)}<div class="prompt">${cfg.prompt}</div>
    <div class="options">${shuffle(cfg.options).map((o, i) => `<button class="opt ${cfg.cls || ''}" data-ok="${o.ok ? 1 : 0}">${esc(o.text)}</button>`).join('')}</div>`;
  const btns = $$('.opt', el); let locked = false;
  setHint('Touche la bonne réponse');
  btns.forEach((b) => b.addEventListener('click', () => {
    if (locked) return; locked = true;
    const ok = b.dataset.ok === '1';
    btns.forEach((x) => { x.disabled = true; if (x.dataset.ok === '1') x.classList.add('correct'); });
    if (cfg.reveal) cfg.reveal();
    if (ok) { buzz(12); setTimeout(() => finish(true), 750); }
    else {
      b.classList.add('wrong'); buzz(25);
      const extra = cfg.after ? cfg.after() : '';
      if (extra) $('.options', el).insertAdjacentHTML('beforebegin', extra);
      setFooter([{ label: 'Suivant →', cls: 'btn-primary', on: () => finish(false) }]);
    }
  }));
}

// ---------- Rendu par type ----------
const RENDER = {
  decouverte(t, el) {
    const c = t.card;
    if (t.phase === 'test') return renderTest(t, el);
    el.innerHTML = `${head(t)}<div class="tag-new">Nouveau</div>
      <div class="prompt"><div class="prompt-fr">${esc(c.fr)}</div></div>
      ${answerBox(c.lb, c.ar, c, null, false)}`;
    setFooter([{ label: 'Me tester →', cls: 'btn-primary', on: () => { t.phase = 'test'; renderTask(); } }]);
  },
  ecrire(t, el) { renderTest(t, el); },
  verbe(t, el) {
    const c = t.card, e = t.extra;
    writeTask(t, el, { prompt: `<span class="chip">${esc(e.label)}</span><div class="prompt-fr">${esc(c.fr)}</div>`, answers: splitAlt(e.answer), display: e.answer, ar: '', showFr: false });
  },
  chiffre_w(t, el) {
    const c = t.card;
    writeTask(t, el, { prompt: `<div class="prompt-big">${esc(c.n)}</div><div class="prompt-sub">${esc(c.fr)}</div>`, answers: answersFor(c), display: c.lb, ar: c.ar, showFr: false });
  },
  inverse(t, el) {
    const c = t.card;
    el.innerHTML = `${head(t)}<div class="prompt"><div class="prompt-lb">${esc(c.lb)}</div>${c.ar ? `<div class="prompt-ar">${esc(c.ar)}</div>` : ''}<div class="prompt-sub">Ça veut dire quoi en français ?</div></div><div id="fb"></div>`;
    setFooter([{ label: 'Voir la traduction', cls: 'btn-primary', on: () => {
      $('#fb', el).innerHTML = `<div class="ans"><div class="ans-fr">${esc(c.fr)}</div>${extrasHtml(c)}</div>`;
      setJudge('neutral');
    } }]);
  },
  qcm(t, el) {
    const c = t.card;
    choiceTask(t, el, {
      prompt: `<div class="prompt-fr">${esc(c.fr)}</div><div class="prompt-sub">En libanais ?</div>`, cls: 'mono',
      options: [{ text: c.lb, ok: true }].concat(distract(c, 'lb', 3).map((x) => ({ text: x, ok: false }))),
    });
  },
  qcm_inv(t, el) {
    const c = t.card;
    choiceTask(t, el, {
      prompt: `<div class="prompt-lb">${esc(c.lb)}</div>${c.ar ? `<div class="prompt-ar">${esc(c.ar)}</div>` : ''}<div class="prompt-sub">En français ?</div>`,
      options: [{ text: c.fr, ok: true }].concat(distract(c, 'fr', 3).map((x) => ({ text: x, ok: false }))),
    });
  },
  chiffre_q(t, el) {
    const c = t.card;
    const others = shuffle(CARDS.chiffres.filter((x) => x.n !== c.n)).slice(0, 3).map((x) => ({ text: String(x.n), ok: false }));
    choiceTask(t, el, { prompt: `<div class="prompt-lb">${esc(c.lb)}</div><div class="prompt-sub">C’est quel chiffre ?</div>`, cls: 'digit', options: [{ text: String(c.n), ok: true }].concat(others) });
  },
  ordre(t, el) {
    const c = t.card, toks = tokens(c.lb);
    let bank = shuffle(toks.map((w, i) => ({ w, i })));
    if (toks.length > 1) { let tries = 0; while (bank.map((b) => b.w).join(' ') === toks.join(' ') && tries++ < 8) bank = shuffle(bank); }
    let placed = [], done = false;
    el.innerHTML = `${head(t)}<div class="prompt"><div class="prompt-fr" style="font-size:26px">${esc(c.fr)}</div><div class="prompt-sub">Remets les mots dans l’ordre</div></div>
      <div id="slots" class="slots"></div><div id="fb"></div><div id="bank" class="bank"></div>`;
    const draw = () => {
      $('#slots', el).innerHTML = placed.map((p) => `<button class="tok" data-i="${p.i}" data-from="s">${esc(p.w)}</button>`).join('');
      $('#bank', el).innerHTML = bank.map((p) => `<button class="tok" data-i="${p.i}" data-from="b">${esc(p.w)}</button>`).join('');
      if (!done) setFooter([{ label: 'Je ne sais pas', cls: 'btn-ghost', on: () => reveal(false) }, { label: 'Valider', cls: 'btn-primary', disabled: bank.length > 0, on: validate }]);
    };
    const reveal = (ok, typed) => {
      done = true; $$('.tok', el).forEach((b) => (b.disabled = true));
      $('#fb', el).innerHTML = `<div class="verdict ${ok ? 'ok' : 'bad'}">${ok ? '✓ Correct' : '✗ À revoir'}</div>${answerBox(c.lb, c.ar, c, null, false)}`;
      setJudge(ok ? 'ok' : 'bad', ok ? 'Acquis ✓' : 'J’avais bon ✓');
      buzz(ok ? 12 : 25);
    };
    const validate = () => reveal(placed.map((p) => p.w).join(' ') === toks.join(' '));
    el.addEventListener('click', function onTap(e) {
      if (S.tasks[S.i] !== t) { el.removeEventListener('click', onTap); return; }
      const b = e.target.closest('.tok'); if (!b || done) return;
      const i = +b.dataset.i;
      if (b.dataset.from === 'b') { const k = bank.findIndex((x) => x.i === i); placed.push(bank.splice(k, 1)[0]); }
      else { const k = placed.findIndex((x) => x.i === i); bank.push(placed.splice(k, 1)[0]); }
      draw();
    });
    draw();
  },
  trous(t, el) {
    const c = t.card, toks = tokens(c.lb);
    const idxs = toks.map((w, i) => ({ w, i })).filter((x) => strip(x.w).replace(/[^a-z0-9]/gi, '').length >= 3);
    const pick = (idxs.length ? sample(idxs, 1)[0] : { w: toks[toks.length - 1], i: toks.length - 1 });
    const word = pick.w;
    const pool = [].concat(...CARDS.phrases.filter((p) => p.id !== c.id).map((p) => tokens(p.lb)));
    const seen = new Set([wordKey(word)]); const dis = [];
    for (const w of shuffle(pool)) { const k = wordKey(w); if (!k || seen.has(k) || w.length < 2) continue; seen.add(k); dis.push(w); if (dis.length >= 3) break; }
    const sentence = (fill) => toks.map((w, i) => i === pick.i ? `<span class="blank">${fill ? esc(w) : '&nbsp;&nbsp;&nbsp;'}</span>` : esc(w)).join(' ');
    choiceTask(t, el, {
      prompt: `<div class="prompt-fr" style="font-size:24px">${esc(c.fr)}</div><div class="cloze" id="cloze">${sentence(false)}</div>`, cls: 'mono',
      options: [{ text: word, ok: true }].concat(dis.map((x) => ({ text: x, ok: false }))),
      reveal: () => { const z = $('#cloze', el); if (z) z.innerHTML = sentence(true); },
    });
  },
};

function renderTest(t, el) {
  const c = t.card;
  const prompt = `<div class="prompt-fr" ${c.kind === 'phrase' ? 'style="font-size:26px"' : ''}>${esc(c.fr)}</div><div class="prompt-sub">${c.kind === 'phrase' ? 'Écris la phrase en libanais' : 'En libanais ?'}</div>`;
  writeTask(t, el, { prompt, answers: answersFor(c), display: c.lb, ar: c.ar, showFr: false });
}

// ---------- Résumé ----------
function showSummary() {
  const total = S.cards.length, missed = [...S.missed.values()], ok = total - missed.length;
  const pct = Math.round((ok / total) * 100);
  const verdict = pct >= 80 ? 'Solide 💪' : pct >= 50 ? 'Ça progresse 🌱' : 'On y retourne 🔁';
  go('summary');
  $('#summaryBody').innerHTML = `<div class="sum">
    <div class="ring" style="--p:${pct}"><div>${pct}%</div></div>
    <h2>${verdict}</h2>
    <p>${ok} acquis du premier coup sur ${total}.</p>
    ${missed.length ? `<div class="missed"><h3>À revoir (${missed.length})</h3>${missed.map((c) => `<div class="m-item"><span>${esc(c.fr)}</span><span>${esc(c.lb)}</span></div>`).join('')}</div>` : ''}
    <div class="sum-actions">
      ${missed.length ? '<button id="redo" class="btn btn-primary btn-xl">Refaire les ratés</button>' : ''}
      <button id="again" class="btn ${missed.length ? 'btn-ghost' : 'btn-primary'} btn-xl">Nouvelle session</button>
      <button id="toHome" class="btn btn-ghost btn-xl">Accueil</button>
    </div></div>`;
  const prev = S;
  if ($('#redo')) $('#redo').onclick = () => startSession({ title: 'Revoir les ratés', cards: shuffle(missed), mode: 'retry', forced: null });
  $('#again').onclick = () => (prev.mode === 'daily' ? startDaily() : go('home'));
  $('#toHome').onclick = () => go('home');
}

// ---------- Navigation ----------
function go(name) {
  $$('.screen').forEach((s) => s.classList.toggle('active', s.id === `screen-${name}`));
  $('#tabbar').classList.toggle('hidden', name === 'session' || name === 'summary');
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.go === name));
  if (name !== 'session') window.scrollTo(0, 0);
}
$$('.tab').forEach((t) => t.addEventListener('click', () => go(t.dataset.go)));

// ---------- Panneau ----------
function openSheet(title, html, bind) {
  $('#sheetTitle').textContent = title; $('#sheetBody').innerHTML = html;
  $('#sheet').classList.add('open'); $('#sheet').setAttribute('aria-hidden', 'false');
  if (bind) bind($('#sheetBody'));
}
function closeSheet() { $('#sheet').classList.remove('open'); $('#sheet').setAttribute('aria-hidden', 'true'); }
$('#sheetBackdrop').addEventListener('click', closeSheet);

// ---------- Lancement des sessions ----------
function startDaily() {
  const parts = [[CARDS.mots, 6], [CARDS.phrases, 4], [CARDS.verbes, 3], [CARDS.chiffres, 2]];
  const cards = shuffle(parts.flatMap(([a, n]) => sample(a, Math.min(n, a.length))));
  startSession({ title: 'Session du jour', cards, mode: 'daily' });
}
$('#startDaily').addEventListener('click', startDaily);

const typePool = (type) => type === 'mots' ? CARDS.mots : type === 'phrases' ? CARDS.phrases : type === 'verbes' ? CARDS.verbes : allCards();
const TYPE_LABEL = { mots: '📖 Mots', phrases: '💬 Phrases', verbes: '⚙️ Verbes', mix: '🔀 Mix' };

$('#openEval').addEventListener('click', () => {
  openSheet('Évaluation', `<p class="sheet-note">${EVAL_SIZE} cartes tirées dans tous les thèmes. Pas de réponse affichée avant ta tentative.</p>
    <div class="sheet-list">${Object.keys(TYPE_LABEL).map((k) => `<button class="sheet-opt" data-type="${k}"><span class="grow">${TYPE_LABEL[k]}</span><small>${typePool(k).length}</small></button>`).join('')}</div>`,
  (b) => $$('.sheet-opt', b).forEach((o) => o.addEventListener('click', () => {
    closeSheet(); startSession({ title: 'Évaluation', cards: sample(typePool(o.dataset.type), EVAL_SIZE), mode: 'eval' });
  })));
});

// ---------- Exercices ----------
const EXERCISES = [
  { id: 'decouverte', icon: '🌱', name: 'Découverte', desc: 'Je vois la réponse, puis on me la redemande', pool: () => allCards() },
  { id: 'inverse', icon: '🔁', name: 'Sens inverse', desc: 'Du libanais vers le français', pool: () => [...CARDS.mots, ...CARDS.phrases] },
  { id: 'qcm', icon: '⚡', name: 'QCM éclair', desc: '4 choix, réponse immédiate', pool: () => [...CARDS.mots, ...CARDS.phrases, ...CARDS.chiffres] },
  { id: 'verbes', icon: '⚙️', name: 'Verbes', desc: 'Un pronom, un verbe : je conjugue', pool: () => CARDS.verbes },
  { id: 'chiffres', icon: '🔢', name: 'Chiffres', desc: 'Nombre vers mot, et l’inverse', pool: () => CARDS.chiffres },
  { id: 'phrases', icon: '🧩', name: 'Phrases', desc: 'Mots dans l’ordre et phrases à trous', pool: () => CARDS.phrases },
];

function renderExercises() {
  $('#exGrid').innerHTML = EXERCISES.map((e) => `<button class="tile" data-ex="${e.id}"><span class="t-icon">${e.icon}</span><strong>${e.name}</strong><small>${e.desc}</small></button>`).join('');
  $$('.tile').forEach((tl) => tl.addEventListener('click', () => {
    const ex = EXERCISES.find((x) => x.id === tl.dataset.ex), pool = ex.pool();
    const themes = {}; pool.forEach((c) => { themes[c.theme] = (themes[c.theme] || 0) + 1; });
    const keys = Object.keys(themes).sort();
    const list = [`<button class="sheet-opt" data-theme="*"><span class="grow">🌍 Tous les thèmes</span><small>${pool.length}</small></button>`]
      .concat(keys.length > 1 ? keys.map((k) => `<button class="sheet-opt" data-theme="${esc(k)}"><span class="grow">${themeMeta(k).icon} ${esc(themeMeta(k).label)}</span><small>${themes[k]}</small></button>`) : []);
    openSheet(`${ex.icon} ${ex.name}`, `<p class="sheet-note">${EXERCISE_SIZE} cartes. Quel thème ?</p><div class="sheet-list">${list.join('')}</div>`,
      (b) => $$('.sheet-opt', b).forEach((o) => o.addEventListener('click', () => {
        const th = o.dataset.theme; closeSheet();
        const cards = sample(th === '*' ? pool : pool.filter((c) => c.theme === th), EXERCISE_SIZE);
        startSession({ title: ex.name, cards, mode: 'exercise', forced: ex.id });
      })));
  }));
}

// ---------- Thèmes ----------
function renderThemes() {
  const counts = {}; allCards().forEach((c) => { counts[c.theme] = (counts[c.theme] || 0) + 1; });
  $('#themeGrid').innerHTML = Object.keys(counts).sort().map((k) => `<button class="theme-chip" data-theme="${esc(k)}"><span class="ti">${themeMeta(k).icon}</span>${esc(themeMeta(k).label)}<small>${counts[k]} cartes</small></button>`).join('');
  $$('.theme-chip').forEach((chip) => chip.addEventListener('click', () => {
    const th = chip.dataset.theme, m = themeMeta(th);
    const n = (type) => typePool(type).filter((c) => c.theme === th).length;
    openSheet(`${m.icon} ${m.label}`, `<p class="sheet-note">Session de ${THEME_SIZE} cartes maximum, avec des exercices variés.</p>
      <div class="sheet-list">${Object.keys(TYPE_LABEL).map((k) => `<button class="sheet-opt" data-type="${k}" ${n(k) ? '' : 'disabled'}><span class="grow">${TYPE_LABEL[k]}</span><small>${n(k)}</small></button>`).join('')}</div>`,
    (b) => $$('.sheet-opt', b).forEach((o) => o.addEventListener('click', () => {
      closeSheet(); const cards = sample(typePool(o.dataset.type).filter((c) => c.theme === th), THEME_SIZE);
      startSession({ title: m.label, cards, mode: 'daily' });
    })));
  }));
}

// ---------- Grammaire ----------
function renderGrammar(list) {
  $('#grammarList').innerHTML = list.map((g) => `<details><summary>${esc(g.titre)}</summary><div class="g-body"><p>${esc(g.explication_fr)}</p>
    <div class="g-ex"><div>${esc(g.exemple_fr)}</div><div class="lb">${esc(g.exemple_lb_latin)}</div>${g.exemple_lb_arabic ? `<div class="ar">${esc(g.exemple_lb_arabic)}</div>` : ''}</div></div></details>`).join('');
}

// ---------- Quitter une session ----------
function askQuit() {
  openSheet('Quitter la session ?', `<p class="sheet-note">Tu perdras la progression de cette session.</p>
    <div class="sheet-row"><button class="btn btn-ghost" id="qStay">Continuer</button><button class="btn btn-bad" id="qLeave">Quitter</button></div>`,
  (b) => { $('#qStay', b).onclick = closeSheet; $('#qLeave', b).onclick = () => { closeSheet(); S = null; swipe = null; go('home'); }; });
}
$('#closeSession').addEventListener('click', askQuit);
window.addEventListener('popstate', () => { if ($('#screen-session').classList.contains('active')) { history.pushState({ session: true }, ''); askQuit(); } });

// ---------- Clavier mobile : garder la barre d'actions visible ----------
(function syncViewport() {
  const vv = window.visualViewport; if (!vv) return;
  const set = () => { document.documentElement.style.setProperty('--app-h', `${vv.height}px`); document.documentElement.style.setProperty('--app-top', `${vv.offsetTop}px`); };
  vv.addEventListener('resize', set); vv.addEventListener('scroll', set); set();
})();

// ---------- Démarrage ----------
fetch('data.json').then((r) => r.json()).then((d) => {
  buildCards(d);
  $('#stats').textContent = `${CARDS.mots.length} mots · ${CARDS.phrases.length} phrases · ${CARDS.verbes.length} verbes`;
  renderExercises(); renderThemes(); renderGrammar(d.grammaire || []);
}).catch((err) => {
  $('#screen-home').insertAdjacentHTML('beforeend', '<p class="screen-sub">Impossible de charger data.json. Si tu as ouvert index.html en double-cliquant, le navigateur bloque son chargement. Dans le dossier Learn_Lebanese, lance <code>py -m http.server 8000</code>, puis ouvre <code>http://localhost:8000</code>.</p>');
  console.error(err);
});

// Exposé pour les tests
if (typeof window !== 'undefined') window.__app = { judge, key, makeTask, startSession, RENDER, get S() { return S; }, CARDS, finish, answersFor };
