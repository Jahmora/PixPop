// Fonction pour détecter si l'application est ouverte dans le navigateur Telegram
function isTelegramWebView() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /Telegram/i.test(userAgent);
}

// Fonction de mélange (shuffle) du tableau
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // échange d'éléments
  }
  return array;
}

document.addEventListener('DOMContentLoaded', function() {
  // Détection de la langue de l'utilisateur
  function detectUserLanguage() {
    const language = navigator.language || navigator.userLanguage;
    return language.startsWith('fr') ? 'fr' : 'en';
  }

  // Traductions pour les éléments statiques et les messages
  const translations = {
    en: {
      themeToggleDark: 'Dark Mode',
      themeToggleLight: 'Light Mode',
      header: 'PixPop - Image Gallery',
      shareButton: 'Share',
      viewCount: 'Views: ',
      shareCount: 'Shares: ',
      copied: 'Links copied to clipboard.',
      copyError: 'Unable to copy links.',
      shareError: 'Sharing not supported on this browser.'
    },
    fr: {
      themeToggleDark: 'Mode Sombre',
      themeToggleLight: 'Mode Clair',
      header: 'PixPop - Galerie d\'Images',
      shareButton: 'Partager',
      viewCount: 'Vues : ',
      shareCount: 'Partages : ',
      copied: 'Les liens ont été copiés dans le presse-papiers.',
      copyError: 'Impossible de copier les liens.',
      shareError: 'Le partage n\'est pas supporté sur ce navigateur.'
    }
  };

  // Appliquer les traductions aux éléments statiques
  const userLanguage = detectUserLanguage();
  document.getElementById('theme-toggle').textContent = translations[userLanguage].themeToggleDark;
  document.querySelector('h1').textContent = translations[userLanguage].header;
  document.getElementById('share-button').innerHTML = `<i class="fas fa-share-alt"></i> ${translations[userLanguage].shareButton}`;
  document.getElementById('view-count').textContent = translations[userLanguage].viewCount + '0';
  document.getElementById('share-count').textContent = translations[userLanguage].shareCount + '0';

  // Variables globales
  const gallery = document.getElementById('gallery');
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modal-img');
  const span = document.getElementsByClassName('close')[0];
  const themeToggle = document.getElementById('theme-toggle');
  const shareButton = document.getElementById('share-button');
  const viewCount = document.getElementById('view-count');
  const shareCount = document.getElementById('share-count');
  let currentImageIndex = 0;

  // Nombre total d'images (à adapter selon vos ressources)
  const totalImages = 51;
  const images = [];

  // Charger les informations des images depuis le localStorage ou les initialiser
  for (let i = 1; i <= totalImages; i++) {
    const imageKey = `image${i}`;
    const storedImage = localStorage.getItem(imageKey);
    const imageData = storedImage 
      ? JSON.parse(storedImage) 
      : { src: `image${i}.png`, alt: `Image ${i}`, views: 0, shares: 0 };
    images.push(imageData);
  }

  // Mélanger l'ordre des images de manière aléatoire
  shuffleArray(images);

  // Fonction de sauvegarde des données dans le localStorage
  function saveImageData() {
    images.forEach((image, index) => {
      const imageKey = `image${index + 1}`;
      localStorage.setItem(imageKey, JSON.stringify(image));
    });
  }

  // Création de la galerie en parcourant le tableau des images (mélangé)
  images.forEach((image, index) => {
    const imgElement = document.createElement('img');
    imgElement.src = image.src;
    imgElement.alt = image.alt;
    // Activation du lazy loading
    imgElement.setAttribute('loading', 'lazy');

    // Au clic, ouvrir la modale et incrémenter le compteur de vues
    imgElement.addEventListener('click', function() {
      openModal(this.src, index);
      incrementViewCount(index);

      // Précharger l'image suivante si elle existe
      if (index + 1 < images.length) {
        const nextImg = new Image();
        nextImg.src = images[index + 1].src;
      }
    });

    // Gestion des erreurs de chargement
    imgElement.onerror = function() {
      this.src = 'image-placeholder.png';
      this.alt = 'Image non disponible';
    };

    gallery.appendChild(imgElement);
  });

  // Fonction pour ouvrir la modale
  function openModal(src, index) {
    modalImg.src = src;
    modal.classList.add('show');
    modalImg.classList.remove('zoomed');
    currentImageIndex = index;
    updateViewCount(index);
    updateShareCount(index);
  }

  // Fonction pour fermer la modale
  function closeModal() {
    modal.classList.remove('show');
    modalImg.classList.remove('zoomed');
  }

  // Fermer la modale lors du clic sur la croix ou en dehors du contenu modal
  span.onclick = closeModal;
  window.onclick = function(event) {
    if (event.target === modal) {
      closeModal();
    }
  };

  // Permettre le zoom sur l'image dans la modale
  modalImg.addEventListener('click', function() {
    modalImg.classList.toggle('zoomed');
  });

  // Basculer le thème (affiche Mode Clair lorsque le thème sombre est actif, et inversement)
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
      themeToggle.textContent = translations[userLanguage].themeToggleLight;
    } else {
      themeToggle.textContent = translations[userLanguage].themeToggleDark;
    }
  });

  // Gestion du partage
  shareButton.addEventListener('click', function() {
    const botUsername = 'PixPopBot'; // Remplacez par le nom exact de votre bot
    const botLink = `https://t.me/${botUsername}`;
    const imageUrl = modalImg.src;
    const shareText = `Découvrez cette image sur PixPop !`;

    // Enregistrer le partage pour l'image actuelle
    enregistrerPartage(currentImageIndex);

    if (isTelegramWebView()) {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(shareText)}%0ARejoignez-nous sur ${botLink}`;
      window.open(shareUrl, '_blank');
    } else if (navigator.share) {
      navigator.share({
        title: 'PixPop',
        text: `${shareText}\nRejoignez-nous sur ${botLink}`,
        url: imageUrl,
      })
      .then(() => console.log('Partage réussi'))
      .catch((error) => console.log(translations[userLanguage].shareError, error));
    } else if (navigator.clipboard) {
      const textToCopy = `${shareText}\n${imageUrl}\nRejoignez-nous sur ${botLink}`;
      navigator.clipboard.writeText(textToCopy)
        .then(() => { 
          alert(translations[userLanguage].copied);
        })
        .catch((error) => {
          alert(translations[userLanguage].copyError);
          console.error(translations[userLanguage].copyError, error);
        });
    } else {
      alert(translations[userLanguage].shareError);
    }
  });

  // Enregistrer un partage
  function enregistrerPartage(index) {
    images[index].shares++;
    updateShareCount(index);
    saveImageData();
  }

  // Incrémenter le compteur de vues
  function incrementViewCount(index) {
    images[index].views++;
    saveImageData();
  }

  // Mettre à jour l'affichage du compteur de vues
  function updateViewCount(index) {
    viewCount.textContent = translations[userLanguage].viewCount + images[index].views;
  }

  // Mettre à jour l'affichage du compteur de partages
  function updateShareCount(index) {
    shareCount.textContent = translations[userLanguage].shareCount + images[index].shares;
  }

  // Enregistrement du Service Worker pour la mise en cache des ressources
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker enregistré avec succès, scope :', registration.scope);
        })
        .catch(error => {
          console.error('Échec de l\'enregistrement du Service Worker :', error);
        });
    });
  }
});
