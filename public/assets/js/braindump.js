function captureThought() {
            const input = document.getElementById('brain-dump-input');
            const container = document.getElementById('thoughts-container');

            if (input.value.trim() === '') return;

            // Create new card
            const newCard = document.createElement('div');
            newCard.className = "bg-surface-container-lowest border border-outline-variant p-6 rounded-xl group hover:shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4";
            newCard.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <span class="px-2 py-1 bg-secondary-container/30 text-on-secondary-container text-[10px] uppercase tracking-wider font-bold rounded">Ahora mismo</span>
                    <button class="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                </div>
                <p class="font-body-md text-body-md text-on-surface mb-6 leading-relaxed">
                    ${input.value}
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

            // Prepend new card
            container.insertBefore(newCard, container.firstChild);

            // Clear input
            input.value = '';
            input.focus();
        }

        // Allow Enter to capture
        document.getElementById('brain-dump-input').addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                captureThought();
            }
        });