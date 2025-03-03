// Fonction pour détecter si l'application est ouverte dans le navigateur Telegram
function isTelegramWebView() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /Telegram/i.test(userAgent);
}

document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const span = document.getElementsByClassName('close')[0];
    const themeToggle = document.getElementById('theme-toggle');
    const shareButton = document.getElementById('share-button');
    let currentImageIndex = 0;

    // Liste des images
    const images = [];
    const totalImages = 11; // Remplacez par le nombre total de vos images

    for (let i = 1; i <= totalImages; i++) {
        images.push({ src: `image${i}.png`, alt: `Image ${i}` });
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
        currentImageIndex = index;
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
            themeToggle.textContent = '☀️ Mode Clair';
        } else {
            themeToggle.textContent = '🌙 Mode Sombre';
        }
    });

    // Afficher le bouton "Partager" et adapter son texte
    shareButton.style.display = 'block';

    if (isTelegramWebView()) {
        shareButton.innerHTML = '<i class="fas fa-share-alt"></i> Partager sur Telegram';
    } else if (navigator.share) {
        shareButton.innerHTML = '<i class="fas fa-share-alt"></i> Partager';
    } else if (navigator.clipboard) {
        shareButton.innerHTML = '<i class="fas fa-copy"></i> Copier le lien';
    } else {
        shareButton.style.display = 'none'; // Cache le bouton si aucune option n'est disponible
    }

    // Fonctionnalité du bouton "Partager"
    shareButton.addEventListener('click', function() {
        const imageUrl = modalImg.src;
        const shareText = 'Découvrez cette image sur PixPop !';

        if (isTelegramWebView()) {
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(shareText)}`;
            window.open(shareUrl, '_blank');
        } else if (navigator.share) {
            navigator.share({
                title: 'PixPop',
                text: shareText,
                url: imageUrl,
            })
            .then(() => console.log('Partage réussi'))
            .catch((error) => console.log('Erreur lors du partage', error));
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(imageUrl)
            .then(() => {
                alert('Le lien de l\'image a été copié dans le presse-papiers.');
            })
            .catch((error) => {
                alert('Impossible de copier le lien.');
                console.error('Erreur lors de la copie du lien', error);
            });
        } else {
            alert('Le partage n\'est pas supporté sur ce navigateur.');
        }
    });

    // Navigation au clavier pour fermer le modal (facultatif)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});

