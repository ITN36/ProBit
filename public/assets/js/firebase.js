// Importamos la app base
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

// Importamos Auth y Base de datos
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// Tu configuración exacta (esta sí es la que te dio Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyAA-fiePqXtgxMzS0585rj8d657_z8_kSU",
    authDomain: "sistemaprobit.firebaseapp.com",
    projectId: "sistemaprobit",
    storageBucket: "sistemaprobit.firebasestorage.app",
    messagingSenderId: "290373592524",
    appId: "1:290373592524:web:8dd8d2f475146642752969",
    measurementId: "G-08TEXV5S3D"
};

// Inicializamos la app
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas
export const auth = getAuth(app);
export const db = getFirestore(app);
