// Smooth scroll implementation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Hover effect for interactive elements
const cards = document.querySelectorAll('.bg-surface-container-lowest');
cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
        card.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0px)';
    });
});

// Password visibility toggle logic
const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');
const togglePasswordIcon = document.querySelector('#togglePasswordIcon');

if (togglePassword && password && togglePasswordIcon) {
    togglePassword.addEventListener('click', function () {
        // Toggle the type attribute
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        // Toggle the icon
        togglePasswordIcon.textContent = type === 'password' ? 'visibility_off' : 'visibility';
    });
}

// --- CÓDIGO PARA REGISTRAR EN FIREBASE ---

// 1. Traemos auth y db desde el archivo firebase.js que acabas de crear
import { auth, db } from './firebase.js';

// 2. Traemos las funciones de Firebase para crear cuentas y guardar datos
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// 3. Buscamos tu formulario en el HTML (recuerda que le pusiste id="registroForm")
const registroForm = document.getElementById('registroForm');

if (registroForm) {
    // 4. Le decimos que escuche cuando intenten enviar el formulario
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue sola

        // 5. Sacamos los textos que el usuario escribió en las cajas
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // 6. Firebase: Crea la cuenta con el correo y contraseña
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 7. Firebase: Guarda el nombre en la base de datos (Firestore)
            await setDoc(doc(db, "usuarios", user.uid), {
                nombre: name,
                correo: email
            });

            window.showToast("¡Cuenta creada exitosamente! Redirigiendo...", "success");
            setTimeout(() => {
                window.location.href = "inicio-sesion.html";
            }, 2000);

        } catch (error) {
            console.error("Error al registrar:", error);
            window.showToast("Hubo un error al registrar: " + error.message, "error");
        }
    });
}

// Simple script to toggle visual strikethrough on tasks when checked to provide immediate visual feedback
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.probit-checkbox');

    checkboxes.forEach(box => {
        box.addEventListener('change', (e) => {
            const labelOrTitle = e.target.nextElementSibling;
            if (labelOrTitle) {
                if (e.target.checked) {
                    labelOrTitle.style.opacity = '0.5';
                    labelOrTitle.style.textDecoration = 'line-through';
                } else {
                    labelOrTitle.style.opacity = '1';
                    labelOrTitle.style.textDecoration = 'none';
                }
            }
        });
    });
});

// Toast Notification System
window.showToast = function(message, type = 'success') {
    const toast = document.createElement('div');
    const isError = type === 'error';
    const bgColor = isError ? 'bg-error text-on-error' : 'bg-primary text-on-primary';
    const icon = isError ? 'error' : 'check_circle';
    
    toast.className = `fixed top-6 right-6 ${bgColor} px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-x-[150%] z-50`;
    toast.innerHTML = `
        <span class="material-symbols-outlined">${icon}</span>
        <span class="font-body-md font-medium">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-[150%]');
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        toast.classList.add('translate-x-[150%]');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// --- CÓDIGO PARA INICIAR SESIÓN EN FIREBASE ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            window.showToast("Por favor llena todos los campos.", "error");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.showToast("¡Inicio de sesión exitoso!", "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            let errorMessage = "Correo o contraseña incorrectos. Por favor, crea una cuenta si no la tienes.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                errorMessage = "Usuario no registrado o credenciales inválidas. Por favor crea una cuenta.";
            }
            window.showToast(errorMessage, "error");
        }
    });
}
