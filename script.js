// Fonction pour détecter si l'application est ouverte dans le navigateur Telegram
function isTelegramWebView() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /Telegram/i.test(userAgent);
}

// Fonction de mélange (shuffle) du tableau
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // échange des éléments
  }
  return array;
}

document.addEventListener('DOMContentLoaded', function() {
  // Vérifier ou enregistrer le temps de début du splash
  if (!window.splashStart) {
    window.splashStart = Date.now();
  }

  // Détection de la langue de l'utilisateur
  function detectUserLanguage() {
    const language = navigator.language || navigator.userLanguage;
    return language.startsWith('fr') ? 'fr' : 'en';
  }

  // Traductions pour les éléments statiques, y compris pour le splash et les thèmes
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
      themes: {
        all: 'All Themes'
      }
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
      themes: {
        all: 'Tous les thèmes'
      }
    }
  };

  const userLanguage = detectUserLanguage();

  // Appliquer les traductions aux éléments statiques
  document.getElementById('theme-toggle').textContent = translations[userLanguage].themeToggleDark;
  document.querySelector('h1').textContent = translations[userLanguage].header;
  document.getElementById('share-button').innerHTML = `<i class="fas fa-share-alt"></i> ${translations[userLanguage].shareButton}`;
  document.getElementById('view-count').textContent = translations[userLanguage].viewCount + '0';
  document.getElementById('share-count').textContent = translations[userLanguage].shareCount + '0';
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
  const voteButton = document.getElementById('vote-button'); // Cet élément est désormais présent dans le HTML.
  const voteCountLabel = document.getElementById('vote-count'); // Cet élément est présent dans le HTML.
  const filterSelect = document.getElementById('filter-theme');
  let currentImageIndex = 0;

  // Nombre total d'images et tableau "images"
  const totalImages = 51;
  const images = [];
  const defaultThemes = ["nature", "urban", "abstract"]; // au cas où

  // Charger les images depuis le localStorage ou les initialiser
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
          theme: null  // Le thème sera assigné dynamiquement.
        };
    images.push(imageData);
  }

  // Mélanger l'ordre des images
  shuffleArray(images);

  // --- Extraction des couleurs dominantes avec ColorThief ---
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
      let hex = x.toString(16);
      return (hex.length === 1 ? "0" + hex : hex);
    }).join("");
  }

  // Si le protocole est "file:", contournez l'extraction pour éviter des erreurs CORS
  function assignDynamicTheme(imageData, callback) {
    if (window.location.protocol === "file:") {
      imageData.theme = "default";
      callback();
      return;
    }
    const tempImg = new Image();
    tempImg.crossOrigin = "Anonymous";
    tempImg.src = imageData.src;
    tempImg.onload = function() {
      try {
        const colorThief = new ColorThief();
        const dominantColor = colorThief.getColor(tempImg);
        imageData.theme = rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);
      } catch (e) {
        imageData.theme = "default";
      }
      callback();
    };
    tempImg.onerror = function() {
      imageData.theme = "default";
      callback();
    };
  }

  const themePromises = images.map(imageData => {
    return new Promise(resolve => {
      if (imageData.theme) {
        resolve();
      } else {
        assignDynamicTheme(imageData, resolve);
      }
    });
  });

  Promise.all(themePromises).then(() => {
    // Récupérer les thèmes disponibles
    const availableThemes = new Set();
    images.forEach(img => {
      if (img.theme) {
        availableThemes.add(img.theme);
      }
    });

    // Peupler dynamiquement le sélecteur de filtre
    function populateFilterOptions() {
      filterSelect.innerHTML = '';
      const optionAll = document.createElement('option');
      optionAll.value = 'all';
      optionAll.textContent = translations[userLanguage].themes.all;
      filterSelect.appendChild(optionAll);
      availableThemes.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme;
        filterSelect.appendChild(option);
      });
    }
    populateFilterOptions();
    updateGallery();
  });
  // --- Fin extraction des thèmes ---

  // Fonction d'affichage de la galerie depuis un tableau d'images
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

  // Mise à jour de la galerie filtrée par thème et triée par votes décroissants
  function updateGallery() {
    let filteredImages = images;
    const selectedTheme = filterSelect.value;
    if (selectedTheme !== 'all') {
      filteredImages = images.filter(img => img.theme === selectedTheme);
    }
    filteredImages.sort((a, b) => b.votes - a.votes);
    displayGallery(filteredImages);
  }

  filterSelect.addEventListener('change', updateGallery);

  // Fonctions de la modale
  function openModal(src, index) {
    modalImg.src = src;
    modal.classList.add('show');
    modalImg.classList.remove('zoomed');
    currentImageIndex = index;
    updateViewCount(index);
    updateShareCount(index);
    updateVoteCount(index);
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
        .then(() => { alert(translations[userLanguage].copied); })
        .catch((error) => {
          alert(translations[userLanguage].copyError);
          console.error(translations[userLanguage].copyError, error);
        });
    } else {
      alert(translations[userLanguage].shareError);
    }
  });

  // Gestion du vote
  voteButton.addEventListener('click', function() {
    images[currentImageIndex].votes++;
    updateVoteCount(currentImageIndex);
    saveImageData();
    updateGallery();
  });

  function updateVoteCount(index) {
    voteCountLabel.textContent = 'Votes : ' + images[index].votes;
  }

  function enregistrerPartage(index) {
    images[index].shares++;
    updateShareCount(index);
    saveImageData();
  }

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

  // Enregistrement du Service Worker pour la mise en cache
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker enregistré avec succès, scope :', registration.scope);
        })
        .catch(error => {
          console.error('Échec du Service Worker :', error);
        });
    });
  }

  // Fonction pour masquer le splash screen après au moins 10 s
  function hideSplashScreen() {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => { splash.style.display = "none"; }, 500);
    }
  }

  const splashMinimum = 10000; // 10 secondes en millisecondes
  const elapsed = Date.now() - window.splashStart;
  const remaining = Math.max(splashMinimum - elapsed, 0);
  setTimeout(hideSplashScreen, remaining);
});

