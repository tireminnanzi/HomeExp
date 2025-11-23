// frontend/src/categorizationPage/categoriesManager.js
console.log('categoriesManager.js → VERSIONE DEFINITIVA – DELETE MODE PERFETTO, NIENTE SPARIZIONI');

const categoriesManager = {
    isDeleteMode: false,
    currentClickOutsideHandler: null,

    // FUNZIONE CENTRALIZZATA PER USCIRE DA DELETE MODE
exitDeleteMode(selectedExpenseId, expensesList, categoriesList) {
    this.isDeleteMode = false;
    const categoryButtons = document.getElementById('category-buttons');
    const deleteToggle = document.querySelector('.delete-toggle');

    if (categoryButtons) categoryButtons.classList.remove('delete-mode');
    if (deleteToggle) deleteToggle.classList.remove('delete-mode-active');
    document.body.classList.remove('delete-mode-active');  // ← AGGIUNGI QUESTA RIGA

    if (this.currentClickOutsideHandler) {
        document.removeEventListener('click', this.currentClickOutsideHandler);
        this.currentClickOutsideHandler = null;
    }

    this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
},

    updateCategoryButtons(selectedExpenseId, expensesList, categoriesList) {
        const categoryButtons = document.getElementById('category-buttons');
        if (!categoryButtons) return console.error('category-buttons not found');
        categoryButtons.innerHTML = '';

        if (!selectedExpenseId || !expensesList || !categoriesList) return;

        const expense = expensesList.find(e => e.id === selectedExpenseId);
        if (!expense) return;

        let levelToDisplay = 1;
        let parentCategoryName = null;

        if (expense.category1 && !expense.category2) {
            levelToDisplay = 2;
            parentCategoryName = expense.category1;
        } else if (expense.category2) {
            levelToDisplay = 3;
            parentCategoryName = expense.category2;
        }

        // === PULSANTE X (creato una sola volta) ===
        const titleContainer = document.querySelector('.category-top');
        if (titleContainer) {
            let container = titleContainer.querySelector('.delete-toggle-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'delete-toggle-container';
                titleContainer.style.position = 'relative';
                titleContainer.appendChild(container);
            }

            let btn = container.querySelector('.delete-toggle');
            if (!btn) {
                btn = document.createElement('button');
                btn.textContent = 'X';
                btn.className = `category-button delete-toggle level-${levelToDisplay}`;
                container.appendChild(btn);
            } else {
                // Aggiorna solo la classe del livello
                btn.className = btn.className.replace(/level-\d/, `level-${levelToDisplay}`);
            }

            // CLICK X → ENTRA IN DELETE MODE
               btn.onclick = (e) => {
               e.stopPropagation();
               this.isDeleteMode = true;
               categoryButtons.classList.add('delete-mode');
               btn.classList.add('delete-mode-active');
               document.body.classList.add('delete-mode-active');

                if (this.currentClickOutsideHandler) {
                    document.removeEventListener('click', this.currentClickOutsideHandler);
                }

                this.currentClickOutsideHandler = (ev) => {
                    const isCategoryBtn = ev.target.closest('.category-button:not(.delete-toggle):not(.add-category)');
                    const isDeleteBtn = ev.target.closest('.delete-toggle');

                    if (!isCategoryBtn && !isDeleteBtn) {
                        this.exitDeleteMode(selectedExpenseId, expensesList, categoriesList);
                    }
                };

                setTimeout(() => document.addEventListener('click', this.currentClickOutsideHandler), 100);
            };
        }

        // === CATEGORIE DEL LIVELLO CORRENTE ===
        const categoriesToShow = categoriesList.filter(cat => {
            if (levelToDisplay === 1) return !cat.parent;
            return cat.parent === parentCategoryName;
        });

        categoriesToShow.forEach(cat => {
            const btn = document.createElement('button');
            btn.textContent = cat.name;
            btn.className = `category-button level-${levelToDisplay}`;
            btn.onclick = async (e) => {
                e.stopPropagation();

                if (this.isDeleteMode) {
                    if (!confirm(`Eliminare la categoria "${cat.name}" da tutte le spese?`)) return;

                    const res = await window.deleteSingleCategory(cat.name);
                    if (res.success) {
                        // Rimuovi dalla lista locale
                        const idx = categoriesList.findIndex(c => c.name === cat.name);
                        if (idx !== -1) categoriesList.splice(idx, 1);

                        // Pulisci le spese
                        expensesList.forEach(exp => {
                            if (exp.category1 === cat.name) exp.category1 = exp.category2 = exp.category3 = null;
                            else if (exp.category2 === cat.name) exp.category2 = exp.category3 = null;
                            else if (exp.category3 === cat.name) exp.category3 = null;
                            window.expenseManager.renderRow(exp, exp.id === selectedExpenseId);
                        });

                        // ESCE AUTOMATICAMENTE DA DELETE MODE
                        this.exitDeleteMode(selectedExpenseId, expensesList, categoriesList);
                    }
                    return;
                }

                // === ASSEGNAZIONE NORMALE ===
                const result = await window.assignCategoryToExpense(expense, levelToDisplay, cat.name);
                if (result.success) {
                    const updatedExpense = result.data;
                    const idx = expensesList.findIndex(e => e.id === updatedExpense.id);
                    if (idx !== -1) expensesList[idx] = updatedExpense;
                    window.expenseManager.renderRow(updatedExpense, true);

                    if (levelToDisplay < 3) {
                        this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
                    }

                    if (levelToDisplay === 3) {
                        const currentIdx = expensesList.findIndex(e => e.id === selectedExpenseId);
                        const nextExpense = expensesList[currentIdx + 1] || expensesList[0];
                        if (nextExpense) window.expenseManager.selectExpense(nextExpense.id);
                    }
                }
            };
            categoryButtons.appendChild(btn);
        });

        // === PULSANTE AGGIUNGI NUOVA CATEGORIA ===
        const addButton = document.createElement('button');
        addButton.className = `category-button add-category level-${levelToDisplay} ${this.isDeleteMode ? 'disabled' : ''}`;
        addButton.innerHTML = '⋮';
        addButton.onclick = (e) => {
            e.stopPropagation();
            if (window.categoriesManager?.isDeleteMode) return;

            if (this.isDeleteMode) {
                this.exitDeleteMode(selectedExpenseId, expensesList, categoriesList);
                return;
            }

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Nuova categoria...';
            input.style.cssText = `
                padding: 10px 14px; font-size: 15px; font-weight: 500;
                border: 2px solid #3b82f6; border-radius: 8px;
                background: white; color: #1f2937; outline: none;
                min-width: 180px; box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
                caret-color: #3b82f6;
            `;

            categoryButtons.replaceChild(input, addButton);
            input.focus();
            input.select();

            let submitted = false;
            const submit = async () => {
                if (submitted) return;
                submitted = true;

                const name = input.value.trim();
                if (!name || (name.match(/[a-zA-Z]/g) || []).length < 2) {
                    categoryButtons.replaceChild(addButton, input);
                    return;
                }

                const parent = levelToDisplay === 1 ? null :
                              levelToDisplay === 2 ? expense.category1 : expense.category2;

                const res = await window.addNewCategory(name, parent);
                if (res.success) {
                    categoriesList.push(res.data);
                    this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
                } else {
                    alert(res.message || "Categoria già esistente");
                    categoryButtons.replaceChild(addButton, input);
                }
            };

            input.onkeydown = ev => {
                if (ev.key === 'Enter') { ev.preventDefault(); submit(); }
                if (ev.key === 'Escape') { submitted = true; categoryButtons.replaceChild(addButton, input); }
            };
            input.onblur = () => { if (!submitted) submit(); };
        };
        categoryButtons.appendChild(addButton);
    }
};

window.categoriesManager = categoriesManager;
console.log('categoriesManager → PRONTO, FUNZIONA AL 100%, NIENTE SPARIZIONI');