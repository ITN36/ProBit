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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, setDoc, collection, addDoc, onSnapshot, query, where, orderBy, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

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

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        if (publicPages.includes(currentPage)) {
            window.location.href = "dashboard.html";
        } else if (currentPage === 'tareas.html') {
            loadUserTasks(user.uid);
        }
    } else {
        currentUser = null;
        if (!publicPages.includes(currentPage)) {
            window.location.href = "inicio-sesion.html";
        }
    }
});

// Referencias del DOM para Tareas
const tasksContainer = document.getElementById('tasks-container');
const emptyStateContainer = document.getElementById('empty-state-container');
const saveTaskBtn = document.getElementById('save-task-btn');
const taskTitleInput = document.getElementById('task-title-input');
const taskDateInput = document.getElementById('task-date-input');
const taskTimeInput = document.getElementById('task-time-input');

// Referencias del Modal
const taskModalOverlay = document.getElementById('task-modal-overlay');
const taskModalContent = document.getElementById('task-modal-content');
const openTaskModalBtn = document.getElementById('open-task-modal-btn');
const closeTaskModalBtn = document.getElementById('close-task-modal-btn');
const cancelTaskBtn = document.getElementById('cancel-task-btn');

function openTaskModal() {
    if (taskModalOverlay && taskModalContent) {
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

if (openTaskModalBtn) openTaskModalBtn.addEventListener('click', openTaskModal);
if (closeTaskModalBtn) closeTaskModalBtn.addEventListener('click', closeTaskModal);
if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', closeTaskModal);
if (taskModalOverlay) {
    taskModalOverlay.addEventListener('click', (e) => {
        if (e.target === taskModalOverlay) closeTaskModal();
    });
}

// Cargar Tareas
function loadUserTasks(userId) {
    if (!tasksContainer || !emptyStateContainer) return;
    
    // NOTA: Removemos orderBy("createdAt", "desc") para evitar el error de Firebase que pide crear un índice.
    // Ordenaremos los resultados directamente en memoria.
    const q = query(
        collection(db, "tasks"), 
        where("userId", "==", userId)
    );
    
    onSnapshot(q, (snapshot) => {
        tasksContainer.innerHTML = '';
        if (snapshot.empty) {
            emptyStateContainer.classList.remove('hidden');
        } else {
            emptyStateContainer.classList.add('hidden');
            
            // Extraer y ordenar en memoria (de más nuevo a más viejo)
            const tasksArray = [];
            snapshot.forEach(docSnap => tasksArray.push({ id: docSnap.id, ...docSnap.data() }));
            
            tasksArray.sort((a, b) => {
                const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
                return timeB - timeA;
            });
            
            tasksArray.forEach((task) => {
                renderTask(task.id, task);
            });
        }
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
    
    let metadataHtml = '';
    if (task.date || task.time) {
        metadataHtml = `<div class="flex items-center gap-4 text-outline font-label-sm text-label-sm">`;
        if (task.date) metadataHtml += `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">event</span> ${task.date}</span>`;
        if (task.time) metadataHtml += `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">schedule</span> ${task.time}</span>`;
        metadataHtml += `</div>`;
    }
    
    const taskHtml = `
        <div class="group flex items-center gap-4 p-5 bg-white rounded-[1.25rem] border border-outline-variant/30 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ${task.completed ? 'opacity-60' : ''}">
            <div class="relative w-6 h-6 flex items-center justify-center">
                <input class="task-checkbox appearance-none w-6 h-6 border-2 border-outline-variant rounded-md checked:bg-primary checked:border-primary transition-all duration-200 cursor-pointer focus:ring-0 focus:ring-offset-0" type="checkbox" id="chk-${taskId}" ${task.completed ? 'checked' : ''}>
                <span class="material-symbols-outlined absolute text-white text-[18px] pointer-events-none select-none transition-opacity duration-200 ${task.completed ? 'opacity-100' : 'opacity-0'}">check</span>
            </div>
            <label class="flex-1 font-body-lg text-body-lg text-on-surface cursor-pointer ${task.completed ? 'line-through text-on-surface-variant' : ''}" for="chk-${taskId}">${task.title}</label>
            <div class="flex items-center gap-4">
                <span class="px-3 py-1 ${energyColor} rounded-full font-label-sm text-label-sm flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">${energyIcon}</span> ${energyText}
                </span>
                ${metadataHtml}
            </div>
        </div>
    `;
    
    tasksContainer.insertAdjacentHTML('beforeend', taskHtml);
    
    // Checkbox listener
    document.getElementById(`chk-${taskId}`).addEventListener('change', async (e) => {
        try {
            await updateDoc(doc(db, "tasks", taskId), { completed: e.target.checked });
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
        
        // Disable button while saving
        saveTaskBtn.disabled = true;
        saveTaskBtn.classList.add('opacity-50');
        
        try {
            await addDoc(collection(db, "tasks"), {
                title,
                energy,
                date,
                time,
                userId: currentUser.uid,
                completed: false,
                createdAt: serverTimestamp()
            });
            
            // Clean up and close modal
            taskTitleInput.value = '';
            taskDateInput.value = '';
            taskTimeInput.value = '';
            document.querySelector('input[name="task-energy"][value="alta"]').checked = true;
            document.getElementById('close-task-modal-btn').click();
            
            if (window.showToast) window.showToast("Tarea creada exitosamente", "success");
        } catch (error) {
            console.error("Error al guardar tarea:", error);
            if (window.showToast) window.showToast("Hubo un error al guardar", "error");
        } finally {
            saveTaskBtn.disabled = false;
            saveTaskBtn.classList.remove('opacity-50');
        }
    });
}
