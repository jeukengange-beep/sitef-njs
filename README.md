# Aperçu de site simple

Ce projet Next.js propose un parcours en six étapes pour créer un aperçu visuel d'un futur site web. L'interface invite la personne à raconter son activité, ses offres, son univers visuel et sa façon de communiquer. À la fin, une maquette met en scène le nom, les couleurs choisies, des sections dédiées (À propos, Offres, Contact) et un bouton pour ouvrir une discussion WhatsApp.

## Démarrage

```bash
npm install
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

## Configuration Gemini

- Déclare une clé `GEMINI_API_KEY` dans `.env.local` et sur Vercel.
- Par défaut, l'API appelle le modèle `gemini-2.5-flash-image-preview` pour obtenir une image PNG.
- Si ton projet n'a pas accès à ce modèle, ajoute `GEMINI_IMAGE_MODEL` dans tes variables d'environnement (ex. `imagen-3.0-fast`).
- En cas d'erreur de quota ou d'accès, vérifie la facturation, les autorisations du modèle dans [Google AI Studio](https://aistudio.google.com/) et consulte le [tableau d'usage](https://ai.dev/usage?tab=rate-limit).
