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

## Comment ajouter du contenu

Tout le contenu vit dans **`data.json`**. Tu n'as jamais besoin de toucher au
HTML, au CSS ou au JS pour ajouter des mots — juste ce fichier.

Le fichier a 5 catégories : `vocabulaire`, `phrases`, `verbes`, `chiffres`,
`grammaire`.

### Ajouter un mot de vocabulaire

```json
{ "id": "v11", "fr": "table", "lb_latin": "tawlé", "lb_arabic": "طاولة", "categorie": "objet" }
```

- `id` : un identifiant unique, juste pour toi (ex. `v11`, `v12`...)
- `fr` : le mot en français (affiché au recto)
- `lb_latin` : la transcription phonétique en lettres latines (affichée au
  verso, ex. "safineh")
- `lb_arabic` : le mot en écriture arabe (optionnel, mais sympa à avoir)
- `categorie` : un simple mot-clé libre (transport, nourriture, nature...)

### Ajouter une phrase

```json
{ "id": "p9", "fr": "À demain !", "lb_latin": "Bekra nchoufak.", "lb_arabic": "بكرا نشوفك." }
```

### Ajouter un verbe

Chaque verbe a une conjugaison complète — ajoute autant de pronoms que tu
veux dans `conjugaison`, l'appli les affiche automatiquement.

```json
{
  "id": "ver4",
  "infinitif_fr": "boire",
  "infinitif_lb_latin": "yechrab",
  "infinitif_lb_arabic": "يشرب",
  "conjugaison": {
    "je": "bechrab",
    "tu (m)": "btéchrab",
    "tu (f)": "btéchrabé",
    "il": "byéchrab",
    "elle": "btéchrab",
    "nous": "mnéchrab",
    "vous": "btéchrabo",
    "ils / elles": "byéchrabo"
  }
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

## Fonctionnement de l'appli

- 5 onglets en bas : Mots, Phrases, Verbes, Chiffres, Grammaire.
- Chaque carte montre une question en français. Tu écris ta réponse (à voix
  haute ou dans le champ texte, comme tu préfères), puis tu appuies sur
  **"Voir la réponse"** (ou tu touches la carte, ou tu appuies sur Entrée)
  pour la retourner et voir la bonne réponse en libanais (translittération +
  écriture arabe).
- **"Passer →"** te fait avancer à la carte suivante.
- Le bouton ⟲ en haut à droite mélange l'ordre des cartes de la section en
  cours.
- Rien n'est sauvegardé entre les sessions (pas de score, pas de compte) :
  c'est volontairement simple, juste un support de révision que tu consultes
  librement, dans l'ordre que tu veux.

## Pourquoi pas three.js ?

Le site n'utilise que du HTML/CSS/JS "brut" (pas de three.js, pas de
framework) pour rester ultra léger et rapide à charger sur mobile — l'effet
de carte qui se retourne façon "tampon de passeport" est fait en CSS pur. Si
tu veux un jour une scène 3D (ex. une carte du Liban en 3D sur l'écran
d'accueil), on peut facilement l'ajouter par-dessus sans casser le reste.
