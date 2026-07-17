DAMIANI TRAIL TRACKER V30 — ACTIVER LE SUIVI EN DIRECT

La V30 utilise Firebase Realtime Database. Sans base Firebase configurée, l'application continue à fonctionner normalement en local.

1. Créer gratuitement un projet sur Firebase.
2. Ouvrir « Realtime Database » puis créer une base.
3. Pour un usage ponctuel pendant la course, utiliser ces règles temporaires :

{
  "rules": {
    "damianiTrailTracker": {
      "$room": {
        ".read": true,
        ".write": true
      }
    }
  }
}

4. Copier l'adresse de la base, par exemple :
https://nom-du-projet-default-rtdb.europe-west1.firebasedatabase.app

5. Dans l'application, ouvrir « Configurer la synchronisation ».
6. Coller l'adresse Firebase et choisir un code long et difficile à deviner.
7. Appuyer sur « Activer la synchronisation » puis « Partager le lien proches ».
8. Les proches ouvrent simplement ce lien. Leur écran s'actualise environ toutes les 5 secondes.

IMPORTANT
- Les règles ci-dessus sont simples mais publiques. Utiliser un code de suivi long et unique.
- Après la course, désactiver la base ou remplacer les règles par ".read": false et ".write": false.
- L'application publie uniquement les données de course : kilométrage, pointages, messages d'état, horaires et lien LiveTrail.
