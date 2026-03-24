# Coopérative Al Hikma – Site E-commerce de Produits du Terroir Marocain
# HICHAM CONNECT
Boutique en ligne statique pour la vente de produits artisanaux marocains : huiles d’argan, miels, épices, tisanes, graines, etc.  
Le site est entièrement front-end, sans serveur, avec gestion du panier en localStorage et commandes via WhatsApp.

## 🚀 Fonctionnalités

- Catalogue de produits filtrés par catégorie (Huiles, Miels, Tisanes, Épices, Graines)
- Panier d’achat avec modification des quantités, suppression d’articles
- Calcul automatique des frais de livraison (gratuit à partir de 499 DHS, 25 DHS standard, 250 DHS international)
- Gestion du panier persistante (localStorage)
- Génération d’une commande structurée vers WhatsApp (nom, adresse, liste des articles, total)
- Téléchargement d’un catalogue PDF avec images, noms, prix et poids des produits (2 colonnes, 10 produits par page)
- Design responsive (mobile, tablette, desktop) avec Tailwind CSS
- Animations fluides et chargement optimisé

## 📁 Structure du projet

├── index.html # Structure principale de la page
├── style.css # Styles personnalisés (Tailwind + surcharges)
├── script.js # Logique métier (panier, filtres, WhatsApp, PDF)
├── products.json # Base de données produits (nom, prix, image, catégorie, poids)
└── README.md # Ce fichier

## 🔧 Prérequis

Aucun – le site fonctionne entièrement côté client dans un navigateur moderne.  
Pas de serveur, pas de build.

## ⚙️ Installation et configuration

1. **Cloner le dépôt** (ou télécharger les fichiers)
2. **Ouvrir `index.html`** dans un navigateur (double-clic ou via un serveur local comme Live Server)
3. **Configurer le numéro WhatsApp** :
   - Éditer `script.js` et modifier la constante `WHATSAPP_NUMBER` à la ligne 1.
   - Format : code pays + numéro sans `+` ni espaces. Exemple pour le Maroc : `212612345678`.
4. **Personnaliser le catalogue** :
   - Modifier `products.json` pour ajouter / supprimer des produits.
   - Respecter la structure JSON (id, name, description_fr, price, image, category, weight).
   - Les images doivent être accessibles publiquement (URL absolue).
5. **Déployer sur GitHub Pages / Netlify / Vercel** :
   - Poussez les fichiers sur un dépôt GitHub.
   - Activez GitHub Pages dans les paramètres du dépôt (branche `main`, dossier racine).
   - Le site sera accessible en ligne.

## 📱 Utilisation

- **Parcourir les produits** : filtres par catégorie.
- **Ajouter au panier** : bouton “Ajouter au panier” sur chaque produit.
- **Voir le panier** : icône de sac en haut à droite (desktop) ou en bas (mobile).
- **Valider la commande** : remplir le formulaire (nom, adresse) → génération d’un message WhatsApp.
- **Télécharger le catalogue PDF** : bouton “Télécharger le Catalogue PDF” dans le panier ou dans la section héros.

## 🛠️ Technologies utilisées

- HTML5 / CSS3
- [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- [Lucide Icons](https://lucide.netlify.app/) (via CDN)
- [jsPDF](https://github.com/parallax/jsPDF) pour la génération du PDF
- JavaScript vanilla (ES6)

## 📄 Licence

Ce projet est sous licence  – interdit d’utilisation et de modification.

## 👥 Auteur

Coopérative Al Hikma – Taliouine, Maroc  
Contact : `hicham.gr90@gmail.com`  
WhatsApp : à configurer dans `script.js`
