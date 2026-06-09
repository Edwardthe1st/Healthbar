# Healthbar

Healthbar est une application mobile de suivi de santé centrée sur la nutrition, le suivi des calories et l'accompagnement personnalisé.

## Idée principale

L'objectif est de proposer une application simple à utiliser, complète et adaptée aux besoins de chaque utilisateur. Elle doit permettre de suivre son alimentation, créer ses propres repas, consulter des informations nutritionnelles et recevoir de l'aide via un assistant santé.

## Fonctionnalités prévues

- Compteur de calories complet avec plusieurs métriques personnalisées selon le profil de l'utilisateur.
- Liste de produits, plats, légumes, viandes et autres aliments.
- Création de plats personnalisés avec calcul des calories et des métriques nutritionnelles.
- Assistant de santé pour aider les utilisateurs à faire des choix alimentaires et à suivre leur programme.
- Interface simple, claire et agréable à utiliser.
- Plusieurs formules d'utilisation :
  - Version gratuite : toutes les fonctionnalités principales avec publicités, et limitations sur l'assistant et la création de plats.
  - Version sans publicité : toutes les fonctionnalités principales sans publicités, avec limitations sur l'assistant et la création de plats.
  - Version pro : toutes les fonctionnalités sans publicités et sans limitations sur l'assistant et la création de plats.

## Structure du projet

```txt
mobile/
  app/
    _layout.tsx   # Squelette global de l'application
    index.tsx     # Page d'accueil / page de connexion
  components/     # Composants d'interface réutilisables
  utils/          # Fonctions utilitaires
  hooks/          # Logique React réutilisable
  services/       # Appels API, stockage et logique externe
```

## Lancer l'application

Depuis le dossier `mobile` :

```bash
npm install
npm start
```

Pour lancer directement sur iOS :

```bash
npm run ios
```
