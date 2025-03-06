// Fonction pour détecter si l'application est ouverte dans Telegram
function isTelegramWebView() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /Telegram/i.test(userAgent);
}

// Fonction de mélange (shuffle) d'un tableau
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // échange des éléments
  }
  return array;
}

document.addEventListener('DOMContentLoaded', function() {
  // Vérifier ou enregistrer le temps de début du splash (défini dans HTML)
  if (!window.splashStart) {
    window.splashStart = Date.now();
  }

  // Détection de la langue de l'utilisateur
  function detectUserLanguage() {
    const language = navigator.language || navigator.userLanguage;
    return language.startsWith('fr') ? 'fr' : 'en';
  }

  // Traductions pour les éléments statiques
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
      shareError: 'Sharing not supported on this browser.',
      loading: 'Loading...',
      themes: { all: 'All Themes' }
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
      shareError: 'Le partage n\'est pas supporté sur ce navigateur.',
      loading: 'Chargement...',
      themes: { all: 'Tous les thèmes' }
    }
  };

  const userLanguage = detectUserLanguage();

  // Appliquer les traductions aux éléments statiques
  document.getElementById('theme-toggle').textContent = translations[userLanguage].themeToggleDark;
  document.querySelector('h1').textContent = translations[userLanguage].header;
  document.getElementById('share-button').innerHTML =
    `<i class="fas fa-share-alt"></i> ${translations[userLanguage].shareButton}`;
  document.getElementById('view-count').textContent = translations[userLanguage].viewCount + '0';
  document.getElementById('share-count').textContent = translations[userLanguage].shareCount + '0';
  // Mettre à jour le texte du splash screen
  document.querySelector('#splash p').textContent = translations[userLanguage].loading;

  // Références aux éléments du DOM
  const gallery = document.getElementById('gallery');
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = document.getElementsByClassName('close')[0];
  const themeToggleBtn = document.getElementById('theme-toggle');
  const shareButton = document.getElementById('share-button');
  const viewCount = document.getElementById('view-count');
  const shareCount = document.getElementById('share-count');
  const commonNameLabel = document.getElementById('common-name'); // Pour afficher le nom commun dans la modale
  let currentImageIndex = 0;

  // Tableau d'images; ici, suppression du système de vote et de filtre dynamique.
  const totalImages = 51;
  const images = [];
  const defaultThemes = ["nature", "urban", "abstract"]; // Utilisé uniquement pour la donnée, pas de filtrage ici.
  for (let i = 1; i <= totalImages; i++) {
    const imageKey = `image${i}`;
    const storedImage = localStorage.getItem(imageKey);
    const imageData = storedImage
      ? JSON.parse(storedImage)
      : {
          src: `image${i}.png`,
          alt: `Image ${i}`,
          views: 0,
          shares: 0,
          votes: 0,
          theme: defaultThemes[Math.floor(Math.random() * defaultThemes.length)],
          commonName: null // Nom lisible qui sera généré
        };
    images.push(imageData);
  }
  
  shuffleArray(images);

  // Fonction d'affichage de la galerie (simple)
  function displayGallery(imageArray) {
    gallery.innerHTML = '';
    imageArray.forEach((image, index) => {
      const imgElement = document.createElement('img');
      imgElement.src = image.src;
      imgElement.alt = image.alt;
      imgElement.setAttribute('loading', 'lazy');
      imgElement.addEventListener('click', function() {
        openModal(this.src, index);
        incrementViewCount(index);
        if (index + 1 < imageArray.length) {
          const nextImg = new Image();
          nextImg.src = imageArray[index + 1].src;
        }
      });
      imgElement.onerror = function() {
        this.src = 'image-placeholder.png';
        this.alt = 'Image non disponible';
      };
      gallery.appendChild(imgElement);
    });
  }
  
  // Affichage initial de la galerie
  displayGallery(images);
  
  // Ensemble pour retenir les noms déjà utilisés
  const usedNames = new Set();

  // Fonction d'ouverture de la modale
  function openModal(src, index) {
    modalImg.src = src;
    modal.classList.add('show');
    modalImg.classList.remove('zoomed');
    currentImageIndex = index;
    updateViewCount(index);
    updateShareCount(index);
    
    // Extraction du nom commun
    if (images[index].commonName) {
      commonNameLabel.textContent = images[index].commonName;
    } else {
      // Si nous sommes dans Telegram, demander à l'utilisateur de générer le nom en cliquant sur l'image.
      if (isTelegramWebView()) {
        commonNameLabel.textContent = "Appuyez pour générer le nom";
        // Définir une fonction nommée pour que removeEventListener fonctionne correctement
        function generateNameOnClick() {
          modalImg.removeEventListener('click', generateNameOnClick);
          getImageSignature(images[index].src, function(hash) {
            let commonName = hash ? generateUniqueCommonName(hash, usedNames) : "Unnamed";
            images[index].commonName = commonName;
            commonNameLabel.textContent = commonName;
            // Optionnel : envoyer une notification push
            notifyFinalName(commonName);
          });
        }
        modalImg.addEventListener('click', generateNameOnClick);
      } else {
        // Sinon, générer automatiquement
        getImageSignature(images[index].src, function(hash) {
          let commonName = hash ? generateUniqueCommonName(hash, usedNames) : "Unnamed";
          images[index].commonName = commonName;
          commonNameLabel.textContent = commonName;
          // Optionnel : notification push
          notifyFinalName(commonName);
        });
      }
    }
    
    // Effet glitch optionnel
    modalImg.classList.add('glitch');
    setTimeout(() => { modalImg.classList.remove('glitch'); }, 500);
  }
  
  function closeModal() {
    modal.classList.remove('show');
    modalImg.classList.remove('zoomed');
  }
  
  closeBtn.onclick = closeModal;
  window.onclick = function(event) {
    if (event.target === modal) {
      closeModal();
    }
  };
  
  modalImg.addEventListener('click', function() {
    modalImg.classList.toggle('zoomed');
  });
  
  // Basculer le thème clair/sombre
  themeToggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
      themeToggleBtn.textContent = translations[userLanguage].themeToggleLight;
    } else {
      themeToggleBtn.textContent = translations[userLanguage].themeToggleDark;
    }
  });
  
  // Gestion du partage
  shareButton.addEventListener('click', function() {
    const botUsername = 'PixPopBot';
    const botLink = `https://t.me/${botUsername}`;
    const imageUrl = modalImg.src;
    const shareText = `Découvrez cette image sur PixPop !`;
    images[currentImageIndex].shares++;
    updateShareCount(currentImageIndex);
    saveImageData();
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
        .then(() => { alert(translations[userLanguage].copied); })
        .catch((error) => {
          alert(translations[userLanguage].copyError);
          console.error(translations[userLanguage].copyError, error);
        });
    } else {
      alert(translations[userLanguage].shareError);
    }
  });
  
  // Gestion des compteurs
  function incrementViewCount(index) {
    images[index].views++;
    saveImageData();
  }
  
  function updateViewCount(index) {
    viewCount.textContent = translations[userLanguage].viewCount + images[index].views;
  }
  
  function updateShareCount(index) {
    shareCount.textContent = translations[userLanguage].shareCount + images[index].shares;
  }
  
  function saveImageData() {
    images.forEach((image, index) => {
      const imageKey = `image${index + 1}`;
      localStorage.setItem(imageKey, JSON.stringify(image));
    });
  }
  
  // Enregistrement du Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/PixPop/service-worker.js')
        .then(registration => {
          console.log('Service Worker enregistré avec succès, scope :', registration.scope);
        })
        .catch(error => {
          console.error('Échec du Service Worker :', error);
        });
    });
  }
  
  // Masquer le splash screen après au moins 10 secondes
  function hideSplashScreen() {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => { splash.style.display = "none"; }, 500);
    }
  }
  
  const splashMinimum = 10000; // 10 secondes
  const elapsed = Date.now() - window.splashStart;
  const remaining = Math.max(splashMinimum - elapsed, 0);
  setTimeout(hideSplashScreen, remaining);
});
