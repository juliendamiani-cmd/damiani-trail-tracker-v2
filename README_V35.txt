DAMIANI TRAIL TRACKER V35

Nouveautés principales
- Fonctionnement hors connexion réel grâce au service worker.
- Saisie conservée localement si le réseau disparaît.
- Envoi automatique des données en attente au retour d’Internet.
- Indicateur de fraîcheur du suivi pour les proches.
- Rafraîchissement adaptatif : 10 s à l’écran, 60 s en arrière-plan.
- Résumé Proches et raccourcis vers progression, horaires, messages et contacts.
- Messages rapides prédéfinis.
- Mode course verrouillable pour masquer les réglages sensibles.
- Suppression volontaire des données de suivi distantes.
- Lien direct ?suivi=CODE et mémorisation du code conservés.

Déploiement
Déposer tous les fichiers à la racine du même hébergement HTTPS.
Le service worker nécessite HTTPS (ou localhost en test).

Important concernant Firebase
La protection réelle lecture/écriture dépend des règles configurées dans Firebase.
Ne laissez pas une base ouverte publiquement au-delà de la période nécessaire.
