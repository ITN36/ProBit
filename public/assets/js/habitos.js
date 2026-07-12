import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
let currentUser = null;
let allHabits = [];
let currentHabitFilter = 'pendientes';
let selectedHabitId = null;
let currentCalendarDate = new Date();

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

    // Clicking outside a habit card deselects the current habit
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.habit-card-wrapper')) {
            if (selectedHabitId !== null) {
                selectedHabitId = null;
                renderHabitsList();
            }
        }
    });

    // --- HABIT TABS LOGIC ---
    const tabPendientes = document.getElementById('tab-habit-pendientes');
    const tabCompletados = document.getElementById('tab-habit-completados');
    if (tabPendientes && tabCompletados) {
        const tabs = [tabPendientes, tabCompletados];
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active classes
                tabs.forEach(t => {
                    t.classList.remove('bg-white', 'text-primary', 'shadow-sm');
                    t.classList.add('text-on-surface-variant', 'hover:bg-surface');
                });
                // Add active classes to clicked tab
                tab.classList.remove('text-on-surface-variant', 'hover:bg-surface');
                tab.classList.add('bg-white', 'text-primary', 'shadow-sm');
                
                currentHabitFilter = tab.dataset.status;
                if (typeof renderHabitsList === 'function') {
                    renderHabitsList();
                }
            });
        });
    }

    // --- HABIT MODAL LOGIC ---
    const openHabitModalBtn = document.getElementById('open-habit-modal-btn');
    const closeHabitModalBtn = document.getElementById('close-habit-modal-btn');
    const cancelHabitBtn = document.getElementById('cancel-habit-btn');
    const habitModalOverlay = document.getElementById('habit-modal-overlay');
    const habitModalContent = document.getElementById('habit-modal-content');
    const habitDaysAllBtn = document.getElementById('habit-days-all-btn');

    // --- GLOBAL CLICK LISTENER TO DESELECT HABIT ---
    document.addEventListener('click', (e) => {
        // Ignorar si hacemos clic en una tarjeta de hábito o en las pestañas
        if (e.target.closest('.habit-card-wrapper') || e.target.closest('#habit-status-tabs')) return;
        // Ignorar si hacemos clic en el modal o su botón de abrir
        if (e.target.closest('#open-habit-modal-btn') || e.target.closest('#habit-modal-overlay')) return;
        // Ignorar clicks en botones de edición o borrar para que no interfiera
        if (e.target.closest('button')) return;
        
        if (selectedHabitId !== null) {
            selectedHabitId = null;
            if (typeof renderHabitsList === 'function') {
                renderHabitsList();
            }
        }
    });

    if (openHabitModalBtn && habitModalOverlay) {
        window.openModal = () => {
            habitModalOverlay.classList.remove('hidden');
            void habitModalOverlay.offsetWidth;
            habitModalOverlay.classList.remove('opacity-0');
            habitModalOverlay.classList.add('opacity-100');
            habitModalContent.classList.remove('scale-95', 'opacity-0');
            habitModalContent.classList.add('scale-100', 'opacity-100');
        };

        const closeModal = () => {
            habitModalOverlay.classList.remove('opacity-100');
            habitModalOverlay.classList.add('opacity-0');
            habitModalContent.classList.remove('scale-100', 'opacity-100');
            habitModalContent.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                habitModalOverlay.classList.add('hidden');
            }, 200);
        };

        openHabitModalBtn.addEventListener('click', window.openModal);
        closeHabitModalBtn.addEventListener('click', closeModal);
        cancelHabitBtn.addEventListener('click', closeModal);
        
        habitModalOverlay.addEventListener('click', (e) => {
            if (e.target === habitModalOverlay) {
                closeModal();
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
                    
                    closeModal();
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
    
    // --- CALENDAR LOGIC ---
    const prevBtn = document.getElementById('calendar-prev-btn');
    const nextBtn = document.getElementById('calendar-next-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't let the document listener reset selectedHabitId
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't let the document listener reset selectedHabitId
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
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
        allHabits = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // If the user forgot to select days when creating the habit, default to everyday
            if (!data.days || data.days.length === 0) {
                data.days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
            }
            allHabits.push({ id: docSnap.id, ...data });
        });
        renderHabitsList();
    });
}

function renderHabitsList() {
    const listContainer = document.getElementById('habits-list');
    const emptyState = document.getElementById('habit-empty-state');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const weekDates = getCurrentWeekDates();
    const todayDateObj = new Date();
    const todayIndex = todayDateObj.getDay() === 0 ? 6 : todayDateObj.getDay() - 1;
    const todayStr = weekDates[todayIndex];

    const filteredHabits = allHabits.filter(habit => {
        const completed = habit.completedDates && habit.completedDates.includes(todayStr);
        if (currentHabitFilter === 'pendientes') {
            return !completed;
        } else {
            return completed;
        }
    });

    // Sort by proximity to today
    const dayMap = { 'L':0, 'M':1, 'X':2, 'J':3, 'V':4, 'S':5, 'D':6 };
    function getDaysUntilNext(habit) {
        if (!habit.days || habit.days.length === 0) return 999;
        let minDistance = 999;
        for (const d of habit.days) {
            const targetIndex = dayMap[d];
            if (targetIndex === undefined) continue;
            let distance = targetIndex - todayIndex;
            if (distance < 0) distance += 7;
            if (distance < minDistance) minDistance = distance;
        }
        return minDistance;
    }

    filteredHabits.sort((a, b) => {
        return getDaysUntilNext(a) - getDaysUntilNext(b);
    });

    if (filteredHabits.length === 0) {
        if (emptyState) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
            const title = document.getElementById('habit-empty-title');
            const desc = document.getElementById('habit-empty-desc');
            if (currentHabitFilter === 'pendientes') {
                title.textContent = '¡Todo al día!';
                desc.textContent = 'No tienes hábitos pendientes por hoy.';
            } else {
                title.textContent = 'Aún no hay completados';
                desc.textContent = 'Tus hábitos completados aparecerán aquí.';
            }
        }
    } else {
        if (emptyState) {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');
        }
        filteredHabits.forEach(habit => {
            renderHabitCard(habit.id, habit, listContainer);
        });
    }

    // Always update streak UI and calendar after rendering (even if filteredHabits is empty)
    const activeHabit = allHabits.find(h => h.id === selectedHabitId);
    if (activeHabit) {
        updateStreakUI(activeHabit);
    } else {
        updateGlobalStreakUI();
    }
    renderCalendar();
}

function getGlobalCompletedDates() {
    const dates = new Set();
    allHabits.forEach(habit => {
        if (habit.completedDates) {
            habit.completedDates.forEach(d => dates.add(d));
        }
    });
    return dates;
}

function calculateGlobalStreak() {
    const globalDates = getGlobalCompletedDates();
    if (globalDates.size === 0) return 0;
    
    let streak = 0;
    let today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        
        if (globalDates.has(dateStr)) {
            streak++;
        } else {
            if (i === 0) continue; // Skip breaking if not done today yet
            else break;
        }
    }
    return streak;
}

function updateGlobalStreakUI() {
    const titleEl = document.getElementById('streak-section-title');
    const containerEl = document.getElementById('streak-circles-container');
    const countEl = document.getElementById('streak-count-text');
    
    if (!titleEl || !containerEl || !countEl) return;
    
    titleEl.textContent = `Tu Racha de Bits`;
    countEl.textContent = calculateGlobalStreak();
    
    const allDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const weekDates = getCurrentWeekDates();
    const globalDates = getGlobalCompletedDates();
    
    const circlesHtml = allDays.map((d, index) => {
        const dateStr = weekDates[index];
        const isCompleted = globalDates.has(dateStr);
        
        const dayLabel = d === 'X' ? 'MIÉ' : (d === 'M' ? 'MAR' : (d === 'S' ? 'SÁB' : (d === 'D' ? 'DOM' : (d === 'L' ? 'LUN' : (d === 'J' ? 'JUE' : 'VIE')))));
        
        let circleContent = '';
        let classes = '';
        
        if (isCompleted) {
            classes = 'bg-primary text-white';
            circleContent = `<span class="material-symbols-outlined text-[20px]">check</span>`;
        } else {
            classes = 'bg-surface-container border-2 border-transparent';
        }
        
        return `
            <div class="flex flex-col items-center gap-2 min-w-max pr-2 md:pr-4">
                <span class="text-[10px] font-semibold text-on-surface-variant/50">${dayLabel}</span>
                <div class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bit-circle ${classes}">
                    ${circleContent}
                </div>
            </div>
        `;
    }).join('');
    
    containerEl.innerHTML = circlesHtml;
    // renderCalendar() is called by renderHabitsList after this function returns
}

// renderCalendar always reads selectedHabitId from the global — no parameters needed.
// This ensures it works correctly regardless of who calls it (card click, month nav, onSnapshot, etc.)
function renderCalendar() {
    const gridEl = document.getElementById('monthly-calendar-grid');
    const labelEl = document.getElementById('calendar-month-label');
    if (!gridEl || !labelEl) return;
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    labelEl.textContent = monthNames[month];
    
    // Always look up the selected habit directly from allHabits using the global selectedHabitId
    const activeHabit = selectedHabitId ? allHabits.find(h => h.id === selectedHabitId) : null;
    
    // If no habit is selected, show placeholder
    if (!activeHabit) {
        let html = `
            <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">L</div>
            <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">M</div>
            <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">X</div>
            <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">J</div>
            <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">V</div>
            <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">S</div>
            <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">D</div>
            <div class="col-span-7 py-6 flex items-center justify-center text-on-surface-variant/40 text-[11px] italic">Selecciona un hábito</div>
        `;
        gridEl.innerHTML = html;
        const rateEl = document.getElementById('success-rate-text');
        if (rateEl) rateEl.textContent = '-';
        return;
    }
    
    const assignedDays = activeHabit.days || [];
    const completedDatesSet = new Set(activeHabit.completedDates || []);
    const dayMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;
    
    let html = `
        <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">L</div>
        <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">M</div>
        <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">X</div>
        <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">J</div>
        <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">V</div>
        <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">S</div>
        <div class="text-[9px] font-bold text-on-surface-variant/40 flex justify-center">D</div>
    `;
    
    for (let i = 0; i < startDayIndex; i++) {
        html += `<div></div>`;
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(year, month, i);
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const dayOfWeekStr = dayMap[dateObj.getDay()];
        
        const isCompleted = completedDatesSet.has(dateStr);
        const isAssigned = assignedDays.includes(dayOfWeekStr);
        
        let classes;
        if (isCompleted) {
            classes = 'bg-primary border-primary border-2';
        } else if (isAssigned) {
            classes = 'border-2 border-primary bg-transparent';
        } else {
            classes = 'bg-surface-container-high border-transparent border-2';
        }
        
        html += `<div class="flex justify-center items-center" title="${dateStr}"><div class="w-4 h-4 rounded-full ${classes}"></div></div>`;
    }
    
    gridEl.innerHTML = html;
    
    // Calculate Tasa de éxito (only up to today)
    const today = new Date();
    let limitDate = daysInMonth;
    if (year === today.getFullYear() && month === today.getMonth()) {
        limitDate = today.getDate();
    } else if (year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth())) {
        limitDate = 0;
    }
    
    let assignedCount = 0;
    let completedCount = 0;
    for (let i = 1; i <= limitDate; i++) {
        const dateObj = new Date(year, month, i);
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const dayOfWeekStr = dayMap[dateObj.getDay()];
        if (assignedDays.includes(dayOfWeekStr)) {
            assignedCount++;
            if (completedDatesSet.has(dateStr)) completedCount++;
        }
    }
    
    const rate = assignedCount === 0 ? 0 : Math.round((completedCount / assignedCount) * 100);
    const rateEl = document.getElementById('success-rate-text');
    if (rateEl) rateEl.textContent = `${rate}%`;
}

function calculateStreak(habit) {
    if (!habit.days || habit.days.length === 0) return 0;
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const dayMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
    
    let streak = 0;
    let today = new Date();
    // Check up to 365 days back
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        
        const dayOfWeekStr = dayMap[d.getDay()];
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        
        const isAssigned = habit.days.includes(dayOfWeekStr);
        const isCompleted = habit.completedDates.includes(dateStr);
        
        if (isAssigned) {
            if (isCompleted) {
                streak++;
            } else {
                if (i === 0) {
                    continue; // Skip breaking on today if not done yet
                } else {
                    break; // Streak broken
                }
            }
        }
    }
    return streak;
}

function updateStreakUI(habit) {
    const titleEl = document.getElementById('streak-section-title');
    const containerEl = document.getElementById('streak-circles-container');
    const countEl = document.getElementById('streak-count-text');
    
    if (!titleEl || !containerEl || !countEl) return;
    
    titleEl.textContent = `Racha: ${habit.title}`;
    countEl.textContent = calculateStreak(habit);
    
    const allDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const weekDates = getCurrentWeekDates();
    const completedDates = habit.completedDates || [];
    const days = habit.days || [];
    
    const circlesHtml = allDays.map((d, index) => {
        const isAssigned = days.includes(d);
        const dateStr = weekDates[index];
        const isCompleted = completedDates.includes(dateStr);
        
        const dayLabel = d === 'X' ? 'MIÉ' : (d === 'M' ? 'MAR' : (d === 'S' ? 'SÁB' : (d === 'D' ? 'DOM' : (d === 'L' ? 'LUN' : (d === 'J' ? 'JUE' : 'VIE')))));
        
        let circleContent = '';
        let classes = '';
        
        if (isCompleted) {
            classes = 'bg-primary text-white';
            circleContent = `<span class="material-symbols-outlined text-[20px]">check</span>`;
        } else if (isAssigned) {
            classes = 'bg-primary/20 border-2 border-dashed border-primary/40';
        } else {
            classes = 'bg-surface-container border-2 border-transparent';
        }
        
        return `
            <div class="flex flex-col items-center gap-2 min-w-max pr-2 md:pr-4">
                <span class="text-[10px] font-semibold text-on-surface-variant/50">${dayLabel}</span>
                <div class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bit-circle ${classes}">
                    ${circleContent}
                </div>
            </div>
        `;
    }).join('');
    
    containerEl.innerHTML = circlesHtml;
    // renderCalendar() is called by renderHabitsList after this function returns
}

function renderHabitCard(id, data, container) {
    const { title, desc, time, moment, energy, days } = data;

    let energyHtml = '';
    if (energy) {
        let energyClass = '';
        if (energy === 'alta') energyClass = 'bg-primary-container text-on-primary-container';
        else if (energy === 'media') energyClass = 'bg-surface-variant text-on-surface-variant';
        else energyClass = 'bg-outline-variant/30 text-on-surface-variant';
        
        energyHtml = `<span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${energyClass}">Energía ${energy}</span>`;
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
        
        let circleClasses = '';
        if (isCompleted) {
            circleClasses = 'bg-primary border-primary';
        } else if (isAssigned) {
            circleClasses = 'border-primary bg-transparent';
        } else {
            circleClasses = 'border-outline-variant/30 bg-surface-container-low';
        }
        
        return `<div class="w-3 h-3 rounded-full border flex-shrink-0 ${circleClasses}" title="${d}: ${dateStr}"></div>`;
    }).join('');

    const habitCardHtml = `
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
    `;

    const newCard = document.createElement('div');
    newCard.className = `habit-card-wrapper bg-surface-container-lowest p-4 md:p-5 rounded-lg flex items-center justify-between border ${selectedHabitId === id ? 'border-primary shadow-sm ring-1 ring-primary/30' : 'border-outline-variant/20'} hover:border-primary/30 transition-colors group cursor-pointer`;
    newCard.innerHTML = habitCardHtml;
    
    newCard.addEventListener('click', (e) => {
        if (e.target.closest('label[for^="chk-"]') || e.target.closest('.custom-checkbox') || e.target.closest('button')) return;
        e.stopPropagation(); // Prevent document listener from resetting selectedHabitId
        selectedHabitId = id;
        renderHabitsList(); // Re-render to show selection ring and update streak UI
    });

    container.appendChild(newCard);

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
