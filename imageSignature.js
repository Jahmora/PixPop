// imageSignature.js

// Listes pré-définies d’adjectifs et de noms
const adjectives = [
  "Brave", "Clever", "Happy", "Misty", "Bold",
  "Gentle", "Wild", "Calm", "Funky", "Bright"
];

const nouns = [
  "Panda", "Tiger", "Eagle", "Ocean", "Mountain",
  "Forest", "River", "Sky", "Comet", "Galaxy"
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
 * Extrait un hash MD5 d'une image en utilisant un canvas.
 * Si le site est lancé en mode local (file://), la fonction renvoie "default"
 * pour éviter les erreurs CORS.
 *
 * @param {string} imageUrl - L'URL de l'image.
 * @param {function(string|null): void} callback - Callback qui reçoit le hash.
 */
function getImageSignature(imageUrl, callback) {
  // Si le site est exécuté en local, on ne tente pas l'extraction
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
      // SparkMD5.hash doit être disponible (vérifiez que SparkMD5 est inclus dans votre HTML)
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

// Export (si nécessaire pour les environnements modulaires)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateCommonName, getImageSignature };
}
