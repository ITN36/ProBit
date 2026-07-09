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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, addDoc, onSnapshot, query, where, orderBy, updateDoc, deleteDoc, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// 3. Buscamos tu formulario en el HTML (recuerda que le pusiste id="registroForm")
const registroForm = document.getElementById('registroForm');

if (registroForm) {
    // 4. Le decimos que escuche cuando intenten enviar el formulario
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue sola

        // 5. Sacamos los textos que el usuario escribió en las cajas
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // 6. Firebase: Crea la cuenta con el correo y contraseña
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 7. Firebase: Guarda el nombre en la base de datos (Firestore)
            await setDoc(doc(db, "usuarios", user.uid), {
                firstName: firstName,
                lastName: lastName,
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

    // --- TASK MODAL LOGIC ---
    const openTaskModalBtn = document.getElementById('open-task-modal-btn');
    const closeTaskModalBtn = document.getElementById('close-task-modal-btn');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const taskModalOverlay = document.getElementById('task-modal-overlay');
    const taskModalContent = document.getElementById('task-modal-content');

    if (openTaskModalBtn && taskModalOverlay) {
        const openModal = () => {
            taskModalOverlay.classList.remove('hidden');
            // trigger reflow
            void taskModalOverlay.offsetWidth;
            taskModalOverlay.classList.remove('opacity-0');
            taskModalOverlay.classList.add('opacity-100');
            
            taskModalContent.classList.remove('scale-95', 'opacity-0');
            taskModalContent.classList.add('scale-100', 'opacity-100');
        };

        const closeModal = () => {
            taskModalOverlay.classList.remove('opacity-100');
            taskModalOverlay.classList.add('opacity-0');
            
            taskModalContent.classList.remove('scale-100', 'opacity-100');
            taskModalContent.classList.add('scale-95', 'opacity-0');
            
            setTimeout(() => {
                taskModalOverlay.classList.add('hidden');
            }, 300);
        };

        openTaskModalBtn.addEventListener('click', openModal);
        closeTaskModalBtn.addEventListener('click', closeModal);
        cancelTaskBtn.addEventListener('click', closeModal);
        
        // Close on overlay click
        taskModalOverlay.addEventListener('click', (e) => {
            if (e.target === taskModalOverlay) {
                closeModal();
            }
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

// --- MANEJO DE SESIÓN Y TAREAS (FIREBASE) ---
let currentUser = null;
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const publicPages = ['inicio-sesion.html', 'registro.html', 'index.html', ''];

let currentUserProfile = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        if (publicPages.includes(currentPage)) {
            window.location.href = "dashboard.html";
            return;
        }
        
        // Fetch User Profile
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
            currentUserProfile = userDoc.data();
        } else {
            currentUserProfile = {};
        }
        
        // Update Greeting
        const greetingEl = document.getElementById('user-greeting');
        if (greetingEl) {
            let displayNombre = "Usuario";
            if (currentUserProfile.firstName) {
                displayNombre = currentUserProfile.firstName;
            } else if (currentUserProfile.nombre) {
                // Fallback para usuarios viejos
                displayNombre = currentUserProfile.nombre.split(' ')[0];
            }
            greetingEl.textContent = `Hola, ${displayNombre}`;
        }
        
        setupSettingsModal();
        setupTaskModal();
        
        if (!currentUserProfile.timezone) {
            openSettingsModal(true);
        }

        if (currentPage === 'tareas.html' || currentPage === 'dashboard.html' || currentPage === 'pomodoro.html') {
            loadUserTasks(user.uid);
        }
    } else {
        currentUser = null;
        currentUserProfile = null;
        if (!publicPages.includes(currentPage)) {
            window.location.href = "inicio-sesion.html";
        }
    }
});

// Referencias del DOM para Tareas
const tasksContainer = document.getElementById('tasks-container');
const emptyStateContainer = document.getElementById('empty-state-container');
let saveTaskBtn = document.getElementById('save-task-btn');
let taskTitleInput = document.getElementById('task-title-input');
let taskDescInput = document.getElementById('task-desc-input');
let taskDescCount = document.getElementById('task-desc-count');
let taskDateInput = document.getElementById('task-date-input');
let taskTimeInput = document.getElementById('task-time-input');

// Referencias del Modal de Tareas
let taskModalTitle;
let taskModalOverlay;
let taskModalContent;
let openTaskModalBtn;
let closeTaskModalBtn;
let cancelTaskBtn;

// Referencias del Modal de Eliminación
let deleteModalOverlay;
let deleteModalContent;
let cancelDeleteBtn;
let confirmDeleteBtn;

let currentEditingTaskId = null;
let taskIdToDelete = null;

if (taskDescInput && taskDescCount) {
    taskDescInput.addEventListener('input', (e) => {
        taskDescCount.textContent = e.target.value.length;
    });
}

function openTaskModal(taskId = null, taskData = null) {
    if (taskModalOverlay && taskModalContent) {
        currentEditingTaskId = taskId;
        
        if (taskId && taskData) {
            taskModalTitle.textContent = "Editar Tarea";
            taskTitleInput.value = taskData.title || "";
            if (taskDescInput) {
                taskDescInput.value = taskData.description || "";
                if (taskDescCount) taskDescCount.textContent = taskDescInput.value.length;
            }
            taskDateInput.value = taskData.date || "";
            taskTimeInput.value = taskData.time || "";
            
            const radio = document.querySelector(`input[name="task-energy"][value="${taskData.energy || 'baja'}"]`);
            if (radio) radio.checked = true;
        } else {
            taskModalTitle.textContent = "Nueva Tarea";
            taskTitleInput.value = "";
            if (taskDescInput) {
                taskDescInput.value = "";
                if (taskDescCount) taskDescCount.textContent = "0";
            }
            taskDateInput.value = "";
            taskTimeInput.value = "";
            const defaultRadio = document.querySelector('input[name="task-energy"][value="alta"]');
            if (defaultRadio) defaultRadio.checked = true;
        }

        taskModalOverlay.classList.remove('hidden');
        // trigger reflow
        void taskModalOverlay.offsetWidth;
        taskModalOverlay.classList.remove('opacity-0');
        taskModalContent.classList.remove('opacity-0', 'scale-95');
        taskModalContent.classList.add('opacity-100', 'scale-100');
    }
}

function closeTaskModal() {
    if (taskModalOverlay && taskModalContent) {
        taskModalOverlay.classList.add('opacity-0');
        taskModalContent.classList.remove('opacity-100', 'scale-100');
        taskModalContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            taskModalOverlay.classList.add('hidden');
        }, 300);
    }
}

// Funciones del Modal de Eliminación
function openDeleteModal(taskId) {
    taskIdToDelete = taskId;
    if (deleteModalOverlay && deleteModalContent) {
        deleteModalOverlay.classList.remove('hidden');
        void deleteModalOverlay.offsetWidth;
        deleteModalOverlay.classList.remove('opacity-0');
        deleteModalContent.classList.remove('opacity-0', 'scale-95');
        deleteModalContent.classList.add('opacity-100', 'scale-100');
    }
}

function closeDeleteModal() {
    taskIdToDelete = null;
    if (deleteModalOverlay && deleteModalContent) {
        deleteModalOverlay.classList.add('opacity-0');
        deleteModalContent.classList.remove('opacity-100', 'scale-100');
        deleteModalContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            deleteModalOverlay.classList.add('hidden');
        }, 300);
    }
}

function setupTaskModal() {
    if (document.getElementById('task-modal-overlay')) return;

    const modalsHtml = `
    <!-- Task Modal Overlay -->
    <div id="task-modal-overlay" class="fixed inset-0 bg-surface-variant/60 backdrop-blur-sm z-50 hidden opacity-0 transition-opacity duration-300 flex items-center justify-center p-4">
        <!-- Modal Content -->
        <div id="task-modal-content" class="bg-surface rounded-[2rem] shadow-2xl w-full max-w-lg border border-outline-variant/30 transform scale-95 opacity-0 transition-all duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="px-8 py-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest">
                <h3 id="task-modal-title" class="font-headline-md text-headline-md text-primary font-bold">Nueva Tarea</h3>
                <button id="close-task-modal-btn" class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <!-- Body -->
            <div class="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <!-- Title Input -->
                <div class="space-y-2">
                    <label class="font-label-md text-label-md text-on-surface-variant">Título de la Tarea *</label>
                    <input id="task-title-input" type="text" placeholder="Ej. Rediseñar página de inicio..." class="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-4 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                </div>
                <!-- Description Input -->
                <div class="space-y-2">
                    <label class="font-label-md text-label-md text-on-surface-variant flex justify-between">
                        Descripción <span class="text-[10px] opacity-60 font-normal uppercase">(Opcional)</span>
                    </label>
                    <textarea id="task-desc-input" placeholder="Añade detalles o notas adicionales..." maxlength="150" rows="3" class="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-4 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"></textarea>
                    <div class="text-right text-[10px] text-on-surface-variant opacity-60"><span id="task-desc-count">0</span> / 150</div>
                </div>
                <!-- Energy Selection (Chips) -->
                <div class="space-y-3">
                    <label class="font-label-md text-label-md text-on-surface-variant">Nivel de Energía *</label>
                    <div class="grid grid-cols-3 gap-3">
                        <label class="cursor-pointer group relative">
                            <input type="radio" name="task-energy" value="alta" class="peer sr-only" checked>
                            <div class="w-full text-center py-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-on-surface peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary-container transition-all hover:bg-surface-container">
                                <span class="font-label-md text-label-md flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined text-[18px]">bolt</span> Alta
                                </span>
                            </div>
                        </label>
                        <label class="cursor-pointer group relative">
                            <input type="radio" name="task-energy" value="media" class="peer sr-only">
                            <div class="w-full text-center py-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-on-surface peer-checked:bg-secondary-container peer-checked:text-on-secondary-container peer-checked:border-secondary-container transition-all hover:bg-surface-container">
                                <span class="font-label-md text-label-md flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined text-[18px]">battery_charging_50</span> Media
                                </span>
                            </div>
                        </label>
                        <label class="cursor-pointer group relative">
                            <input type="radio" name="task-energy" value="baja" class="peer sr-only">
                            <div class="w-full text-center py-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-on-surface peer-checked:bg-tertiary-container peer-checked:text-on-tertiary-container peer-checked:border-tertiary-container transition-all hover:bg-surface-container">
                                <span class="font-label-md text-label-md flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined text-[18px]">battery_20</span> Baja
                                </span>
                            </div>
                        </label>
                    </div>
                </div>
                <!-- Optional Date/Time -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="font-label-md text-label-md text-on-surface-variant flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">calendar_today</span> Fecha <span class="text-[10px] opacity-60 font-normal uppercase">(Opcional)</span></label>
                        <input id="task-date-input" type="date" class="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface-variant">
                    </div>
                    <div class="space-y-2">
                        <label class="font-label-md text-label-md text-on-surface-variant flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">schedule</span> Hora <span class="text-[10px] opacity-60 font-normal uppercase">(Opcional)</span></label>
                        <input id="task-time-input" type="time" class="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface-variant">
                    </div>
                </div>
            </div>
            <!-- Footer Actions -->
            <div class="px-8 py-6 border-t border-outline-variant/20 bg-surface-container-lowest flex justify-end gap-3">
                <button id="cancel-task-btn" class="px-6 py-3 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Cancelar</button>
                <button id="save-task-btn" class="px-6 py-3 rounded-xl font-label-md text-label-md bg-primary text-on-primary hover:bg-primary/90 shadow-md transition-all">Guardar Tarea</button>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="delete-modal-overlay" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300 flex items-center justify-center p-4">
        <!-- Modal Content -->
        <div id="delete-modal-content" class="bg-surface rounded-[2rem] shadow-2xl w-full max-w-sm border border-outline-variant/30 transform scale-95 opacity-0 transition-all duration-300 overflow-hidden flex flex-col">
            <div class="p-8 text-center space-y-4">
                <div class="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-2">
                    <span class="material-symbols-outlined text-[32px]">warning</span>
                </div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">¿Eliminar Tarea?</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">Esta acción no se puede deshacer. La tarea será eliminada permanentemente.</p>
            </div>
            <!-- Footer Actions -->
            <div class="px-8 py-6 border-t border-outline-variant/20 bg-surface-container-lowest flex justify-end gap-3">
                <button id="cancel-delete-btn" class="px-6 py-3 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Cancelar</button>
                <button id="confirm-delete-btn" class="px-6 py-3 rounded-xl font-label-md text-label-md bg-error text-on-error hover:bg-error/90 shadow-md transition-all flex items-center justify-center gap-2">Eliminar</button>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalsHtml);

    // Obtener las referencias recién creadas
    taskModalTitle = document.getElementById('task-modal-title');
    taskModalOverlay = document.getElementById('task-modal-overlay');
    taskModalContent = document.getElementById('task-modal-content');
    closeTaskModalBtn = document.getElementById('close-task-modal-btn');
    cancelTaskBtn = document.getElementById('cancel-task-btn');
    
    deleteModalOverlay = document.getElementById('delete-modal-overlay');
    deleteModalContent = document.getElementById('delete-modal-content');
    cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    
    openTaskModalBtn = document.getElementById('open-task-modal-btn');
    const dashboardNewTaskBtn = document.getElementById('dashboard-new-task-btn');

    // Reasignar inputs globales (ya que fueron declarados pero no encontrados al inicio de la carga)
    taskTitleInput = document.getElementById('task-title-input');
    taskDescInput = document.getElementById('task-desc-input');
    taskDescCount = document.getElementById('task-desc-count');
    taskDateInput = document.getElementById('task-date-input');
    taskTimeInput = document.getElementById('task-time-input');
    saveTaskBtn = document.getElementById('save-task-btn');

    if (taskDescInput && taskDescCount) {
        taskDescInput.addEventListener('input', (e) => {
            taskDescCount.textContent = e.target.value.length;
        });
    }

    // Attach listeners
    if (openTaskModalBtn) openTaskModalBtn.addEventListener('click', () => openTaskModal());
    if (dashboardNewTaskBtn) dashboardNewTaskBtn.addEventListener('click', () => openTaskModal());
    if (closeTaskModalBtn) closeTaskModalBtn.addEventListener('click', closeTaskModal);
    if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', closeTaskModal);
    if (taskModalOverlay) {
        taskModalOverlay.addEventListener('click', (e) => {
            if (e.target === taskModalOverlay) closeTaskModal();
        });
    }
    
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    if (deleteModalOverlay) {
        deleteModalOverlay.addEventListener('click', (e) => {
            if (e.target === deleteModalOverlay) closeDeleteModal();
        });
    }
    
    // Guardar Tarea Logic
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', async () => {
            if (!currentUser) return;
            
            const title = taskTitleInput.value.trim();
            if (!title) {
                if (window.showToast) window.showToast("El título de la tarea es obligatorio", "error");
                return;
            }
            
            const energyNode = document.querySelector('input[name="task-energy"]:checked');
            const energy = energyNode ? energyNode.value : 'baja';
            const date = taskDateInput.value;
            const time = taskTimeInput.value;
            const description = taskDescInput ? taskDescInput.value.trim() : "";
            
            // Validación de fecha y hora en el pasado
            if (date) {
                const userTz = (currentUserProfile && currentUserProfile.timezone) 
                    ? currentUserProfile.timezone 
                    : Intl.DateTimeFormat().resolvedOptions().timeZone;
                const todayStr = getTzDateString(Date.now(), userTz);
                
                if (date < todayStr) {
                    if (window.showToast) window.showToast("No puedes agendar una tarea para un día anterior", "error");
                    return;
                }
                
                if (date === todayStr && time) {
                    const nowTimeStr = new Intl.DateTimeFormat('en-GB', { 
                        timeZone: userTz, 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }).format(new Date());
                    
                    if (time < nowTimeStr) {
                        if (window.showToast) window.showToast("No puedes agendar una tarea en una hora pasada de hoy", "error");
                        return;
                    }
                }
            }
            
            saveTaskBtn.disabled = true;
            saveTaskBtn.classList.add('opacity-50');
            
            try {
                if (currentEditingTaskId) {
                    await updateDoc(doc(db, "tasks", currentEditingTaskId), {
                        title, description, energy, date, time
                    });
                    if (window.showToast) window.showToast("Tarea actualizada exitosamente", "success");
                } else {
                    await addDoc(collection(db, "tasks"), {
                        title, description, energy, date, time,
                        userId: currentUser.uid, completed: false, createdAt: serverTimestamp()
                    });
                    if (window.showToast) window.showToast("Tarea creada exitosamente", "success");
                }
                closeTaskModal();
            } catch (error) {
                console.error("Error al guardar tarea:", error);
                if (window.showToast) window.showToast("Hubo un error al guardar", "error");
            } finally {
                saveTaskBtn.disabled = false;
                saveTaskBtn.classList.remove('opacity-50');
            }
        });
    }
    
    // Eliminar Tarea Logic
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (!taskIdToDelete) return;
            
            const originalText = confirmDeleteBtn.innerHTML;
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.classList.add('opacity-50');
            confirmDeleteBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">refresh</span> Eliminando...';
            
            try {
                await deleteDoc(doc(db, "tasks", taskIdToDelete));
                if (window.showToast) window.showToast("Tarea eliminada", "success");
                closeDeleteModal();
            } catch (error) {
                console.error("Error al eliminar tarea:", error);
                if (window.showToast) window.showToast("Hubo un error al eliminar", "error");
            } finally {
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.classList.remove('opacity-50');
                confirmDeleteBtn.innerHTML = originalText;
            }
        });
    }
}


let allUserTasks = [];
let currentFilter = 'todas';
let currentStatusFilter = 'pendientes';

// Configurar Filtros de Energía
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Update active styles
        filterBtns.forEach(b => {
            b.classList.remove('bg-white', 'text-primary', 'shadow-sm');
            b.classList.add('text-on-surface-variant', 'hover:bg-surface');
        });
        const clickedBtn = e.target.closest('.filter-btn');
        clickedBtn.classList.remove('text-on-surface-variant', 'hover:bg-surface');
        clickedBtn.classList.add('bg-white', 'text-primary', 'shadow-sm');
        
        // Update filter state and re-render
        currentFilter = clickedBtn.dataset.filter;
        renderFilteredTasks();
    });
});

// Configurar Filtros de Estado (Pendientes / Completadas)
const statusTabs = document.querySelectorAll('.status-tab');
const emptyStateIcon = document.getElementById('empty-state-icon');
const emptyStateTitle = document.getElementById('empty-state-title');
const emptyStateDesc = document.getElementById('empty-state-desc');

statusTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        statusTabs.forEach(t => {
            t.classList.remove('bg-white', 'text-primary', 'shadow-sm');
            t.classList.add('text-on-surface-variant', 'hover:bg-surface');
        });
        const clickedTab = e.target.closest('.status-tab');
        clickedTab.classList.remove('text-on-surface-variant', 'hover:bg-surface');
        clickedTab.classList.add('bg-white', 'text-primary', 'shadow-sm');
        
        currentStatusFilter = clickedTab.dataset.status;
        renderFilteredTasks();
    });
});

function getTzDateString(timestamp, tz) {
    const d = new Date(timestamp);
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(d);
    
    let y, m, day;
    for (const p of parts) {
        if (p.type === 'year') y = p.value;
        if (p.type === 'month') m = p.value;
        if (p.type === 'day') day = p.value;
    }
    return `${y}-${m}-${day}`;
}

function renderFilteredTasks() {
    let filteredTasks = [];
    
    if (tasksContainer && emptyStateContainer) {
        tasksContainer.innerHTML = '';
        
        // 1. Filtrar por estado
        filteredTasks = allUserTasks.filter(task => {
            if (currentStatusFilter === 'pendientes') return task.completed === false;
            if (currentStatusFilter === 'completadas') return task.completed === true;
            return true;
        });

        // 2. Filtrar por energía
        if (currentFilter !== 'todas') {
            filteredTasks = filteredTasks.filter(task => task.energy === currentFilter);
        }
            
        if (filteredTasks.length === 0) {
            if (emptyStateTitle && emptyStateDesc && emptyStateIcon) {
                if (currentStatusFilter === 'pendientes') {
                    emptyStateIcon.textContent = 'task';
                    emptyStateTitle.textContent = '¡Todo al día!';
                    emptyStateDesc.textContent = 'No tienes tareas pendientes. Tómate un respiro o añade una nueva.';
                } else {
                    emptyStateIcon.textContent = 'done_all';
                    emptyStateTitle.textContent = 'Aún no hay tareas completadas';
                    emptyStateDesc.textContent = 'Cuando marques una tarea como hecha, aparecerá aquí.';
                }
            }
            emptyStateContainer.classList.remove('hidden');
        } else {
            emptyStateContainer.classList.add('hidden');
            filteredTasks.forEach(task => renderTask(task.id, task));
        }
    }
    
    // Update completed today count
    const completedTodayCountEl = document.getElementById('completed-today-count');
    const dashboardCompletedCountEl = document.getElementById('dashboard-completed-today-count');
    
    if (completedTodayCountEl || dashboardCompletedCountEl) {
        const userTz = (currentUserProfile && currentUserProfile.timezone) 
            ? currentUserProfile.timezone 
            : Intl.DateTimeFormat().resolvedOptions().timeZone;
        const todayStr = getTzDateString(Date.now(), userTz);
        
        const count = allUserTasks.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            const completedTimeMs = t.completedAt.toMillis ? t.completedAt.toMillis() : t.completedAt;
            return getTzDateString(completedTimeMs, userTz) === todayStr;
        }).length;
        
        if (completedTodayCountEl) completedTodayCountEl.textContent = count;
        if (dashboardCompletedCountEl) dashboardCompletedCountEl.textContent = count;
    }
    
    updateFocusSection();
    renderDashboardTasks();
    if (typeof renderPomodoroTask === 'function') renderPomodoroTask();
}

function renderDashboardTasks() {
    const dashboardContainer = document.getElementById('dashboard-tasks-container');
    if (!dashboardContainer) return;
    
    dashboardContainer.innerHTML = '';
    
    let pendingTasks = allUserTasks.filter(t => !t.completed);
    
    if (pendingTasks.length === 0) {
        dashboardContainer.innerHTML = `
            <div class="text-center p-8 text-on-surface-variant flex flex-col items-center justify-center">
                <span class="material-symbols-outlined text-4xl mb-2 opacity-50">task</span>
                <p class="font-body-md text-body-md">No hay tareas pendientes. ¡Todo al día!</p>
            </div>
        `;
        return;
    }
    
    const userTz = (currentUserProfile && currentUserProfile.timezone) 
        ? currentUserProfile.timezone 
        : Intl.DateTimeFormat().resolvedOptions().timeZone;
    const todayStr = getTzDateString(Date.now(), userTz);
    
    function getPriority(t) {
        if (t.date && t.date > todayStr) return 6; // Future
        if (t.date === todayStr) {
            if (t.time) return 1;
            return 2;
        }
        // No date
        if (t.energy === 'alta') return 3;
        if (t.energy === 'media') return 4;
        return 5;
    }
    
    pendingTasks.sort((a, b) => {
        const pA = getPriority(a);
        const pB = getPriority(b);
        if (pA !== pB) return pA - pB;
        // Si tienen la misma prioridad, la más nueva primero
        const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
    });
    
    pendingTasks.forEach(task => {
        let energyIcon = 'battery_20';
        let energyColor = 'bg-surface-container-high text-on-surface-variant border border-outline-variant';
        let energyText = 'Baja';
        
        if (task.energy === 'alta') {
            energyIcon = 'bolt';
            energyColor = 'bg-error-container text-on-error-container border border-error/20';
            energyText = 'Alta';
        } else if (task.energy === 'media') {
            energyIcon = 'battery_charging_50';
            energyColor = 'bg-secondary-container text-on-secondary-container border border-secondary/20';
            energyText = 'Media';
        }
        
        let isOverdue = false;
        if (task.date) {
            if (task.date < todayStr) {
                isOverdue = true;
            } else if (task.date === todayStr && task.time) {
                const nowTimeStr = new Intl.DateTimeFormat('en-GB', { 
                    timeZone: userTz, 
                    hour: '2-digit', minute: '2-digit' 
                }).format(new Date());
                if (task.time < nowTimeStr) isOverdue = true;
            }
        }
        
        const baseClass = isOverdue 
            ? "border-error/30 bg-error/5 hover:border-error/50" 
            : "border-surface-variant hover:border-outline-variant bg-surface-container-lowest";
            
        const titleClass = isOverdue 
            ? "text-error" 
            : "text-on-background group-hover:text-primary";
            
        let metaHtml = '';
        if (task.date || task.time) {
            metaHtml = `<div class="flex gap-3 text-xs mt-2 ${isOverdue ? 'text-error font-bold' : 'text-on-surface-variant opacity-80'}">`;
            if (task.date) metaHtml += `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">event</span>${task.date}</span>`;
            if (task.time) metaHtml += `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">schedule</span>${task.time}</span>`;
            metaHtml += `</div>`;
        }
        
        const html = `
            <div class="p-4 rounded-lg border transition-colors group flex items-start gap-4 ${baseClass}">
                <input aria-label="Completar ${task.title}" class="probit-checkbox mt-1 dashboard-task-chk" type="checkbox" data-id="${task.id}">
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-body-lg text-body-lg transition-colors cursor-pointer ${titleClass}" onclick="document.getElementById('edit-${task.id}-dash').click()">${task.title}</h4>
                        <span class="inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-1 rounded-md ${energyColor}">
                            <span class="material-symbols-outlined text-[14px]">${energyIcon}</span>
                            Energía ${energyText}
                        </span>
                    </div>
                    <p class="font-body-md text-body-md text-on-surface-variant line-clamp-2 cursor-pointer" onclick="document.getElementById('edit-${task.id}-dash').click()">${task.description || ''}</p>
                    ${metaHtml}
                    <button id="edit-${task.id}-dash" class="hidden"></button>
                </div>
            </div>
        `;
        dashboardContainer.insertAdjacentHTML('beforeend', html);
        
        const editBtn = document.getElementById(`edit-${task.id}-dash`);
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (typeof openTaskModal === 'function') openTaskModal(task.id, task);
            });
        }
    });
    
    // Checkbox listeners for dashboard
    document.querySelectorAll('.dashboard-task-chk').forEach(chk => {
        chk.addEventListener('change', async (e) => {
            try {
                const taskId = e.target.dataset.id;
                const updateData = { completed: true, completedAt: Date.now() };
                await updateDoc(doc(db, "tasks", taskId), updateData);
                
                if (currentUser) {
                    const statRef = doc(db, "userStats", currentUser.uid, "dailyStats", todayStr);
                    await setDoc(statRef, { completedTasks: increment(1) }, { merge: true });
                }
            } catch (error) {
                console.error(error);
                e.target.checked = false;
            }
        });
    });
}

function updateFocusSection() {
    const focusTitle = document.getElementById('focus-task-title');
    const focusMeta = document.getElementById('focus-task-meta');
    const focusIcon = document.getElementById('focus-task-icon');
    const focusEnergy = document.getElementById('focus-task-energy');
    const focusBtn = document.getElementById('focus-task-btn');
    
    if (!focusTitle) return;
    
    const pendingTasks = allUserTasks.filter(t => !t.completed);
    
    if (pendingTasks.length === 0) {
        focusTitle.textContent = "Empieza creando una tarea";
        if (focusMeta) focusMeta.classList.add('hidden');
        if (focusBtn) focusBtn.classList.add('hidden');
        return;
    }
    
    if (focusMeta) focusMeta.classList.remove('hidden');
    if (focusBtn) focusBtn.classList.remove('hidden');
    
    const userTz = (currentUserProfile && currentUserProfile.timezone) 
        ? currentUserProfile.timezone 
        : Intl.DateTimeFormat().resolvedOptions().timeZone;
    const todayStr = getTzDateString(Date.now(), userTz);
    
    const energyPriority = { "alta": 3, "media": 2, "baja": 1 };
    
    const todayTasks = pendingTasks.filter(t => t.date === todayStr);
    const otherTasks = pendingTasks.filter(t => t.date !== todayStr);
    
    let selectedTask = null;
    
    if (todayTasks.length > 0) {
        todayTasks.sort((a, b) => (energyPriority[b.energy] || 0) - (energyPriority[a.energy] || 0));
        selectedTask = todayTasks[0];
    } else {
        otherTasks.sort((a, b) => (energyPriority[b.energy] || 0) - (energyPriority[a.energy] || 0));
        selectedTask = otherTasks[0];
    }
    
    focusTitle.textContent = selectedTask.title;
    
    if (selectedTask.energy === 'alta') {
        focusIcon.textContent = 'bolt';
        focusEnergy.textContent = 'Energía Alta';
        focusIcon.className = 'material-symbols-outlined text-[20px] text-error';
        focusEnergy.className = 'font-label-md text-label-md text-error';
    } else if (selectedTask.energy === 'media') {
        focusIcon.textContent = 'battery_50';
        focusEnergy.textContent = 'Energía Media';
        focusIcon.className = 'material-symbols-outlined text-[20px] text-primary';
        focusEnergy.className = 'font-label-md text-label-md text-primary';
    } else {
        focusIcon.textContent = 'battery_20';
        focusEnergy.textContent = 'Energía Baja';
        focusIcon.className = 'material-symbols-outlined text-[20px] text-tertiary';
        focusEnergy.className = 'font-label-md text-label-md text-tertiary';
    }
}

// Cargar Tareas
function loadUserTasks(userId) {
    
    // NOTA: Removemos orderBy("createdAt", "desc") para evitar el error de Firebase que pide crear un índice.
    // Ordenaremos los resultados directamente en memoria.
    const q = query(
        collection(db, "tasks"), 
        where("userId", "==", userId)
    );
    
    onSnapshot(q, (snapshot) => {
        const userTz = (currentUserProfile && currentUserProfile.timezone) 
            ? currentUserProfile.timezone 
            : Intl.DateTimeFormat().resolvedOptions().timeZone;
        const todayStr = getTzDateString(Date.now(), userTz);
        
        allUserTasks = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            // Sweep: si está completada y fue antes de la medianoche de hoy, eliminar de Firebase
            if (data.completed && data.completedAt) {
                const completedTimeMs = data.completedAt.toMillis ? data.completedAt.toMillis() : data.completedAt;
                const completedStr = getTzDateString(completedTimeMs, userTz);
                
                if (completedStr < todayStr) {
                    deleteDoc(doc(db, "tasks", id)).catch(err => console.error("Error sweep cleanup:", err));
                    return; // saltar para no añadirla a allUserTasks
                }
            }
            
            allUserTasks.push({ id, ...data });
        });
        
        allUserTasks.sort((a, b) => {
            const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        });
        
        renderFilteredTasks();
    }, (error) => {
        console.error("Error al cargar tareas:", error);
    });
}

// Renderizar Tarea Individual
function renderTask(taskId, task) {
    let energyIcon = 'battery_20';
    let energyColor = 'bg-tertiary-fixed/40 text-on-tertiary-fixed-variant';
    let energyDot = 'bg-tertiary';
    let energyText = 'Baja';
    
    if (task.energy === 'alta') {
        energyIcon = 'bolt';
        energyColor = 'bg-error-container text-on-error-container';
        energyDot = 'bg-error';
        energyText = 'Alta';
    } else if (task.energy === 'media') {
        energyIcon = 'battery_charging_50';
        energyColor = 'bg-secondary-container text-on-secondary-container';
        energyDot = 'bg-secondary';
        energyText = 'Media';
    }
    
    let isOverdue = false;
    if (!task.completed && task.date) {
        const userTz = (currentUserProfile && currentUserProfile.timezone) 
            ? currentUserProfile.timezone 
            : Intl.DateTimeFormat().resolvedOptions().timeZone;
        const todayStr = getTzDateString(Date.now(), userTz);
        
        if (task.date < todayStr) {
            isOverdue = true;
        } else if (task.date === todayStr && task.time) {
            const nowTimeStr = new Intl.DateTimeFormat('en-GB', { 
                timeZone: userTz, 
                hour: '2-digit', minute: '2-digit' 
            }).format(new Date());
            
            if (task.time < nowTimeStr) {
                isOverdue = true;
            }
        }
    }
    
    let metadataHtml = '';
    if (task.date || task.time) {
        const metaColorClass = isOverdue ? "text-error font-bold" : "text-outline";
        metadataHtml = `<div class="flex items-center gap-4 ${metaColorClass} font-label-sm text-label-sm">`;
        if (task.date) metadataHtml += `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">event</span> ${task.date}</span>`;
        if (task.time) metadataHtml += `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">schedule</span> ${task.time}</span>`;
        metadataHtml += `</div>`;
    }
    
    const descHtml = task.description ? `<p class="font-body-md text-body-md text-on-surface-variant mt-1 line-clamp-2">${task.description}</p>` : '';
    
    const baseCardClass = isOverdue 
        ? "bg-error/5 border border-error/30 hover:border-error/50 hover:shadow-error/10" 
        : "bg-white border border-outline-variant/30 hover:border-primary/20 hover:shadow-primary/5";
    
    const taskHtml = `
        <div class="group flex items-center gap-4 p-5 rounded-[1.25rem] hover:shadow-lg transition-all duration-300 ${baseCardClass} ${task.completed ? 'opacity-60' : ''}">
            <div class="relative w-6 h-6 flex items-center justify-center flex-shrink-0">
                <input class="task-checkbox appearance-none w-6 h-6 border-2 border-outline-variant rounded-md checked:bg-primary checked:border-primary transition-all duration-200 cursor-pointer focus:ring-0 focus:ring-offset-0" type="checkbox" id="chk-${taskId}" ${task.completed ? 'checked' : ''}>
                <span class="material-symbols-outlined absolute text-white text-[18px] pointer-events-none select-none transition-opacity duration-200 ${task.completed ? 'opacity-100' : 'opacity-0'}">check</span>
            </div>
            <div class="flex-1 min-w-0">
                <label class="font-body-lg text-body-lg text-on-surface cursor-pointer block ${task.completed ? 'line-through text-on-surface-variant' : ''}" for="chk-${taskId}">${task.title}</label>
                ${descHtml}
            </div>
            <div class="flex items-center gap-4">
                <span class="px-3 py-1 ${energyColor} rounded-full font-label-sm text-label-sm flex items-center gap-1 whitespace-nowrap">
                    <span class="material-symbols-outlined text-[14px]">${energyIcon}</span> ${energyText}
                </span>
                ${metadataHtml}
                <button id="edit-${taskId}" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button id="delete-${taskId}" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>
        </div>
    `;
    
    tasksContainer.insertAdjacentHTML('beforeend', taskHtml);
    
    // Add edit listener
    const editBtn = document.getElementById(`edit-${taskId}`);
    if (editBtn) {
        editBtn.addEventListener('click', () => openTaskModal(taskId, task));
    }
    
    // Add delete listener
    const deleteBtn = document.getElementById(`delete-${taskId}`);
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            openDeleteModal(taskId);
        });
    }
    
    // Checkbox listener
    document.getElementById(`chk-${taskId}`).addEventListener('change', async (e) => {
        try {
            const isCompleted = e.target.checked;
            const updateData = { completed: isCompleted };
            if (isCompleted) {
                updateData.completedAt = Date.now();
            } else {
                updateData.completedAt = null;
            }
            await updateDoc(doc(db, "tasks", taskId), updateData);
            
            // Guardar estadística para futuras gráficas
            if (currentUser) {
                const userTz = (currentUserProfile && currentUserProfile.timezone) 
                    ? currentUserProfile.timezone 
                    : Intl.DateTimeFormat().resolvedOptions().timeZone;
                const dateStr = getTzDateString(Date.now(), userTz);
                const statRef = doc(db, "userStats", currentUser.uid, "dailyStats", dateStr);
                await setDoc(statRef, { 
                    completedTasks: increment(isCompleted ? 1 : -1) 
                }, { merge: true });
            }
        } catch (error) {
            console.error("Error al actualizar tarea:", error);
            e.target.checked = !e.target.checked;
        }
    });
}

// Guardar Nueva Tarea
if (saveTaskBtn) {
    saveTaskBtn.addEventListener('click', async () => {
        if (!currentUser) return;
        
        const title = taskTitleInput.value.trim();
        if (!title) {
            if (window.showToast) window.showToast("El título de la tarea es obligatorio", "error");
            return;
        }
        
        const energyNode = document.querySelector('input[name="task-energy"]:checked');
        const energy = energyNode ? energyNode.value : 'baja';
        const date = taskDateInput.value;
        const time = taskTimeInput.value;
        const description = taskDescInput ? taskDescInput.value.trim() : "";
        
        // Validación de fecha y hora en el pasado
        if (date) {
            const userTz = (currentUserProfile && currentUserProfile.timezone) 
                ? currentUserProfile.timezone 
                : Intl.DateTimeFormat().resolvedOptions().timeZone;
            const todayStr = getTzDateString(Date.now(), userTz);
            
            if (date < todayStr) {
                if (window.showToast) window.showToast("No puedes agendar una tarea para un día anterior", "error");
                return;
            }
            
            if (date === todayStr && time) {
                const nowTimeStr = new Intl.DateTimeFormat('en-GB', { 
                    timeZone: userTz, 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }).format(new Date());
                
                if (time < nowTimeStr) {
                    if (window.showToast) window.showToast("No puedes agendar una tarea en una hora pasada de hoy", "error");
                    return;
                }
            }
        }
        
        // Disable button while saving
        saveTaskBtn.disabled = true;
        saveTaskBtn.classList.add('opacity-50');
        
        try {
            if (currentEditingTaskId) {
                await updateDoc(doc(db, "tasks", currentEditingTaskId), {
                    title,
                    description,
                    energy,
                    date,
                    time
                });
                if (window.showToast) window.showToast("Tarea actualizada exitosamente", "success");
            } else {
                await addDoc(collection(db, "tasks"), {
                    title,
                    description,
                    energy,
                    date,
                    time,
                    userId: currentUser.uid,
                    completed: false,
                    createdAt: serverTimestamp()
                });
                if (window.showToast) window.showToast("Tarea creada exitosamente", "success");
            }
            
            closeTaskModal();
        } catch (error) {
            console.error("Error al guardar tarea:", error);
            if (window.showToast) window.showToast("Hubo un error al guardar", "error");
        } finally {
            saveTaskBtn.disabled = false;
            saveTaskBtn.classList.remove('opacity-50');
        }
    });
}

// --- CONFIGURACIÓN DE ZONAS HORARIAS (SETTINGS MODAL) ---
let isForcedSettings = false;
let settingsModalOverlay = null;
let settingsModalContent = null;

function setupSettingsModal() {
    // Evitar inyección múltiple
    if (document.getElementById('settings-modal-overlay')) return;
    
    const modalHtml = `
    <!-- Settings Modal -->
    <div id="settings-modal-overlay" class="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300 flex items-center justify-center p-4">
        <!-- Modal Content -->
        <div id="settings-modal-content" class="bg-surface rounded-[2rem] shadow-2xl w-full max-w-sm border border-outline-variant/30 transform scale-95 opacity-0 transition-all duration-300 overflow-hidden flex flex-col">
            <div class="p-8 space-y-4">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-[24px]">public</span>
                    </div>
                    <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Zona Horaria</h3>
                </div>
                <p class="font-body-md text-body-md text-on-surface-variant">Para calcular correctamente cuándo es medianoche, selecciona tu zona horaria local.</p>
                <div class="flex flex-col space-y-2">
                    <label class="font-label-md text-label-md text-on-surface">Ubicación</label>
                    <select id="timezone-select" class="w-full h-14 bg-surface-container-lowest border border-outline-variant rounded-xl pl-4 pr-12 font-body-lg text-body-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-ellipsis overflow-hidden whitespace-nowrap">
                        <option value="America/Mexico_City">Tiempo del Centro (CDMX, GDL, MTY)</option>
                        <option value="America/Tijuana">Tiempo del Noroeste (Tijuana, Mexicali)</option>
                        <option value="America/Mazatlan">Tiempo del Pacífico (Mazatlán, Sonora)</option>
                        <option value="America/Cancun">Tiempo del Sureste (Cancún, Q.Roo)</option>
                        <option value="America/Bogota">Colombia (Bogotá)</option>
                        <option value="America/Argentina/Buenos_Aires">Argentina (Buenos Aires)</option>
                    </select>
                </div>
            </div>
            <!-- Footer Actions -->
            <div class="px-8 py-6 border-t border-outline-variant/20 bg-surface-container-lowest flex justify-end gap-3">
                <button id="cancel-settings-btn" class="px-6 py-3 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Cancelar</button>
                <button id="save-settings-btn" class="px-6 py-3 rounded-xl font-label-md text-label-md bg-primary text-on-primary hover:bg-primary/90 shadow-md transition-all flex items-center justify-center gap-2">Guardar</button>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    settingsModalOverlay = document.getElementById('settings-modal-overlay');
    settingsModalContent = document.getElementById('settings-modal-content');
    
    // Toggle Dropdown logic
    document.querySelectorAll('[aria-label="settings"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = btn.nextElementSibling;
            if (dropdown && dropdown.classList.contains('settings-dropdown')) {
                document.querySelectorAll('.settings-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.add('hidden');
                });
                dropdown.classList.toggle('hidden');
            }
        });
    });
    
    // Clic fuera para cerrar dropdown
    document.addEventListener('click', () => {
        document.querySelectorAll('.settings-dropdown').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    });
    
    // Botones del dropdown
    document.querySelectorAll('.btn-open-settings').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.settings-dropdown').forEach(d => d.classList.add('hidden'));
            openSettingsModal(false);
        });
    });
    
    document.querySelectorAll('.btn-logout').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = "inicio-sesion.html";
            } catch (error) {
                console.error("Error cerrando sesión:", error);
            }
        });
    });
    
    document.getElementById('cancel-settings-btn').addEventListener('click', closeSettingsModal);
    settingsModalOverlay.addEventListener('click', (e) => {
        if (e.target === settingsModalOverlay && !isForcedSettings) closeSettingsModal();
    });
    
    document.getElementById('save-settings-btn').addEventListener('click', async () => {
        const tz = document.getElementById('timezone-select').value;
        const saveBtn = document.getElementById('save-settings-btn');
        
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span>...';
        
        try {
            await setDoc(doc(db, "usuarios", currentUser.uid), { timezone: tz }, { merge: true });
            currentUserProfile.timezone = tz;
            if (window.showToast) window.showToast("Zona horaria guardada", "success");
            
            // Si estábamos forzando (cuenta nueva) y estamos en tareas, ahora cargamos
            if (isForcedSettings && currentPage === 'tareas.html') {
                loadUserTasks(currentUser.uid);
            }
            
            isForcedSettings = false; // Permitir cerrar
            closeSettingsModal();
        } catch (error) {
            console.error("Error al guardar timezone:", error);
            if (window.showToast) window.showToast("Error al guardar", "error");
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Guardar';
        }
    });
}

function openSettingsModal(forced = false) {
    isForcedSettings = forced;
    const cancelBtn = document.getElementById('cancel-settings-btn');
    if (forced) {
        cancelBtn.style.display = 'none';
    } else {
        cancelBtn.style.display = 'block';
    }
    
    const tzSelect = document.getElementById('timezone-select');
    if (currentUserProfile && currentUserProfile.timezone) {
        tzSelect.value = currentUserProfile.timezone;
    } else {
        const guessed = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const opts = Array.from(tzSelect.options).map(o => o.value);
        if (opts.includes(guessed)) tzSelect.value = guessed;
    }
    
    settingsModalOverlay.classList.remove('hidden');
    void settingsModalOverlay.offsetWidth;
    settingsModalOverlay.classList.remove('opacity-0');
    settingsModalContent.classList.remove('opacity-0', 'scale-95');
    settingsModalContent.classList.add('opacity-100', 'scale-100');
}

function closeSettingsModal() {
    if (isForcedSettings) return;
    settingsModalOverlay.classList.add('opacity-0');
    settingsModalContent.classList.remove('opacity-100', 'scale-100');
    settingsModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        settingsModalOverlay.classList.add('hidden');
    }, 300);
}

// ==========================================
// POMODORO TASKS INTEGRATION
// ==========================================
let activePomodoroTaskId = null;

function setupPomodoroUI() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage !== 'pomodoro.html') return;
    
    const addTaskBtn = document.getElementById('pomodoro-add-task-btn');
    const selectModal = document.getElementById('pomodoro-select-task-modal');
    const selectContent = document.getElementById('pomodoro-select-task-content');
    const closeBtn = document.getElementById('close-pomodoro-select-btn');
    const createNewBtn = document.getElementById('pomodoro-create-new-task-btn');
    const unlinkBtn = document.getElementById('pomodoro-unlink-task');
    const checkbox = document.getElementById('pomodoro-task-checkbox');
    
    if (addTaskBtn) addTaskBtn.addEventListener('click', openPomodoroSelectModal);
    if (closeBtn) closeBtn.addEventListener('click', closePomodoroSelectModal);
    if (selectModal) {
        selectModal.addEventListener('click', (e) => {
            if (e.target === selectModal) closePomodoroSelectModal();
        });
    }
    
    if (createNewBtn) {
        createNewBtn.addEventListener('click', () => {
            closePomodoroSelectModal();
            if (typeof openTaskModal === 'function') openTaskModal();
        });
    }
    
    if (unlinkBtn) {
        unlinkBtn.addEventListener('click', () => {
            activePomodoroTaskId = null;
            renderPomodoroTask();
        });
    }
    
    if (checkbox) {
        checkbox.addEventListener('change', async (e) => {
            if (!activePomodoroTaskId) return;
            try {
                const isCompleted = e.target.checked;
                const updateData = { completed: isCompleted };
                if (isCompleted) {
                    updateData.completedAt = Date.now();
                } else {
                    updateData.completedAt = null;
                }
                
                await updateDoc(doc(db, "tasks", activePomodoroTaskId), updateData);
                
                if (currentUser && isCompleted) {
                    const userTz = (currentUserProfile && currentUserProfile.timezone) 
                        ? currentUserProfile.timezone 
                        : Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const dateStr = getTzDateString(Date.now(), userTz);
                    const statRef = doc(db, "userStats", currentUser.uid, "dailyStats", dateStr);
                    await setDoc(statRef, { 
                        completedTasks: increment(1) 
                    }, { merge: true });
                }
                
                // Si la completó, la quitamos del foco activo del pomodoro
                if (isCompleted) {
                    activePomodoroTaskId = null;
                }
                
            } catch (error) {
                console.error("Error al completar tarea en pomodoro:", error);
                e.target.checked = !e.target.checked;
            }
        });
    }
}

function openPomodoroSelectModal() {
    const modal = document.getElementById('pomodoro-select-task-modal');
    const content = document.getElementById('pomodoro-select-task-content');
    if (!modal || !content) return;
    
    renderPomodoroTaskList();
    
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.remove('opacity-0');
    content.classList.remove('opacity-0', 'scale-95');
    content.classList.add('opacity-100', 'scale-100');
}

function closePomodoroSelectModal() {
    const modal = document.getElementById('pomodoro-select-task-modal');
    const content = document.getElementById('pomodoro-select-task-content');
    if (!modal || !content) return;
    
    modal.classList.add('opacity-0');
    content.classList.remove('opacity-100', 'scale-100');
    content.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function renderPomodoroTaskList() {
    const listContainer = document.getElementById('pomodoro-task-list');
    if (!listContainer) return;
    
    const pendingTasks = allUserTasks.filter(t => !t.completed);
    
    if (pendingTasks.length === 0) {
        listContainer.innerHTML = '<div class="text-center p-4 text-on-surface-variant font-body-md">No tienes tareas pendientes. ¡Todo al día!</div>';
        return;
    }
    
    listContainer.innerHTML = '';
    
    pendingTasks.forEach(task => {
        let energyIcon = 'battery_20';
        let energyColor = 'bg-surface-container-high text-on-surface-variant';
        let energyText = 'Baja';
        
        if (task.energy === 'alta') {
            energyIcon = 'bolt';
            energyColor = 'bg-error-container text-on-error-container';
            energyText = 'Alta';
        } else if (task.energy === 'media') {
            energyIcon = 'battery_charging_50';
            energyColor = 'bg-secondary-container text-on-secondary-container';
            energyText = 'Media';
        }
        
        const taskEl = document.createElement('div');
        taskEl.className = 'p-3 rounded-lg border border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-lowest cursor-pointer transition-colors flex justify-between items-center';
        taskEl.innerHTML = `
            <div class="flex-1 min-w-0 pr-3">
                <h4 class="font-body-md text-on-surface truncate">${task.title}</h4>
            </div>
            <span class="px-2 py-1 ${energyColor} rounded-full font-label-sm text-[10px] flex items-center gap-1 shrink-0">
                <span class="material-symbols-outlined text-[12px]">${energyIcon}</span> ${energyText}
            </span>
        `;
        taskEl.addEventListener('click', () => {
            activePomodoroTaskId = task.id;
            closePomodoroSelectModal();
            renderPomodoroTask();
        });
        listContainer.appendChild(taskEl);
    });
}

function renderPomodoroTask() {
    const emptyState = document.getElementById('pomodoro-empty-state');
    const activeState = document.getElementById('pomodoro-active-state');
    
    if (!emptyState || !activeState) return;
    
    if (!activePomodoroTaskId) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        activeState.classList.add('hidden');
        activeState.classList.remove('flex');
        return;
    }
    
    const task = allUserTasks.find(t => t.id === activePomodoroTaskId);
    if (!task || task.completed) {
        // La tarea ya no existe o fue completada desde otro lado
        activePomodoroTaskId = null;
        renderPomodoroTask();
        return;
    }
    
    emptyState.classList.add('hidden');
    emptyState.classList.remove('flex');
    activeState.classList.remove('hidden');
    activeState.classList.add('flex');
    
    document.getElementById('pomodoro-active-title').textContent = task.title;
    const checkbox = document.getElementById('pomodoro-task-checkbox');
    if (checkbox) checkbox.checked = false;
    
    let energyIcon = 'battery_20';
    let energyColor = 'bg-surface-container-high text-on-surface-variant';
    let energyText = 'Baja';
    
    if (task.energy === 'alta') {
        energyIcon = 'bolt';
        energyColor = 'bg-error-container text-on-error-container text-error';
        energyText = 'Alta';
    } else if (task.energy === 'media') {
        energyIcon = 'battery_charging_50';
        energyColor = 'bg-secondary-container text-on-secondary-container text-secondary';
        energyText = 'Media';
    }
    
    const metaContainer = document.getElementById('pomodoro-active-meta');
    if (metaContainer) {
        let metaHtml = `
            <span class="px-2 py-1 ${energyColor} rounded-DEFAULT font-label-sm text-[10px] uppercase tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-[12px]">${energyIcon}</span> ${energyText}
            </span>
        `;
        if (task.time) {
            metaHtml += `<span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">schedule</span> ${task.time}</span>`;
        }
        metaContainer.innerHTML = metaHtml;
    }
}

// Inicializar UI de Pomodoro al final
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupPomodoroUI, 500);
});
