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
    const totalImages = 28; // Remplacez par le nombre total de vos images

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
        modalImg.classList.remove('zoomed');
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

    if (isTelegramWebView() || navigator.share) {
        shareButton.innerHTML = '<i class="fas fa-share-alt"></i> Partager l\'image';
    } else if (navigator.clipboard) {
        shareButton.innerHTML = '<i class="fas fa-copy"></i> Copier les liens';
    } else {
        shareButton.style.display = 'none'; // Cache le bouton si aucune option n'est disponible
    }

    // Fonctionnalité du bouton "Partager"
    shareButton.addEventListener('click', function() {
        const botUsername = 'PixPopBot'; // Remplacez par le nom exact de votre bot
        const botLink = `https://t.me/${botUsername}`;
        const imageUrl = modalImg.src; // URL de l'image cliquée
        const shareText = `Découvrez cette image sur PixPop !`;

        if (isTelegramWebView()) {
            // Partage via l'interface de Telegram avec l'image
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(shareText)}%0ARejoignez-nous sur ${botLink}`;
            window.open(shareUrl, '_blank');
        } else if (navigator.share) {
            // Partage via l'API Web Share avec l'image
            navigator.share({
                title: 'PixPop',
                text: `${shareText}\nRejoignez-nous sur ${botLink}`,
                url: imageUrl,
            })
            .then(() => console.log('Partage réussi'))
            .catch((error) => console.log('Erreur lors du partage', error));
        } else if (navigator.clipboard) {
            // Copier le lien de l'image et du bot dans le presse-papiers
            const textToCopy = `${shareText}\n${imageUrl}\nRejoignez-nous sur ${botLink}`;
            navigator.clipboard.writeText(textToCopy)
            .then(() => {
                alert('Les liens de l\'image et du bot ont été copiés dans le presse-papiers.');
            })
            .catch((error) => {
                alert('Impossible de copier les liens.');
                console.error('Erreur lors de la copie des liens', error);
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
