// imageSignature.js

// Listes d'adjectifs et de noms pour générer un nom lisible
const adjectives = [
  "Brave", "Clever", "Happy", "Misty", "Bold",
  "Gentle", "Wild", "Calm", "Funky", "Bright",
  "Sly", "Fierce", "Silly", "Sunny", "Stormy"
];

const nouns = [
  "Panda", "Tiger", "Eagle", "Ocean", "Mountain",
  "Forest", "River", "Sky", "Comet", "Galaxy",
  "Phoenix", "Dragon", "Wolf", "Falcon", "Lion"
];

/**
 * Génère un nom lisible à partir d'un hash.
 * Utilise les 4 premiers caractères pour choisir un adjectif
 * et les 4 suivants pour choisir un nom.
 *
 * @param {string} hash - Le hash en chaîne hexadécimale.
 * @returns {string} Un nom au format "Adjectif Nom".
 */
function generateCommonName(hash) {
  if (!hash || hash.length < 8) {
    return "Unnamed";
  }
  const part1 = hash.substring(0, 4);
  const part2 = hash.substring(4, 8);
  const num1 = parseInt(part1, 16);
  const num2 = parseInt(part2, 16);
  const adjective = adjectives[num1 % adjectives.length];
  const noun = nouns[num2 % nouns.length];
  return adjective + " " + noun;
}

/**
 * Génère un nom unique en s'assurant que ce nom n'est pas déjà utilisé.
 * Ici, utilisé un Set 'usedNames' pour vérifier l'unicité.
 *
 * @param {string} hash - Le hash de l'image.
 * @param {Set} usedNames - Ensemble des noms déjà attribués.
 * @returns {string} Un nom unique.
 */
function generateUniqueCommonName(hash, usedNames) {
  let name = generateCommonName(hash);
  let counter = 1;
  while (usedNames.has(name)) {
    // On peut ajouter un suffixe pour différencier
    name = generateCommonName(hash) + " " + counter;
    counter++;
  }
  usedNames.add(name);
  return name;
}

/**
 * Extrait un hash MD5 d'une image via canvas.
 * Si le protocole est "file:" (local), renvoie "default" pour éviter des problèmes CORS.
 *
 * @param {string} imageUrl - URL de l'image.
 * @param {function(string|null): void} callback - Callback recevant le hash ou null en cas d'erreur.
 */
function getImageSignature(imageUrl, callback) {
  if (window.location.protocol === "file:") {
    console.warn("Mode local détecté, extraction du hash ignorée.");
    callback("default");
    return;
  }
  
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imageUrl;
  
  img.onload = function() {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      const hash = SparkMD5.hash(dataURL);
      callback(hash);
    } catch (err) {
      console.error("Erreur lors de l'extraction du hash:", err);
      callback(null);
    }
  };

  img.onerror = function() {
    console.error("Erreur de chargement de l'image pour l'extraction du hash.");
    callback(null);
  };
}

/**
 * Notification push pour indiquer le nom final de l'image.
 * Si l'utilisateur est dans Telegram ou si les notifications sont autorisées, affiche une notification.
 *
 * @param {string} name - Le nom de l'image.
 */
function notifyFinalName(name) {
  if (!("Notification" in window)) {
    console.log("Les notifications ne sont pas disponibles dans ce navigateur.");
  } else if (Notification.permission === "granted") {
    new Notification("Nom de l'image", { body: name });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Nom de l'image", { body: name });
      }
    });
  }
}

// Export (si nécessaire dans un environnement modulaire)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateCommonName,
    generateUniqueCommonName,
    getImageSignature,
    notifyFinalName
  };
}

