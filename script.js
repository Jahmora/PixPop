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
    const totalImages = 11; // Mettez le nombre total d'images que vous avez

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
            this.src = 'image-placeholder.png'; // Une image de remplacement si l'image ne charge pas
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
    }

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

    // Bouton Partager
    shareButton.addEventListener('click', function() {
        const shareData = {
            title: 'Découvrez cette image sur PixPop !',
            text: 'Une superbe image que je souhaite partager avec vous.',
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData)
            .then(() => console.log('Partage réussi'))
            .catch((error) => console.log('Erreur lors du partage', error));
        } else {
            // Alternative pour les navigateurs qui ne supportent pas l'API Web Share
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

