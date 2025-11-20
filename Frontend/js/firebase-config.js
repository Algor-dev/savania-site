// ===== CONFIGURATION FIREBASE - SAVANIA ENTERPRISE =====
// Ce fichier initialise la connexion à la base de données Firebase

// Configuration Firebase - À REMPLACER AVEC VOS CLÉS
const firebaseConfig = {
  apiKey: "AIzaSyBIEKk9ijRz0ilg0dfhH_ZnebM-K03qy5U",
  authDomain: "savania-a8fdd.firebaseapp.com",
  projectId: "savania-a8fdd",
  storageBucket: "savania-a8fdd.firebasestorage.app",
  messagingSenderId: "891693775472",
  appId: "1:891693775472:web:23711b1c7be5c6b17592b5",
  measurementId: "G-SYDQ0JFSN4"
};

// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);

// Références aux services Firebase
const db = firebase.firestore();          // Base de données Firestore
const auth = firebase.auth();             // Authentification
const storage = firebase.storage();       // Stockage fichiers

// Export des références pour utilisation dans autres fichiers
window.savaniaDB = db;
window.savaniaAuth = auth;
window.savaniaStorage = storage;

console.log('✅ Firebase initialisé pour SAVANIA');
