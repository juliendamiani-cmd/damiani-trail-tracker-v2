DAMIANI TRAIL TRACKER V33 — SUIVI EN DIRECT CONFIGURÉ

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


MESSAGERIE V32
- Les proches peuvent saisir leur prénom et envoyer un message de 300 caractères maximum.
- Les messages sont enregistrés dans Firebase sous le code de suivi de la course.
- Julien les reçoit automatiquement lorsque l’application a accès à Internet.
- Le bouton « Marquer comme lus » retire le compteur de nouveaux messages sur son appareil.
- La réinitialisation complète de la course supprime aussi les messages enregistrés pour cette course.

IMPORTANT
Les règles actuelles autorisent publiquement la lecture et l’écriture. Ne partagez le lien de suivi qu’avec des personnes de confiance. Après la course, désactivez les règles publiques ou supprimez la base.


CORRECTIF V33
L’envoi des messages utilise désormais une écriture PATCH sur le suivi principal, ce qui met aussi à jour l’horodatage global. Cela garantit la détection immédiate du message sur le téléphone du coureur.
