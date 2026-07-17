DAMIANI TRAIL TRACKER V31 — SUIVI EN DIRECT CONFIGURÉ

La base Firebase du projet Damiani Trail Tracker est déjà renseignée dans cette version.
Code de suivi : JULIEN-UT4M-50B-2026

UTILISATION COUREUR
1. Ouvrir l’application avec une connexion internet.
2. Choisir « Julien, le coureur ».
3. Modifier le kilométrage ou enregistrer un pointage.
4. La position est envoyée automatiquement à Firebase.
5. Utiliser « Partager le lien proches » pour envoyer le lien de suivi.

UTILISATION PROCHES
1. Ouvrir le lien reçu.
2. Le mode Proches s’ouvre automatiquement.
3. Le profil et la position se mettent à jour environ toutes les 5 secondes.

RÉINITIALISATION
Le bouton « Réinitialiser la course » efface les pointages, la position manuelle et les anciennes informations d’état, puis publie cet effacement dans Firebase afin que les proches voient eux aussi une course réinitialisée.

SÉCURITÉ
Les règles actuelles autorisent publiquement la lecture et l’écriture. Après la course, repasser les règles Firebase à false ou mettre en place une authentification.
