import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, where } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let currentUser = null;

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
    newCard.className = "bg-surface-container-lowest border border-outline-variant p-6 rounded-xl group hover:shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4";
    
    const date = data.createdAt ? data.createdAt.toDate() : new Date();
    const timeString = timeAgo(date);

    newCard.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <span class="px-2 py-1 bg-secondary-container/30 text-on-secondary-container text-[10px] uppercase tracking-wider font-bold rounded">${timeString}</span>
            <button class="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="material-symbols-outlined text-lg">more_vert</span>
            </button>
        </div>
        <p class="font-body-md text-body-md text-on-surface mb-6 leading-relaxed">
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