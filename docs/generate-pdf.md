# Générer les PDF

## Option 1 — npx md-to-pdf (recommandé, sans installation)

Depuis le dossier `docs/`, exécute :

```bash
cd docs
npx --yes md-to-pdf README.md frontend.md backend.md database.md docker.md kubernetes.md tests.md
```

Cela génère 7 fichiers PDF dans le même dossier. La première exécution télécharge Puppeteer (~100 Mo) qui embarque un Chromium pour le rendu.

## Option 2 — Un seul gros PDF combiné

```bash
cd docs
cat README.md frontend.md backend.md database.md docker.md kubernetes.md tests.md > _combined.md
npx --yes md-to-pdf _combined.md
mv _combined.pdf "Documentation_ETNAir.pdf"
rm _combined.md
```

Tu obtiens **Documentation_ETNAir.pdf** : un seul fichier que tu peux imprimer ou partager.

## Option 3 — Via VS Code (zéro ligne de commande)

1. Installer l'extension **Markdown PDF** (yzane.markdown-pdf)
2. Ouvrir un fichier `.md`
3. `Ctrl+Shift+P` → "Markdown PDF: Export (pdf)"

## Option 4 — Via le navigateur

1. Ouvrir le `.md` sur GitHub/GitLab (rendu automatique)
2. `Ctrl+P` → "Enregistrer en PDF"

## Personnalisation du style

Si tu veux un style custom (police, marges, en-tête), crée un fichier `pdf-config.json` :

```json
{
  "stylesheet": ["custom.css"],
  "body_class": "markdown-body",
  "page_media_type": "print",
  "marked_options": { "headerIds": false },
  "pdf_options": {
    "format": "A4",
    "margin": "30mm 20mm",
    "printBackground": true
  }
}
```

Puis : `npx md-to-pdf --config-file pdf-config.json README.md`.
