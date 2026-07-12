import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let currentUser = null;

// Helper to get YYYY-MM-DD for current week (Mon-Sun)
function getCurrentWeekDates() {
    const dates = [];
    const today = new Date();
    let dayOfWeek = today.getDay();
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0, Sun=6
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
    }
    return dates;
}
document.addEventListener('DOMContentLoaded', () => {
    // Simulating loading entry
    const items = document.querySelectorAll('.animate-fade-in');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
        setTimeout(() => {
            item.style.transition = 'all 0.6s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });

    const mainContent = document.querySelector('main');
    const rachaSection = document.querySelector('section.animate-fade-in');
    const progressCard = document.querySelector('aside.space-y-stack-md > div.bg-surface-container-lowest');

    if (mainContent) {
        mainContent.addEventListener('click', (e) => {
            if (!e.target.closest('.bg-surface-container-lowest')) {
                const habitCards = document.querySelectorAll('#habits-list > div.bg-surface-container-lowest');
                habitCards.forEach(c => c.classList.remove('ring-2', 'ring-primary/30', 'bg-primary/5'));
                if(rachaSection) {
                    const rachaTitle = rachaSection.querySelector('h3');
                    if(rachaTitle) rachaTitle.textContent = 'Tu Racha de Bits';
                }
                if(progressCard) {
                    const successRate = progressCard.querySelector('.text-\\[14px\\]');
                    if(successRate) successRate.textContent = '82%';
                    const dots = progressCard.querySelectorAll('.grid-cols-7 div div');
                    dots.forEach((dot, i) => {
                        if (i > 18) {
                            dot.className = 'w-1.5 h-1.5 rounded-full bg-outline-variant/40';
                        } else {
                            dot.className = 'w-1.5 h-1.5 rounded-full bg-primary';
                        }
                    });
                }
            }
        });
    }

    // --- HABIT MODAL LOGIC ---
    const openHabitModalBtn = document.getElementById('open-habit-modal-btn');
    const closeHabitModalBtn = document.getElementById('close-habit-modal-btn');
    const cancelHabitBtn = document.getElementById('cancel-habit-btn');
    const habitModalOverlay = document.getElementById('habit-modal-overlay');
    const habitModalContent = document.getElementById('habit-modal-content');
    const habitDaysAllBtn = document.getElementById('habit-days-all-btn');

    if (openHabitModalBtn && habitModalOverlay) {
        window.openModal = () => {
            habitModalOverlay.classList.remove('hidden');
            void habitModalOverlay.offsetWidth;
            habitModalOverlay.classList.remove('opacity-0');
            habitModalOverlay.classList.add('opacity-100');
            habitModalContent.classList.remove('scale-95', 'opacity-0');
            habitModalContent.classList.add('scale-100', 'opacity-100');
        };

        window.closeModal = () => {
            habitModalOverlay.classList.remove('opacity-100');
            habitModalOverlay.classList.add('opacity-0');
            habitModalContent.classList.remove('scale-100', 'opacity-100');
            habitModalContent.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                habitModalOverlay.classList.add('hidden');
            }, 300);
        };

        openHabitModalBtn.addEventListener('click', () => {
            document.getElementById('habit-modal-title').textContent = 'Nuevo Hábito';
            delete habitModalContent.dataset.editingId;
            // Clear inputs
            document.getElementById('habit-title-input').value = '';
            document.getElementById('habit-desc-input').value = '';
            document.getElementById('habit-time-input').value = '';
            document.getElementById('habit-moment-input').value = '';
            const energyElement = document.querySelector('input[name="habit-energy"]:checked');
            if(energyElement) energyElement.checked = false;
            document.querySelectorAll('input[name="habit-days"]').forEach(cb => cb.checked = false);
            if (habitDaysAllBtn) habitDaysAllBtn.textContent = 'Seleccionar Todos';
            
            window.openModal();
        });

        closeHabitModalBtn.addEventListener('click', window.closeModal);
        cancelHabitBtn.addEventListener('click', window.closeModal);
        
        habitModalOverlay.addEventListener('click', (e) => {
            if (e.target === habitModalOverlay) {
                window.closeModal();
            }
        });
        
        if (habitDaysAllBtn) {
            habitDaysAllBtn.addEventListener('click', () => {
                const dayCheckboxes = document.querySelectorAll('input[name="habit-days"]');
                const allChecked = Array.from(dayCheckboxes).every(cb => cb.checked);
                dayCheckboxes.forEach(cb => cb.checked = !allChecked);
                habitDaysAllBtn.textContent = allChecked ? 'Seleccionar Todos' : 'Deseleccionar Todos';
            });
        }

        const saveHabitBtn = document.getElementById('save-habit-btn');
        if (saveHabitBtn) {
            saveHabitBtn.addEventListener('click', async () => {
                const title = document.getElementById('habit-title-input').value.trim();
                const desc = document.getElementById('habit-desc-input').value.trim();
                const time = document.getElementById('habit-time-input').value;
                const moment = document.getElementById('habit-moment-input').value;
                const energyElement = document.querySelector('input[name="habit-energy"]:checked');
                const energy = energyElement ? energyElement.value : null;
                const daysCheckboxes = document.querySelectorAll('input[name="habit-days"]:checked');
                const days = Array.from(daysCheckboxes).map(cb => cb.value);

                if (!title) {
                    if (window.showToast) window.showToast('Por favor, ingresa el título del hábito', 'error');
                    return;
                }
                
                if (days.length === 0) {
                    if (window.showToast) window.showToast('Selecciona al menos un día', 'error');
                    return;
                }

                if (!currentUser) {
                    if (window.showToast) window.showToast('Debes iniciar sesión primero', 'error');
                    return;
                }

                const habitId = habitModalContent.dataset.editingId;
                const isEditing = !!habitId;

                const habitData = {
                    title,
                    desc,
                    time,
                    moment,
                    energy,
                    days,
                    updatedAt: serverTimestamp()
                };

                try {
                    saveHabitBtn.disabled = true;
                    saveHabitBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    
                    if (isEditing) {
                        await updateDoc(doc(db, "usuarios", currentUser.uid, "habitos", habitId), habitData);
                        if (window.showToast) window.showToast('Hábito actualizado', 'success');
                    } else {
                        habitData.createdAt = serverTimestamp();
                        await addDoc(collection(db, "usuarios", currentUser.uid, "habitos"), habitData);
                        if (window.showToast) window.showToast('Hábito creado', 'success');
                    }
                    
                    window.closeModal();
                } catch (error) {
                    console.error("Error guardando hábito:", error);
                    if (window.showToast) window.showToast('Error al guardar: ' + error.message, 'error');
                } finally {
                    saveHabitBtn.disabled = false;
                    saveHabitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            });
        }
    }
});

// Auth state watcher
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadHabits();
    } else {
        console.warn('Usuario no autenticado, redirigiendo a inicio de sesión...');
        window.location.href = "inicio-sesion.html";
    }
});

function loadHabits() {
    const listContainer = document.getElementById('habits-list');
    if (!listContainer) return;

    const q = query(collection(db, "usuarios", currentUser.uid, "habitos"), orderBy("createdAt", "asc"));
    
    onSnapshot(q, (snapshot) => {
        listContainer.innerHTML = ''; // Limpiar lista
        
        if (snapshot.empty) {
            listContainer.innerHTML = '<div class="text-center p-8 text-on-surface-variant/60 font-body-md">No tienes hábitos. ¡Crea uno nuevo!</div>';
            return;
        }

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            renderHabitCard(docSnap.id, data, listContainer);
        });
    });
}

function renderHabitCard(id, data, container) {
    const { title, desc, time, moment, energy, days } = data;

    let energyHtml = '';
    if (energy) {
        let energyClass = '';
        let energyText = '';
        if (energy === 'alta') {
            energyClass = 'bg-primary-container/30 text-on-primary-container';
            energyText = 'Energía Alta';
        } else if (energy === 'media') {
            energyClass = 'bg-secondary-container/30 text-on-secondary-container';
            energyText = 'Energía Media';
        } else if (energy === 'baja') {
            energyClass = 'bg-tertiary-container/30 text-on-tertiary-container';
            energyText = 'Energía Baja';
        }
        energyHtml = `<span class="px-2 py-0.5 rounded-full ${energyClass} text-[10px] font-bold uppercase tracking-tighter">${energyText}</span>`;
    }

    let timeHtml = '';
    if (time || moment) {
        timeHtml = `<span class="text-[11px] text-on-surface-variant/60">• ${time ? time : moment}</span>`;
    }

    const allDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const weekDates = getCurrentWeekDates();
    const completedDates = data.completedDates || [];
    
    const daysHtml = allDays.map((d, index) => {
        const isAssigned = days && days.includes(d);
        const dateStr = weekDates[index];
        const isCompleted = completedDates.includes(dateStr);
        
        let classes = '';
        if (isAssigned && !isCompleted) {
            // Asignado, pero NO completado (Verde clarito + Borde)
            classes = 'bg-primary/20 border-primary border-2';
        } else if (isAssigned && isCompleted) {
            // Asignado y SI completado (Verde fuerte + Borde)
            classes = 'bg-primary border-primary border-2';
        } else if (!isAssigned && isCompleted) {
            // NO asignado, pero SI completado (Verde fuerte sin Borde)
            classes = 'bg-primary border-transparent border-2';
        } else {
            // NO asignado y NO completado (Gris/Opaco)
            classes = 'bg-surface-container-high border-transparent border-2';
        }
        
        return `<div class="w-4 h-4 rounded-full ${classes} flex-shrink-0" title="${d}: ${dateStr}"></div>`;
    }).join('');

    const habitCardHtml = `
        <div class="bg-surface-container-lowest p-5 rounded-lg flex items-center justify-between border border-outline-variant/20 hover:border-primary/30 transition-colors group">
            <div class="flex items-center gap-4">
                <div class="relative">
                    <input class="peer hidden custom-checkbox" id="chk-${id}" type="checkbox">
                    <label class="w-6 h-6 rounded-full border-2 border-primary-container cursor-pointer flex items-center justify-center transition-all peer-checked:bg-primary peer-checked:border-primary" for="chk-${id}">
                        <span class="material-symbols-outlined text-white text-[16px] opacity-0 transform scale-50 transition-all check-mark">check</span>
                    </label>
                </div>
                <div>
                    <h4 class="font-label-md text-label-md text-on-surface">${title}</h4>
                    <div class="flex items-center gap-2 mt-1">
                        ${energyHtml}
                        ${timeHtml}
                    </div>
                </div>
            </div>
            <div class="hidden md:flex gap-1 items-center">
                ${daysHtml}
            </div>
            <div class="flex items-center gap-2 ml-auto md:ml-4 border-l border-outline-variant/20 pl-4">
                <button class="btn-edit p-1.5 rounded-full hover:bg-surface-variant/50 text-on-surface-variant transition-colors"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                <button class="btn-delete p-1.5 rounded-full hover:bg-error/10 text-error transition-colors"><span class="material-symbols-outlined text-[18px]">delete</span></button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', habitCardHtml);
    const newCard = container.lastElementChild;

    // Checkbox strikethrough logic
    const newCheckbox = newCard.querySelector('.custom-checkbox');
    const todayDateObj = new Date();
    const todayIndex = todayDateObj.getDay() === 0 ? 6 : todayDateObj.getDay() - 1;
    const todayStr = weekDates[todayIndex];
    
    if (newCheckbox) {
        // Set initial checkbox state
        if (completedDates.includes(todayStr)) {
            newCheckbox.checked = true;
            const label = newCard.querySelector('h4');
            if (label) label.classList.add('line-through', 'text-on-surface-variant/50');
        }

        newCheckbox.addEventListener('change', async function () {
            const label = newCard.querySelector('h4');
            const isNowChecked = this.checked;
            
            if (isNowChecked) {
                if (label) label.classList.add('line-through', 'text-on-surface-variant/50');
                newCard.style.transform = 'scale(0.99)';
                setTimeout(() => newCard.style.transform = 'scale(1)', 100);
            } else {
                if (label) label.classList.remove('line-through', 'text-on-surface-variant/50');
            }
            
            // Update Firestore
            try {
                let updatedCompletedDates = [...(data.completedDates || [])];
                if (isNowChecked) {
                    if (!updatedCompletedDates.includes(todayStr)) {
                        updatedCompletedDates.push(todayStr);
                    }
                } else {
                    updatedCompletedDates = updatedCompletedDates.filter(d => d !== todayStr);
                }
                
                await updateDoc(doc(db, "usuarios", currentUser.uid, "habitos", id), {
                    completedDates: updatedCompletedDates
                });
            } catch (err) {
                console.error("Error updating completion status:", err);
                if (window.showToast) window.showToast('Error al guardar progreso', 'error');
                // Revert visual state on error
                this.checked = !isNowChecked;
                if (!isNowChecked && label) {
                     label.classList.add('line-through', 'text-on-surface-variant/50');
                } else if (label) {
                     label.classList.remove('line-through', 'text-on-surface-variant/50');
                }
            }
        });
    }

    // Card click logic (monthly progress simulator)
    newCard.addEventListener('click', (e) => {
        e.stopPropagation();
        const allCards = document.querySelectorAll('#habits-list > div.bg-surface-container-lowest');
        allCards.forEach(c => c.classList.remove('ring-2', 'ring-primary/30', 'bg-primary/5'));
        newCard.classList.add('ring-2', 'ring-primary/30', 'bg-primary/5');
        
        const rachaSection = document.querySelector('section.animate-fade-in');
        if(rachaSection) {
            const rachaTitle = rachaSection.querySelector('h3');
            if(rachaTitle) rachaTitle.textContent = `Racha: ${title}`;
        }
        
        const progressCard = document.querySelector('aside.space-y-stack-md > div.bg-surface-container-lowest');
        if(progressCard) {
            const successRate = progressCard.querySelector('.text-\\[14px\\]');
            if (successRate) successRate.textContent = '0%'; 
            
            const dots = progressCard.querySelectorAll('.grid-cols-7 div div');
            dots.forEach((dot) => {
                dot.className = 'w-1.5 h-1.5 rounded-full bg-outline-variant/40';
            });
        }
    });

    // Action buttons logic
    const actions = newCard.querySelectorAll('button');
    const btnEdit = Array.from(actions).find(b => b.textContent.includes('edit'));
    const btnDelete = Array.from(actions).find(b => b.textContent.includes('delete'));

    if (btnDelete) {
        btnDelete.addEventListener('click', async (e) => {
            e.stopPropagation();
            if(confirm("¿Estás seguro de que deseas eliminar este hábito?")) {
                try {
                    btnDelete.disabled = true;
                    btnDelete.classList.add('opacity-50');
                    await deleteDoc(doc(db, "usuarios", currentUser.uid, "habitos", id));
                    if (window.showToast) window.showToast('Hábito eliminado', 'success');
                } catch(error) {
                    console.error("Error deleting habit:", error);
                    btnDelete.disabled = false;
                    btnDelete.classList.remove('opacity-50');
                }
            }
        });
    }

    if (btnEdit) {
        btnEdit.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Set modal title
            const modalTitle = document.getElementById('habit-modal-title');
            if(modalTitle) modalTitle.textContent = 'Editar Hábito';

            document.getElementById('habit-title-input').value = title || '';
            document.getElementById('habit-desc-input').value = desc || '';
            document.getElementById('habit-time-input').value = time || '';
            document.getElementById('habit-moment-input').value = moment || '';
            
            document.querySelectorAll('input[name="habit-energy"]').forEach(rb => rb.checked = false);
            if (energy) {
                const radio = document.querySelector(`input[name="habit-energy"][value="${energy}"]`);
                if (radio) radio.checked = true;
            }
            
            document.querySelectorAll('input[name="habit-days"]').forEach(cb => cb.checked = false);
            if (days) {
                days.forEach(d => {
                    const cbs = document.querySelectorAll(`input[name="habit-days"][value="${d}"]`);
                    cbs.forEach(cb => cb.checked = true);
                });
            }
            
            const habitModalContent = document.getElementById('habit-modal-content');
            habitModalContent.dataset.editingId = id;
            if (window.openModal) window.openModal();
        });
    }
}
