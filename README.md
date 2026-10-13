# Carnet Libanais 🌲

Un petit site perso pour apprendre le libanais (vocabulaire, phrases, verbes,
chiffres, grammaire) — pensé pour être utilisé au téléphone, comme un carnet
de voyage.

Aucune installation, aucun framework : juste `index.html`, `style.css`,
`app.js` et `data.json`. Tu peux l'héberger gratuitement sur GitHub Pages.

## Mettre le site en ligne (GitHub Pages)

1. Crée un nouveau dépôt sur GitHub (par ex. `lebanese-learn`).
2. Mets-y ces 4 fichiers (`index.html`, `style.css`, `app.js`, `data.json`) à
   la racine du dépôt.
3. Dans le dépôt : **Settings → Pages**.
4. Dans "Build and deployment", choisis **Deploy from a branch**, sélectionne
   la branche `main` et le dossier `/ (root)`, puis **Save**.
5. Après une minute ou deux, ton site sera accessible à une adresse du type :
   `https://ton-pseudo.github.io/lebanese-learn/`
6. Ajoute-la à l'écran d'accueil de ton téléphone (Safari/Chrome →
   "Ajouter à l'écran d'accueil") pour l'utiliser comme une vraie petite app.

## Tester le site en local (Windows)

Le navigateur bloque le chargement de `data.json` si tu ouvres `index.html`
directement en double-cliquant dessus. Ouvre PowerShell dans le dossier
`Learn_Lebanese`, lance :

```powershell
py -m http.server 8000
```

Puis visite <http://localhost:8000>. Laisse la fenêtre PowerShell ouverte
pendant que tu utilises le site. Pour arrêter le serveur, appuie sur `Ctrl+C`.

## Fonctionnement de l'appli (v2)

4 onglets en bas : **Accueil**, **Exercices**, **Thèmes**, **Grammaire**.

- **Session du jour** (Accueil) : 15 cartes mélangées (mots, phrases, verbes,
  chiffres) avec des exercices variés. C'est le bouton à toucher chaque jour.
- **Évaluation** (Accueil) : 30 cartes tirées dans tous les thèmes, Mots /
  Phrases / Verbes / Mix, sans phase de découverte ni de sens inverse.
- **Exercices** : 6 types, chacun avec choix du thème (ou tous) :
  - 🌱 **Découverte** : la réponse s'affiche d'abord, puis on te la redemande.
  - 🔁 **Sens inverse** : libanais vers français.
  - ⚡ **QCM éclair** : 4 choix, réponse immédiate (auto-avance si juste).
  - ⚙️ **Verbes** : un pronom + un verbe, tu écris la forme conjuguée.
  - 🔢 **Chiffres** : chiffre vers mot (écrit) et mot vers chiffre (QCM).
  - 🧩 **Phrases** : remettre les mots dans l'ordre, ou compléter à trous.
- **Thèmes** : session de 20 cartes max sur un thème, en Mots / Phrases /
  Verbes / Mix (les types vides sont grisés).
- **Grammaire** : notions à lire (touche pour déplier).

Dans une session :
- Barre de progression en haut, boutons d'action **en bas** (zone du pouce).
- Quand tu **écris**, la vérification est tolérante (e/i, o/u, ou/u, apostrophes
  ignorées, petites fautes acceptées avec « Presque »). Des raccourcis **3 7 ' é**
  sont au-dessus du clavier. Si l'appli se trompe, « J'avais bon ✓ » corrige.
- Après chaque carte : **Acquis ✓** ou **À revoir** (boutons, ou glisser la
  carte à droite = acquis, à gauche = à revoir).
- Les cartes ratées reviennent **une fois** quelques cartes plus tard.
- À la fin : score, liste des cartes à revoir, **Refaire les ratés**.
- Rien n'est sauvegardé entre les sessions.

## Comment fonctionnent les thèmes

Chaque mot a un champ `"categorie"`, chaque phrase et chaque verbe ont un
champ `"theme"`. Ce sont ces valeurs qui définissent les thèmes affichés dans
l'onglet **Thèmes** — utilise la **même valeur exacte** (mêmes accents, même
casse) sur plusieurs entrées pour qu'elles se retrouvent regroupées ensemble,
même si elles sont de types différents (un mot, une phrase et un verbe
peuvent partager le thème `"voyage"` par exemple, et apparaîtront ensemble en
mode "Mix").

Thèmes déjà utilisés : `transport`, `lieu`,
`nourriture`, `personnes`, `nature`, `objet`, `météo`, `expression`,
`connecteur`, `question`, `famille`, `direction`, `action`, `adjectifs`,
`voyage`, `quotidien`, `salutations`, `temps`, `adverbes`, `corps`. Tu peux librement en inventer d'autres
(un nouveau thème apparaît tout seul dans l'appli ; sans libellé prédéfini dans `THEME_META` de `app.js`,
il s'affiche avec son nom brut et une icône 🏷️).

## Comment ajouter du contenu

Tout le contenu vit dans **`data.json`**. Tu n'as jamais besoin de toucher au
HTML, au CSS ou au JS pour ajouter des mots — juste ce fichier.

Le fichier a 5 catégories : `vocabulaire`, `phrases`, `verbes`, `chiffres`,
`grammaire`.

### Ajouter un mot de vocabulaire

```json
{ "id": "v200", "fr": "table", "lb_latin": "tawlé", "lb_arabic": "طاولة", "categorie": "objet" }
```

- `id` : un identifiant unique, juste pour toi (ex. `v200`, `v201`...)
- `fr` : le mot en français (affiché au recto)
- `lb_latin` : la transcription phonétique en lettres latines (affichée au
  verso, ex. "safineh")
- `lb_arabic` : le mot en écriture arabe (optionnel, mais sympa à avoir)
- `categorie` : le thème du mot (voir la liste ci-dessus, ou invente le tien)

### Ajouter un mot avec son contraire (thème "adjectifs")

```json
{ "id": "v201", "fr": "rapide", "lb_latin": "sarii'", "lb_arabic": "", "categorie": "adjectifs", "contraire_fr": "lent", "contraire_lb": "batee'" }
```

Le contraire s'affiche comme petite note en bas du verso de la carte.

### Ajouter une phrase

```json
{ "id": "p52", "fr": "À demain !", "lb_latin": "Bekra nchoufak.", "lb_arabic": "بكرا نشوفك.", "theme": "salutations" }
```

### Ajouter un verbe

Chaque verbe peut avoir une conjugaison complète au présent (`conjugaison`)
et un exemple au passé (`passe_exemple`, facultatif). Si tu ne renseignes pas
encore de conjugaison complète, la carte affichera juste la forme de base —
tu pourras compléter plus tard.

```json
{
  "id": "ver14",
  "infinitif_fr": "boire",
  "infinitif_lb_latin": "yechrab",
  "infinitif_lb_arabic": "يشرب",
  "theme": "nourriture",
  "conjugaison": {
    "je": "bechrab",
    "tu (m)": "btéchrab",
    "tu (f)": "btéchrabé",
    "il": "byéchrab",
    "elle": "btéchrab",
    "nous": "mnéchrab",
    "vous": "btéchrabo",
    "ils / elles": "byéchrabo"
  },
  "passe_exemple": "chrebet"
}
```

### Ajouter un chiffre

```json
{ "id": "n11", "nombre": 11, "fr": "onze", "lb_latin": "hda'ach", "lb_arabic": "حداعش" }
```

### Ajouter une notion de grammaire

```json
{
  "id": "g4",
  "titre": "Le pluriel",
  "explication_fr": "Explique la règle ici en quelques phrases simples.",
  "exemple_fr": "les livres",
  "exemple_lb_latin": "el ktoub",
  "exemple_lb_arabic": "الكتب"
}
```

⚠️ Attention à bien mettre une virgule entre chaque élément de la liste
(sauf après le tout dernier), et à vérifier que le JSON reste valide. Si tu
n'es pas sûr, tu peux coller le contenu de `data.json` dans un validateur en
ligne (recherche "JSON validator online") ou simplement me redemander de
l'éditer pour toi.

## Pourquoi pas three.js ?

Le site n'utilise que du HTML/CSS/JS "brut" (pas de three.js, pas de
framework) pour rester ultra léger et rapide à charger sur mobile — l'effet
de carte qui se retourne façon "tampon de passeport" est fait en CSS pur. Si
tu veux un jour une scène 3D (ex. une carte du Liban en 3D sur l'écran
d'accueil), on peut facilement l'ajouter par-dessus sans casser le reste.
