document.addEventListener('DOMContentLoaded', function() {
    const images = [];
    for (let i = 1; i <= 10; i++) {
        images.push({ src: `image${i}.png`, alt: `Image ${i}` });
    }

    const gallery = document.getElementById('gallery');
    images.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = image.src;
        imgElement.alt = image.alt;
        imgElement.addEventListener('click', function() {
            openModal(this.src);
        });
        gallery.appendChild(imgElement);
    });

    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const span = document.getElementsByClassName('close')[0];

    function openModal(src) {
        modal.style.display = 'block';
        modalImg.src = src;
    }

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});
const axios = require('axios');
const token = '7666556234:AAF4wof7ukV_V5Ynkvta683XwpJTajpsiMQ';
const url = 'https://jahmora.github.io/PixPop/';

axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
    url: url
})
.then(response => {
    console.log('Webhook set:', response.data);
})
.catch(error => {
    console.error('Error setting webhook:', error);
});

