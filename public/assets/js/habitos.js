// Micro-interactions and simple state management
document.querySelectorAll('.custom-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const parent = this.closest('.bg-surface-container-lowest');
        const label = parent.querySelector('h4');

        if (this.checked) {
            label.classList.add('line-through', 'text-on-surface-variant/50');
            // Simple feedback animation
            parent.style.transform = 'scale(0.99)';
            setTimeout(() => parent.style.transform = 'scale(1)', 100);
        } else {
            label.classList.remove('line-through', 'text-on-surface-variant/50');
        }
    });
});

// Simulating loading entry
window.addEventListener('DOMContentLoaded', () => {
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
});

document.addEventListener('DOMContentLoaded', () => {
    const habitCards = document.querySelectorAll('section.lg\\:col-span-2 > div.space-y-3 > div.bg-surface-container-lowest');
    const rachaSection = document.querySelector('section.animate-fade-in');
    const progressCard = document.querySelector('aside.space-y-stack-md > div.bg-surface-container-lowest');
    const mainContent = document.querySelector('main');
    
    habitCards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            habitCards.forEach(c => c.classList.remove('ring-2', 'ring-primary/30', 'bg-primary/5'));
            card.classList.add('ring-2', 'ring-primary/30', 'bg-primary/5');
            const rachaTitle = rachaSection.querySelector('h3');
            rachaTitle.textContent = `Racha: ${card.querySelector('h4').textContent}`;
            const successRate = progressCard.querySelector('.text-\\[14px\\]');
            successRate.textContent = index === 0 ? '95%' : index === 1 ? '60%' : '45%';
            const dots = progressCard.querySelectorAll('.grid-cols-7 div div');
            dots.forEach((dot, i) => {
                if (i % (index + 2) === 0) {
                    dot.className = 'w-1.5 h-1.5 rounded-full bg-outline-variant/40';
                } else {
                    dot.className = 'w-1.5 h-1.5 rounded-full bg-primary';
                }
            });
        });
    });
    
    mainContent.addEventListener('click', (e) => {
        if (!e.target.closest('.bg-surface-container-lowest')) {
            habitCards.forEach(c => c.classList.remove('ring-2', 'ring-primary/30', 'bg-primary/5'));
            rachaSection.querySelector('h3').textContent = 'Tu Racha de Bits';
            progressCard.querySelector('.text-\\[14px\\]').textContent = '82%';
            const dots = progressCard.querySelectorAll('.grid-cols-7 div div');
            dots.forEach((dot, i) => {
                if (i > 18) {
                    dot.className = 'w-1.5 h-1.5 rounded-full bg-outline-variant/40';
                } else {
                    dot.className = 'w-1.5 h-1.5 rounded-full bg-primary';
                }
            });
        }
    });

    // --- HABIT MODAL LOGIC ---
    const openHabitModalBtn = document.getElementById('open-habit-modal-btn');
    const closeHabitModalBtn = document.getElementById('close-habit-modal-btn');
    const cancelHabitBtn = document.getElementById('cancel-habit-btn');
    const habitModalOverlay = document.getElementById('habit-modal-overlay');
    const habitModalContent = document.getElementById('habit-modal-content');
    const habitDaysAllBtn = document.getElementById('habit-days-all-btn');

    if (openHabitModalBtn && habitModalOverlay) {
        const openModal = () => {
            habitModalOverlay.classList.remove('hidden');
            // trigger reflow
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
            }, 300);
        };

        openHabitModalBtn.addEventListener('click', openModal);
        closeHabitModalBtn.addEventListener('click', closeModal);
        cancelHabitBtn.addEventListener('click', closeModal);
        
        // Close on overlay click
        habitModalOverlay.addEventListener('click', (e) => {
            if (e.target === habitModalOverlay) {
                closeModal();
            }
        });
        
        // Toggle all days
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
            saveHabitBtn.addEventListener('click', () => {
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

                // ID handling (edit mode vs create mode)
                const modalContent = document.getElementById('habit-modal-content');
                let habitId = modalContent.dataset.editingId;
                const isEditing = !!habitId;
                if (!isEditing) {
                    habitId = 'h' + Date.now();
                }

                // Build energy chip HTML
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

                // Build days HTML
                const allDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
                const daysHtml = allDays.map(d => {
                    const isActive = days.includes(d);
                    const classes = isActive 
                        ? 'bg-primary border-primary' 
                        : 'bg-outline-variant/40 border-outline-variant/30';
                    return `<div class="w-2.5 h-2.5 rounded-full border-2 ${classes}" title="${d}"></div>`;
                }).join('');

                const habitCardHtml = `
                    <div class="bg-surface-container-lowest p-5 rounded-lg flex items-center justify-between border border-outline-variant/20 hover:border-primary/30 transition-colors group">
                        <div class="flex items-center gap-4">
                            <div class="relative">
                                <input class="peer hidden custom-checkbox" id="${habitId}" type="checkbox">
                                <label class="w-6 h-6 rounded-full border-2 border-primary-container cursor-pointer flex items-center justify-center transition-all peer-checked:bg-primary peer-checked:border-primary" for="${habitId}">
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
                            <button class="p-1.5 rounded-full hover:bg-surface-variant/50 text-on-surface-variant transition-colors"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                            <button class="p-1.5 rounded-full hover:bg-error/10 text-error transition-colors"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                    </div>
                `;

                const listContainer = document.getElementById('habits-list');
                if (listContainer) {
                    let newCard;
                    
                    if (isEditing) {
                        const existingCheckbox = document.getElementById(habitId);
                        if (existingCheckbox) {
                            const existingCard = existingCheckbox.closest('.bg-surface-container-lowest');
                            existingCard.insertAdjacentHTML('afterend', habitCardHtml);
                            newCard = existingCard.nextElementSibling;
                            existingCard.remove();
                        }
                    } else {
                        listContainer.insertAdjacentHTML('beforeend', habitCardHtml);
                        newCard = listContainer.lastElementChild;
                    }
                    
                    // Attach logic to the newly created element
                    if (newCard) {
                        const newCheckbox = newCard.querySelector('.custom-checkbox');
                        if (newCheckbox) {
                            newCheckbox.addEventListener('change', function () {
                                const parent = this.closest('.bg-surface-container-lowest');
                                const label = parent.querySelector('h4');
                                if (this.checked) {
                                    label.classList.add('line-through', 'text-on-surface-variant/50');
                                    parent.style.transform = 'scale(0.99)';
                                    setTimeout(() => parent.style.transform = 'scale(1)', 100);
                                } else {
                                    label.classList.remove('line-through', 'text-on-surface-variant/50');
                                }
                            });
                        }

                        // Logic for card click (monthly progress)
                        newCard.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const allCards = document.querySelectorAll('#habits-list > div.bg-surface-container-lowest');
                            allCards.forEach(c => c.classList.remove('ring-2', 'ring-primary/30', 'bg-primary/5'));
                            newCard.classList.add('ring-2', 'ring-primary/30', 'bg-primary/5');
                            
                            const rachaSection = document.querySelector('section.animate-fade-in');
                            const rachaTitle = rachaSection.querySelector('h3');
                            rachaTitle.textContent = `Racha: ${newCard.querySelector('h4').textContent}`;
                            
                            const progressCard = document.querySelector('aside.space-y-stack-md > div.bg-surface-container-lowest');
                            const successRate = progressCard.querySelector('.text-\\[14px\\]');
                            if (successRate) successRate.textContent = '0%'; 
                            
                            const dots = progressCard.querySelectorAll('.grid-cols-7 div div');
                            dots.forEach((dot, i) => {
                                dot.className = 'w-1.5 h-1.5 rounded-full bg-outline-variant/40';
                            });
                        });
                        
                        // Action buttons logic
                        const actions = newCard.querySelectorAll('button');
                        const btnEdit = Array.from(actions).find(b => b.textContent.includes('edit'));
                        const btnDelete = Array.from(actions).find(b => b.textContent.includes('delete'));

                        if (btnDelete) {
                            btnDelete.addEventListener('click', (e) => {
                                e.stopPropagation();
                                newCard.remove();
                                if (window.showToast) window.showToast('Hábito eliminado', 'success');
                            });
                        }

                        if (btnEdit) {
                            btnEdit.addEventListener('click', (e) => {
                                e.stopPropagation();
                                
                                // Populate modal with current data
                                document.getElementById('habit-title-input').value = title;
                                document.getElementById('habit-desc-input').value = desc;
                                document.getElementById('habit-time-input').value = time;
                                document.getElementById('habit-moment-input').value = moment;
                                
                                document.querySelectorAll('input[name="habit-energy"]').forEach(rb => rb.checked = false);
                                if (energy) {
                                    const radio = document.querySelector(`input[name="habit-energy"][value="${energy}"]`);
                                    if (radio) radio.checked = true;
                                }
                                
                                document.querySelectorAll('input[name="habit-days"]').forEach(cb => cb.checked = false);
                                days.forEach(d => {
                                    // Handle cases where multiple elements might have the same value (like M for Tuesday/Wednesday)
                                    // but querySelectorAll will get all of them. The user only needs them to be checked properly.
                                    // To be exact, if they checked the second M, we can't easily distinguish from just the array of values without indexes.
                                    // But for a simple prototype, checking by value works.
                                    const cbs = document.querySelectorAll(`input[name="habit-days"][value="${d}"]`);
                                    cbs.forEach(cb => cb.checked = true);
                                });
                                
                                // Set state to editing
                                modalContent.dataset.editingId = habitId;
                                openModal();
                            });
                        }
                    }
                }

                if (window.showToast) window.showToast(isEditing ? 'Hábito actualizado' : 'Hábito creado correctamente', 'success');
                
                // Clear inputs
                document.getElementById('habit-title-input').value = '';
                document.getElementById('habit-desc-input').value = '';
                document.getElementById('habit-time-input').value = '';
                document.getElementById('habit-moment-input').value = '';
                if(energyElement) energyElement.checked = false;
                document.querySelectorAll('input[name="habit-days"]').forEach(cb => cb.checked = false);
                if (habitDaysAllBtn) habitDaysAllBtn.textContent = 'Seleccionar Todos';
                delete modalContent.dataset.editingId; // Reset state

                closeModal();
            });
        }
    }
});
