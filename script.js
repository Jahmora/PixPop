// Fonction pour détecter si l'application est ouverte dans le navigateur Telegram
function isTelegramWebView() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /Telegram/i.test(userAgent);
}

document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour détecter la langue de l'utilisateur
    function detectUserLanguage() {
        const language = navigator.language || navigator.userLanguage;
        return language.startsWith('fr') ? 'fr' : 'en'; // Adapté pour détecter le français ou l'anglais
    }

    // Traductions pour les différents éléments de l'application
    const translations = {
        en: {
            themeToggle: '🌙 Dark Mode',
            header: 'PixPop - Image Gallery',
            shareButton: 'Share',
            viewCount: 'Views: ',
            shareCount: 'Shares: ',
            startSlideshow: 'Start Slideshow',
            stopSlideshow: 'Stop Slideshow',
            copied: 'Links copied to clipboard.',
            copyError: 'Unable to copy links.',
            shareError: 'Sharing not supported on this browser.'
        },
        fr: {
            themeToggle: '🌙 Mode Sombre',
            header: 'PixPop - Galerie d\'Images',
            shareButton: 'Partager',
            viewCount: 'Vues : ',
            shareCount: 'Partages : ',
            startSlideshow: 'Démarrer le Diaporama',
            stopSlideshow: 'Arrêter le Diaporama',
            copied: 'Les liens de l\'image et du bot ont été copiés dans le presse-papiers.',
            copyError: 'Impossible de copier les liens.',
            shareError: 'Le partage n\'est pas supporté sur ce navigateur.'
        }
    };

    // Appliquer les traductions en fonction de la langue détectée
    function applyTranslations(language) {
        document.getElementById('theme-toggle').textContent = translations[language].themeToggle;
        document.querySelector('h1').textContent = translations[language].header;
        document.getElementById('share-button').innerHTML = `<i class="fas fa-share-alt"></i> ${translations[language].shareButton}`;
        document.getElementById('view-count').textContent = translations[language].viewCount + '0';
        document.getElementById('share-count').textContent = translations[language].shareCount + '0';
    }

    // Détection de la langue de l'utilisateur
    const userLanguage = detectUserLanguage();
    applyTranslations(userLanguage);

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

    // Liste des images
    const images = [];
    const totalImages = 51; // Remplacez par le nombre total de vos images

    // Charger les données à partir du stockage local ou initialiser les images
    for (let i = 1; i <= totalImages; i++) {
        const imageKey = `image${i}`;
        const storedImage = localStorage.getItem(imageKey);
        const imageData = storedImage ? JSON.parse(storedImage) : { src: `image${i}.png`, alt: `Image ${i}`, views: 0, shares: 0 };
        images.push(imageData);
    }

    // Enregistrer les données dans le stockage local
    function saveImageData() {
        images.forEach((image, index) => {
            const imageKey = `image${index + 1}`;
            localStorage.setItem(imageKey, JSON.stringify(image));
        });
    }

    // Création de la galerie
    images.forEach((image, index) => {
        // Création des images de la galerie
        const imgElement = document.createElement('img');
        imgElement.src = image.src;
        imgElement.alt = image.alt;

        // Événement de clic sur l'image
        imgElement.addEventListener('click', function() {
            openModal(this.src, index);
            incrementViewCount(index);

            // Précharge l'image suivante si elle existe
            if (index + 1 < images.length) {
                const nextImg = new Image();
                nextImg.src = images[index + 1].src;
            }
        });

        // Gestion des erreurs de chargement
        imgElement.onerror = function() {
            this.src = 'image-placeholder.png'; // Image de remplacement si l'image ne se charge pas
            this.alt = 'Image non disponible';
        };

        gallery.appendChild(imgElement);
    });

    // Ouvrir le modal
    function openModal(src, index) {
        modalImg.src = src;
        modal.classList.add('show');
        modalImg.classList.remove('zoomed');
        currentImageIndex = index;
        updateViewCount(index);
        updateShareCount(index);
    }

    // Fermer le modal
    function closeModal() {
        modal.classList.remove('show');
        modalImg.classList.remove('zoomed');
    }

    span.onclick = closeModal;

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    };

    // Zoom sur l'image
    modalImg.addEventListener('click', function() {
        modalImg.classList.toggle('zoomed');
    });

    // Basculer le thème
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            themeToggle.textContent = translations[userLanguage].startSlideshow;
        } else {
            themeToggle.textContent = translations[userLanguage].stopSlideshow;
        }
    });

    // Fonctionnalité du bouton "Partager"
    shareButton.addEventListener('click', function() {
        const botUsername = 'PixPopBot'; // Remplacez par le nom exact de votre bot
        const botLink = `https://t.me/${botUsername}`;
        const imageUrl = modalImg.src; // URL de l'image cliquée
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

    // Fonction pour enregistrer le partage
    function enregistrerPartage(index) {
        images[index].shares++;
        updateShareCount(index);
        saveImageData();
    }

    // Fonction pour incrémenter le compteur de vues
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
});
