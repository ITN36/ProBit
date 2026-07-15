import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, where } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let currentUser = null;

let currentEditId = null;
let currentDeleteId = null;

// Modal Elements
const editModalOverlay = document.getElementById('edit-thought-modal-overlay');
const editModalContent = document.getElementById('edit-thought-modal-content');
const editInput = document.getElementById('edit-thought-input');
const editCharCount = document.getElementById('edit-char-count');
const closeEditBtn = document.getElementById('close-edit-thought-btn');
const cancelEditBtn = document.getElementById('cancel-edit-thought-btn');
const saveEditBtn = document.getElementById('save-edit-thought-btn');

const deleteModalOverlay = document.getElementById('delete-thought-modal-overlay');
const deleteModalContent = document.getElementById('delete-thought-modal-content');
const cancelDeleteBtn = document.getElementById('cancel-delete-thought-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-thought-btn');

function openModal(overlay, content) {
    if(!overlay || !content) return;
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        content.classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function closeModal(overlay, content) {
    if(!overlay || !content) return;
    overlay.classList.add('opacity-0');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 300);
}

if (editInput) {
    editInput.addEventListener('input', () => {
        editCharCount.textContent = `${editInput.value.length} / 150`;
    });
}

if (closeEditBtn) closeEditBtn.addEventListener('click', () => closeModal(editModalOverlay, editModalContent));
if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => closeModal(editModalOverlay, editModalContent));

if (saveEditBtn) {
    saveEditBtn.addEventListener('click', async () => {
        if (!currentEditId) return;
        const newText = editInput.value.trim();
        if (newText === '') return;
        if (newText.length > 150) {
            alert("El pensamiento no puede superar los 150 caracteres.");
            return;
        }
        
        saveEditBtn.disabled = true;
        saveEditBtn.classList.add('opacity-50', 'cursor-not-allowed');
        
        try {
            await updateDoc(doc(db, 'usuarios', currentUser.uid, 'braindumps', currentEditId), {
                content: newText,
                updatedAt: serverTimestamp()
            });
            closeModal(editModalOverlay, editModalContent);
        } catch (error) {
            console.error("Error updating thought:", error);
        } finally {
            saveEditBtn.disabled = false;
            saveEditBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => closeModal(deleteModalOverlay, deleteModalContent));

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!currentDeleteId) return;
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
        
        try {
            await deleteDoc(doc(db, 'usuarios', currentUser.uid, 'braindumps', currentDeleteId));
            closeModal(deleteModalOverlay, deleteModalContent);
        } catch (error) {
            console.error("Error deleting thought:", error);
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

// Track character limit
const input = document.getElementById('brain-dump-input');
const charCount = document.getElementById('char-count');
const captureBtn = document.getElementById('capture-btn');
const container = document.getElementById('thoughts-container');

input.addEventListener('input', () => {
    const currentLength = input.value.length;
    charCount.textContent = `${currentLength} / 150`;
});

// Authentication listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadThoughts();
    } else {
        currentUser = null;
        container.innerHTML = '';
        window.location.href = 'inicio-sesion.html';
    }
});

let unsubscribe = null;

function loadThoughts() {
    if (!currentUser) return;
    
    if (unsubscribe) {
        unsubscribe();
    }
    
    const thoughtsRef = collection(db, 'usuarios', currentUser.uid, 'braindumps');
    const q = query(thoughtsRef, orderBy('createdAt', 'desc'));
    
    unsubscribe = onSnapshot(q, (snapshot) => {
        container.innerHTML = '';
        
        if (snapshot.empty) {
            // Render empty state if no thoughts
            renderEmptyState();
            return;
        }

        snapshot.forEach(doc => {
            renderThought(doc.id, doc.data());
        });
        
        // Always append empty state at the end
        renderEmptyState();
    });
}

function timeAgo(date) {
    if (!date) return 'Ahora mismo';
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return "Hace " + Math.floor(interval) + " años";
    interval = seconds / 2592000;
    if (interval > 1) return "Hace " + Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return "Hace " + Math.floor(interval) + " días";
    interval = seconds / 3600;
    if (interval > 1) return "Hace " + Math.floor(interval) + " h";
    interval = seconds / 60;
    if (interval > 1) return "Hace " + Math.floor(interval) + " min";
    return "Ahora mismo";
}

function renderThought(id, data) {
    const newCard = document.createElement('div');
    newCard.id = `thought-${id}`;
    newCard.className = "bg-surface-container-lowest border border-outline-variant p-6 rounded-xl group hover:shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4";
    
    const date = data.createdAt ? data.createdAt.toDate() : new Date();
    const timeString = timeAgo(date);

    newCard.innerHTML = `
        <div class="flex justify-between items-start mb-4 relative">
            <span class="px-2 py-1 bg-secondary-container/30 text-on-secondary-container text-[10px] uppercase tracking-wider font-bold rounded">${timeString}</span>
            <div>
                <button class="btn-options text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" data-id="${id}">
                    <span class="material-symbols-outlined text-lg pointer-events-none">more_vert</span>
                </button>
                <!-- Dropdown -->
                <div class="thought-dropdown hidden absolute right-0 top-6 w-36 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-10 flex flex-col py-1 animate-in fade-in zoom-in-95" id="dropdown-${id}">
                    <button class="btn-edit-thought px-4 py-2 text-left text-label-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2" data-id="${id}"><span class="material-symbols-outlined text-[16px]">edit</span> Editar</button>
                    <button class="btn-complete-thought px-4 py-2 text-left text-label-sm text-primary hover:bg-surface-container transition-colors flex items-center gap-2" data-id="${id}"><span class="material-symbols-outlined text-[16px]">check_circle</span> Completar</button>
                    <button class="btn-delete-thought px-4 py-2 text-left text-label-sm text-error hover:bg-error-container transition-colors flex items-center gap-2" data-id="${id}"><span class="material-symbols-outlined text-[16px]">delete</span> Eliminar</button>
                </div>
            </div>
        </div>
        <p class="font-body-md text-body-md text-on-surface mb-6 leading-relaxed" id="content-${id}">
            ${data.content}
        </p>
        <div class="flex flex-wrap gap-2 pt-4 border-t border-outline-variant/30">
            <button class="flex items-center gap-1 text-label-sm text-on-secondary-container bg-secondary-container/10 px-3 py-1.5 rounded-full hover:bg-secondary-container/20 transition-colors">
                <span class="material-symbols-outlined text-sm">assignment</span>
                Convertir en Tarea
            </button>
            <button class="flex items-center gap-1 text-label-sm text-on-tertiary-fixed-variant bg-tertiary-fixed/30 px-3 py-1.5 rounded-full hover:bg-tertiary-fixed/50 transition-colors">
                <span class="material-symbols-outlined text-sm">bolt</span>
                Asignar Energía
            </button>
        </div>
    `;
    container.appendChild(newCard);
}

function renderEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = "bg-surface-container-low border border-dashed border-outline rounded-xl p-6 flex flex-col items-center justify-center text-center h-full opacity-60 min-h-[220px]";
    emptyState.innerHTML = `
        <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-3">cloud_download</span>
        <p class="font-label-md text-label-md text-on-surface-variant">¿Algo más en mente?</p>
        <p class="text-[11px] text-on-surface-variant/70 mt-1">Sigue escribiendo para liberar carga mental.</p>
    `;
    container.appendChild(emptyState);
}

async function captureThought() {
    if (!currentUser) return;
    const content = input.value.trim();
    if (content === '') return;
    if (content.length > 150) return;

    try {
        await addDoc(collection(db, 'usuarios', currentUser.uid, 'braindumps'), {
            content: content,
            createdAt: serverTimestamp()
        });
        
        input.value = '';
        charCount.textContent = '0 / 150';
        input.focus();
    } catch (error) {
        console.error("Error saving thought: ", error);
        alert("Hubo un error al guardar tu pensamiento.");
    }
}

captureBtn.addEventListener('click', captureThought);

input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        captureThought();
    }
});

// Event delegation for thought actions
document.addEventListener('click', async (e) => {
    // 1. Toggle dropdown
    const optionsBtn = e.target.closest('.btn-options');
    if (optionsBtn) {
        const id = optionsBtn.dataset.id;
        const dropdown = document.getElementById(`dropdown-${id}`);
        
        // Close all other dropdowns
        document.querySelectorAll('.thought-dropdown').forEach(d => {
            if (d.id !== `dropdown-${id}`) d.classList.add('hidden');
        });
        
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
        return;
    }

    // Close all dropdowns if clicking outside
    if (!e.target.closest('.thought-dropdown')) {
        document.querySelectorAll('.thought-dropdown').forEach(d => d.classList.add('hidden'));
    }

    // 2. Actions
    const deleteBtn = e.target.closest('.btn-delete-thought');
    const completeBtn = e.target.closest('.btn-complete-thought');
    const editBtn = e.target.closest('.btn-edit-thought');

    if (deleteBtn) {
        currentDeleteId = deleteBtn.dataset.id;
        openModal(deleteModalOverlay, deleteModalContent);
    }

    if (completeBtn) {
        const id = completeBtn.dataset.id;
        // Mark as completed by adding a visual style and deleting or keeping it
        // To keep it simple as requested: "marcarla como completada y eliminar la nota"
        const card = document.getElementById(`thought-${id}`);
        if (card) {
            card.classList.add('opacity-50', 'line-through');
            setTimeout(async () => {
                await deleteDoc(doc(db, 'usuarios', currentUser.uid, 'braindumps', id));
            }, 500);
        }
    }

    if (editBtn) {
        currentEditId = editBtn.dataset.id;
        const textElement = document.getElementById(`content-${currentEditId}`);
        if (editInput) {
            editInput.value = textElement.innerText;
            editCharCount.textContent = `${editInput.value.length} / 150`;
        }
        openModal(editModalOverlay, editModalContent);
    }
});