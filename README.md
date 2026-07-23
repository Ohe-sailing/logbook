# Ohé Sailing — Livre de bord numérique

## Ce qui est déjà fait
- Schéma de base de données complet (`db/schema.sql`)
- Authentification par code email (2 fonctions : demande de code, vérification)

## Ce qu'il te reste à faire, étape par étape

### 1. Créer un compte GitHub (si tu n'en as pas)
https://github.com/signup — gratuit. C'est là que le code du projet va vivre.

### 2. Créer un compte Netlify
https://app.netlify.com/signup — gratuit, tu peux te connecter directement avec ton compte GitHub.

### 3. Créer un compte Resend (pour l'envoi des emails de code)
https://resend.com/signup — gratuit jusqu'à 3000 emails/mois, largement suffisant.
Une fois inscrit, va dans "API Keys" et crée une clé — garde-la de côté, je te dirai où la mettre.

Tu devras aussi valider que tu es propriétaire du domaine ohe-sailing.com dans Resend
(ils te donneront un enregistrement DNS à ajouter chez OVH — je te guiderai le moment venu).

### 4. Une fois ces 3 comptes créés, dis-le moi
Je t'expliquerai ensuite comment :
- mettre ce code sur GitHub
- connecter le repo à Netlify
- créer la base de données (`netlify db init`)
- configurer les variables secrètes (`RESEND_API_KEY`, `SESSION_SECRET`)
- faire le premier déploiement

## Variables d'environnement nécessaires (à configurer plus tard sur Netlify)
- `NETLIFY_DATABASE_URL` — créée automatiquement par `netlify db init`
- `RESEND_API_KEY` — ta clé Resend
- `SESSION_SECRET` — une chaîne aléatoire longue, générée ensemble le moment venu
