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
    }
});
