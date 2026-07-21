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

## Fonctionnement de l'appli

L'appli a 4 onglets en bas : **Thèmes**, **Évaluation**, **Chiffres**,
**Grammaire**.

- **Thèmes** : choisis un thème (Météo, Famille, Direction, Voyage,
  Opposés...), puis choisis ce que tu veux réviser dedans — **Mots**,
  **Phrases**, **Verbes**, ou **Mix** (un mélange des trois). Les thèmes sont
  déduits automatiquement de `data.json` : si tu ajoutes un mot avec une
  nouvelle valeur de `"categorie"`, un nouveau thème apparaît tout seul.
- **Évaluation** : choisis Mots / Phrases / Verbes / Mix, et l'appli te donne
  une session qui mélange **tous les thèmes**, limitée à 30 cartes — pratique
  pour un petit contrôle rapide de tes connaissances.
- **Chiffres** et **Grammaire** : comme avant, une liste dédiée, sans
  sélection de thème.

Dans une session :
- Chaque carte montre une question en français. Tu écris ta réponse (à voix
  haute ou dans le champ texte), puis tu appuies sur **"Voir la réponse"** (ou
  tu touches la carte, ou tu appuies sur Entrée) pour la retourner.
- **"Passer →"** avance à la carte suivante, **"← Précédent"** revient à la
  précédente (le paquet est circulaire : après la dernière carte, "Passer"
  revient à la première, et inversement).
- Le bouton ⟲ en haut à droite mélange l'ordre des cartes de la session en
  cours.
- **"← Changer"** en haut de la session ramène à l'écran de choix (thème ou
  type) pour changer de sujet.
- Rien n'est sauvegardé entre les sessions (pas de score, pas de compte) :
  c'est volontairement simple, un pur outil de révision.

## Comment fonctionnent les thèmes

Chaque mot a un champ `"categorie"`, chaque phrase et chaque verbe ont un
champ `"theme"`. Ce sont ces valeurs qui définissent les thèmes affichés dans
l'onglet **Thèmes** — utilise la **même valeur exacte** (mêmes accents, même
casse) sur plusieurs entrées pour qu'elles se retrouvent regroupées ensemble,
même si elles sont de types différents (un mot, une phrase et un verbe
peuvent partager le thème `"voyage"` par exemple, et apparaîtront ensemble en
mode "Mix").

Thèmes déjà utilisés dans le fichier de départ : `transport`, `lieu`,
`nourriture`, `personnes`, `nature`, `objet`, `météo`, `expression`,
`connecteur`, `question`, `famille`, `direction`, `action`, `adjectifs`,
`voyage`, `quotidien`, `salutations`. Tu peux librement en inventer d'autres.

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
