# ⚡️ Iron Tracker - Cross-Platform Gym & Workout App (iOS & Android)

Une application mobile moderne, ultra-rapide et utilisable hors-ligne sur **iPhone et Android**, développée pour tracker ses séances de musculation, ses charges, ses répétitions, ses temps de repos et sa progression (1RM, volume).

---

## 📱 Fonctionnalités Principales

### 1. 🏋️‍♂️ Aujourd'hui (Séance en direct)
- Démarrage rapide depuis un programme (Push, Pull, Legs, Upper, etc.) ou **Séance Libre**.
- Suivi en temps réel de l'avancement :
  - ⚪️ **À faire**
  - 🟠 **En cours**
  - 🟢 **Validé**
- Réorganisation de l'ordre des exercices à la volée.
- Notes de réglages machines (hauteur de selle, cran de poulie, dossier).
- Bouton de fin de séance avec contrôle des séries incomplètes.
- **Carte de Partage Instagram Story / Réseaux** haute définition avec récapitulatif complet de la séance.

### 2. ⚡️ Saisie Intelligente des Séries
- **Musculation classique** : Poids (Kg), Répétitions, Inversion de charge `+/-` pour machines assistées.
- **Échec Musculaire ⚡️** : Bouton d'intensité pour marquer les séries menées à l'échec.
- **Séries Dégressives (Drop Sets ⤵)** : Ajout de sous-séries avec poids et répétitions ajustés.
- **Mode Unilatéral (G/D)** : Répétitions séparées Bras/Jambe Gauche & Droite.
- **Cardio** : Durée (Min), Vitesse (Km/h), Inclinaison (%).
- **Rappel de Performance** : Affichage automatique de la performance de la dernière séance sous chaque série ("*Dernière fois : 80kg x 8 ⚡️*").

### 3. ⏱️ Chrono de Repos Flottant & Circulaire
- Boutons rapides (30s, 1 min, 2 min, 3 min) ou sélection personnalisée.
- Compteur circulaire avec progression visuelle.
- Alertes sonores et vibrations haptiques à la fin du temps de repos.
- Widget flottant discret pendant la séance pour garder un œil sur le chrono.

### 4. 📋 Mes Programmes
- Création, édition, réorganisation et suppression de programmes d'entraînement.
- Support natif des **Bisets / Supersets** (repère violet distinctif).
- Conversion instantanée d'une séance terminée en programme sauvegardé.

### 5. 📅 Historique & Calendrier Interactif
- Calendrier mensuel avec tiroir rétractable fluide.
- Pastilles vertes sur les jours d'entraînement.
- Consultation, modification des anciennes séances ou ajout rétroactif.

### 6. 📈 Progression & Formule 1RM
- Calcul automatique du **1RM estimé selon la formule de Brzycki** :
  $$\text{1RM} = \frac{\text{Poids}}{1.0278 - (0.0278 \times \text{Répétitions})}$$
- Courbe interactive de progression de la force dans le temps.
- Statistiques globales : Volume total soulevé (Tonnes), Fréquence hebdomadaire, Taux d'échec (%), Exercice favori, Fréquence des programmes.

### 7. 📚 Catalogue & Groupes Musculaires
- Organisation par muscles (Pectoraux, Dos, Jambes, Épaules, Biceps, Triceps, Abdos, Cardio, etc.).
- Ajout de nouveaux dossiers musculaires.
- **Renommage global** : changer le nom d'un exercice met à jour instantanément tout l'historique et les programmes.
- Déplacement d'exercices d'un muscle à un autre.

### 8. 💾 Données & Sauvegardes
- Stockage local ultra-rapide 100% hors-ligne.
- Export et Import complet des données au format JSON.

---

## 🚀 Comment Lancer et Tester l'Application

### Option A : Tester directement sur son iPhone ou Android physique (via Expo Go)
1. Installez l'application gratuite **Expo Go** sur votre téléphone depuis l'App Store (iOS) ou Google Play Store (Android).
2. Dans le terminal de votre projet :
   ```bash
   npm install
   npx expo start
   ```
3. Scannez le QR Code affiché dans votre terminal avec l'appareil photo de votre iPhone ou l'application Expo Go sur Android.

---

## 🎨 Charte Graphique (Design System)
- **Fond** : Noir absolu OLED (`#000000`)
- **Cartes** : `#131318` et bordures `#272732`
- **Vert Néon Principal** : `#33FF55`
- **Violet Biset** : `#994DFF`
- **Jaune Échec** : `#FACC15` ⚡️
- **Rouge Dégressif** : `#FF4D4D` ⤵
