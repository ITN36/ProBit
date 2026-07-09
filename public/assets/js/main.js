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

// Sidebar toggle logic for mobile dashboard
const openSidebarBtn = document.getElementById('openSidebarBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (openSidebarBtn && sidebar && sidebarOverlay) {
    function toggleSidebar() {
        const isOpen = !sidebar.classList.contains('-translate-x-full');
        if (isOpen) {
            // Close
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.remove('opacity-100');
            sidebarOverlay.classList.add('opacity-0');
            setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
        } else {
            // Open
            sidebarOverlay.classList.remove('hidden');
            setTimeout(() => {
                sidebar.classList.remove('-translate-x-full');
                sidebarOverlay.classList.remove('opacity-0');
                sidebarOverlay.classList.add('opacity-100');
            }, 10);
        }
    }

    openSidebarBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);
}

// --- CÓDIGO PARA REGISTRAR EN FIREBASE ---

// 1. Traemos auth y db desde el archivo firebase.js que acabas de crear
import { auth, db } from './firebase.js';

// 2. Traemos las funciones de Firebase para crear cuentas y guardar datos
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
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

// --- CÓDIGO PARA PROVEEDORES SOCIALES ---
const googleBtns = document.querySelectorAll('#googleLoginBtn');
if (googleBtns.length > 0) {
    const provider = new GoogleAuthProvider();
    googleBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                
                // Guardar/Actualizar en Firestore por seguridad
                await setDoc(doc(db, "usuarios", user.uid), {
                    nombre: user.displayName || 'Usuario Google',
                    correo: user.email
                }, { merge: true }); // merge:true para no sobreescribir datos si ya existía
                
                window.showToast("¡Bienvenido con Google!", "success");
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            } catch (error) {
                console.error("Error al iniciar con Google:", error);
                window.showToast("Ocurrió un error con Google: " + error.message, "error");
            }
        });
    });
}

// --- CÓDIGO PARA EL POMODORO TIMER ---
const displayEl = document.getElementById('timer-display');
if (displayEl) {
    const MODES = {
        pomodoro: { time: 25 * 60, label: 'Tiempo de Enfoque' },
        shortBreak: { time: 5 * 60, label: 'Descanso Corto' },
        longBreak: { time: 15 * 60, label: 'Descanso Largo' }
    };

    let currentMode = 'pomodoro';
    let timeLeft = MODES[currentMode].time;
    let isRunning = false;
    let timerInterval = null;

    const labelEl = document.getElementById('timer-label');
    const playPauseBtn = document.getElementById('btn-play-pause');
    const playPauseIcon = document.getElementById('play-pause-icon');
    const resetBtn = document.getElementById('btn-reset');
    const timerContainer = document.querySelector('.timer-container');
    const modeButtons = document.querySelectorAll('#timer-modes button');

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateDisplay() {
        displayEl.textContent = formatTime(timeLeft);
    }

    function setMode(mode) {
        currentMode = mode;
        timeLeft = MODES[mode].time;
        labelEl.textContent = MODES[mode].label;
        updateDisplay();
        pauseTimer();

        // Update mode buttons styling
        modeButtons.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-[0_2px_8px_rgba(0,0,0,0.05)]');
                btn.classList.remove('text-on-surface-variant');
            } else {
                btn.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-[0_2px_8px_rgba(0,0,0,0.05)]');
                btn.classList.add('text-on-surface-variant');
            }
        });
    }

    function toggleTimer() {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    function startTimer() {
        if (timeLeft === 0) return;
        isRunning = true;
        playPauseIcon.textContent = 'pause';
        timerContainer.classList.add('timer-active');

        timerInterval = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                pauseTimer();
                // Optional: play sound or notification here
            }
        }, 1000);
    }

    function pauseTimer() {
        isRunning = false;
        playPauseIcon.textContent = 'play_arrow';
        timerContainer.classList.remove('timer-active');
        clearInterval(timerInterval);
    }

    function resetTimer() {
        pauseTimer();
        timeLeft = MODES[currentMode].time;
        updateDisplay();
    }

    // Event Listeners
    if (playPauseBtn) playPauseBtn.addEventListener('click', toggleTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    if (modeButtons) {
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                setMode(btn.dataset.mode);
            });
        });
    }

    // Initialize
    updateDisplay();
}

// --- CÓDIGO PARA TAREAS ---
const taskCheckboxes = document.querySelectorAll('.task-checkbox');
if (taskCheckboxes.length > 0) {
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const checkIcon = this.nextElementSibling;
            if (this.checked) {
                if (checkIcon) checkIcon.classList.remove('opacity-0');
                this.parentElement.parentElement.classList.add('opacity-60', 'scale-[0.99]');
            } else {
                if (checkIcon) checkIcon.classList.add('opacity-0');
                this.parentElement.parentElement.classList.remove('opacity-60', 'scale-[0.99]');
            }
        });
    });

    // Input focus animation
    const taskInput = document.querySelector('input[type="text"]');
    if (taskInput) {
        taskInput.addEventListener('focus', () => {
            taskInput.parentElement.classList.add('scale-[1.01]');
        });
        taskInput.addEventListener('blur', () => {
            taskInput.parentElement.classList.remove('scale-[1.01]');
        });
    }
}

// --- SCROLL HIDDEN BOTTOM NAV ---
const bottomNav = document.getElementById('mobile-bottom-nav');
const scrollableMain = document.querySelector('main');
let lastScrollTop = 0;

if (bottomNav && scrollableMain) {
    scrollableMain.addEventListener('scroll', () => {
        let scrollTop = scrollableMain.scrollTop;
        
        // Hide on scroll down, show on scroll up. Threshold to avoid jitter.
        if (Math.abs(scrollTop - lastScrollTop) > 5) {
            if (scrollTop > lastScrollTop && scrollTop > 50) {
                // Downscroll - hide it
                bottomNav.style.transform = 'translateY(100%)';
            } else {
                // Upscroll - show it
                bottomNav.style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
        }
    }, { passive: true });
}
