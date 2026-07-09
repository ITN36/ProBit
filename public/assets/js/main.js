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
        
        if (!currentUserProfile.timezone) {
            openSettingsModal(true);
        }

        if (currentPage === 'tareas.html') {
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
const saveTaskBtn = document.getElementById('save-task-btn');
const taskTitleInput = document.getElementById('task-title-input');
const taskDescInput = document.getElementById('task-desc-input');
const taskDescCount = document.getElementById('task-desc-count');
const taskDateInput = document.getElementById('task-date-input');
const taskTimeInput = document.getElementById('task-time-input');

// Referencias del Modal
const taskModalTitle = document.getElementById('task-modal-title');
const taskModalOverlay = document.getElementById('task-modal-overlay');
const taskModalContent = document.getElementById('task-modal-content');
const openTaskModalBtn = document.getElementById('open-task-modal-btn');
const closeTaskModalBtn = document.getElementById('close-task-modal-btn');
const cancelTaskBtn = document.getElementById('cancel-task-btn');

// Referencias del Modal de Eliminación
const deleteModalOverlay = document.getElementById('delete-modal-overlay');
const deleteModalContent = document.getElementById('delete-modal-content');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

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

if (openTaskModalBtn) openTaskModalBtn.addEventListener('click', () => openTaskModal());
if (closeTaskModalBtn) closeTaskModalBtn.addEventListener('click', closeTaskModal);
if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', closeTaskModal);
if (taskModalOverlay) {
    taskModalOverlay.addEventListener('click', (e) => {
        if (e.target === taskModalOverlay) closeTaskModal();
    });
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

if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
if (deleteModalOverlay) {
    deleteModalOverlay.addEventListener('click', (e) => {
        if (e.target === deleteModalOverlay) closeDeleteModal();
    });
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!taskIdToDelete) return;
        
        // Disable button while processing
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
    if (!tasksContainer || !emptyStateContainer) return;
    tasksContainer.innerHTML = '';
    
    // 1. Filtrar por estado
    let filteredTasks = allUserTasks.filter(task => {
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
    
    // Update completed today count
    const completedTodayCountEl = document.getElementById('completed-today-count');
    if (completedTodayCountEl) {
        const userTz = (currentUserProfile && currentUserProfile.timezone) 
            ? currentUserProfile.timezone 
            : Intl.DateTimeFormat().resolvedOptions().timeZone;
        const todayStr = getTzDateString(Date.now(), userTz);
        
        const count = allUserTasks.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            const completedTimeMs = t.completedAt.toMillis ? t.completedAt.toMillis() : t.completedAt;
            return getTzDateString(completedTimeMs, userTz) === todayStr;
        }).length;
        completedTodayCountEl.textContent = count;
    }
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
    
    let metadataHtml = '';
    if (task.date || task.time) {
        metadataHtml = `<div class="flex items-center gap-4 text-outline font-label-sm text-label-sm">`;
        if (task.date) metadataHtml += `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">event</span> ${task.date}</span>`;
        if (task.time) metadataHtml += `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">schedule</span> ${task.time}</span>`;
        metadataHtml += `</div>`;
    }
    
    const descHtml = task.description ? `<p class="font-body-md text-body-md text-on-surface-variant mt-1 line-clamp-2">${task.description}</p>` : '';
    
    const taskHtml = `
        <div class="group flex items-center gap-4 p-5 bg-white rounded-[1.25rem] border border-outline-variant/30 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ${task.completed ? 'opacity-60' : ''}">
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
