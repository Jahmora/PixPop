// Fonction pour détecter si l'application est ouverte dans le navigateur Telegram
function isTelegramWebView() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /Telegram/i.test(userAgent);
}

document.addEventListener('DOMContentLoaded', function() {
    // Détection de la langue de l'utilisateur
    function detectUserLanguage() {
        const language = navigator.language || navigator.userLanguage;
        return language.startsWith('fr') ? 'fr' : 'en';
    }

    // Objets de traductions avec les libellés souhaités pour le basculement du thème
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

    // Détecter la langue de l'utilisateur et appliquer les traductions sur les éléments statiques
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

    // Nombre total d'images (à adapter avec vos ressources)
    const totalImages = 51;
    const images = [];

    // Charger les données à partir du localStorage ou initialiser les informations pour chaque image
    for (let i = 1; i <= totalImages; i++) {
        const imageKey = `image${i}`;
        const storedImage = localStorage.getItem(imageKey);
        const imageData = storedImage 
            ? JSON.parse(storedImage) 
            : { src: `image${i}.png`, alt: `Image ${i}`, views: 0, shares: 0 };
        images.push(imageData);
    }

    // Fonction de sauvegarde des données d'images dans le localStorage
    function saveImageData() {
        images.forEach((image, index) => {
            const imageKey = `image${index + 1}`;
            localStorage.setItem(imageKey, JSON.stringify(image));
        });
    }

    // Création de la galerie
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

            // Précharger l'image suivante si possible
            if (index + 1 < images.length) {
                const nextImg = new Image();
                nextImg.src = images[index + 1].src;
            }
        });

        // Gérer le cas où l'image ne chargerait pas
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

    // Fermer la modale
    function closeModal() {
        modal.classList.remove('show');
        modalImg.classList.remove('zoomed');
    }

    // Gestion de la fermeture (croix ou clic hors modale)
    span.onclick = closeModal;
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };

    // Permettre le zoom au clic sur l'image de la modale
    modalImg.addEventListener('click', function() {
        modalImg.classList.toggle('zoomed');
    });

    // Basculer le thème : si le thème sombre est activé, afficher "Mode Clair", sinon "Mode Sombre"
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            themeToggle.textContent = translations[userLanguage].themeToggleLight;
        } else {
            themeToggle.textContent = translations[userLanguage].themeToggleDark;
        }
    });

    // Fonctionnalité du bouton "Partager"
    shareButton.addEventListener('click', function() {
        const botUsername = 'PixPopBot'; // Remplacez par le nom exact de votre bot
        const botLink = `https://t.me/${botUsername}`;
        const imageUrl = modalImg.src;
        const shareText = `Découvrez cette image sur PixPop !`;

        // Incrémenter le compteur de partages pour l'image en cours
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

    // Enregistrer un partage pour la photo affichée dans la modale
    function enregistrerPartage(index) {
        images[index].shares++;
        updateShareCount(index);
        saveImageData();
    }

    // Incrémenter le compteur de vues pour une image
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
