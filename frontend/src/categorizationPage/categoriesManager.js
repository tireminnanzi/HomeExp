// frontend/src/categorizationPage/categoriesManager.js
console.log('categoriesManager.js → VERSIONE FINALE – PULSANTE X COLORE SINCRONIZZATO 100%');

const categoriesManager = {
    isDeleteMode: false,
    currentClickOutsideHandler: null,

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

        // === PULSANTE X – COLORE SEMPRE CORRETTO CON IL LIVELLO ===
        const titleContainer = document.querySelector('.category-top');
        if (titleContainer && !document.querySelector('.delete-toggle-container')) {
            const div = document.createElement('div');
            div.className = 'delete-toggle-container';

            const btn = document.createElement('button');
            btn.textContent = 'X';
            btn.className = `category-button delete-toggle level-${levelToDisplay}`;

            // Aggiorna classe level ogni volta (importante!)
            const updateLevelClass = () => {
                btn.classList.remove('level-1', 'level-2', 'level-3');
                btn.classList.add(`level-${levelToDisplay}`);
            };

            updateLevelClass();

            btn.onclick = (e) => {
                e.stopPropagation();
                this.isDeleteMode = !this.isDeleteMode;
                categoryButtons.classList.toggle('delete-mode', this.isDeleteMode);
                btn.classList.toggle('delete-mode-active', this.isDeleteMode);

                if (this.currentClickOutsideHandler) {
                    document.removeEventListener('click', this.currentClickOutsideHandler);
                    this.currentClickOutsideHandler = null;
                }

                if (this.isDeleteMode) {
                    this.currentClickOutsideHandler = (ev) => {
                        if (!ev.target.closest('.category-button') && !ev.target.closest('.delete-toggle')) {
                            this.isDeleteMode = false;
                            categoryButtons.classList.remove('delete-mode');
                            btn.classList.remove('delete-mode-active');
                            document.removeEventListener('click', this.currentClickOutsideHandler);
                            this.currentClickOutsideHandler = null;
                            this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
                        }
                    };
                    setTimeout(() => document.addEventListener('click', this.currentClickOutsideHandler), 10);
                }

                this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
            };

            div.appendChild(btn);
            titleContainer.style.position = 'relative';
            titleContainer.appendChild(div);
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
                        const idx = categoriesList.findIndex(c => c.name === cat.name);
                        if (idx !== -1) categoriesList.splice(idx, 1);
                        expensesList.forEach(exp => {
                            if (exp.category1 === cat.name) exp.category1 = exp.category2 = exp.category3 = null;
                            else if (exp.category2 === cat.name) exp.category2 = exp.category3 = null;
                            else if (exp.category3 === cat.name) exp.category3 = null;
                            window.expenseManager.renderRow(exp, exp.id === selectedExpenseId);
                        });
                        this.isDeleteMode = false;
                        categoryButtons.classList.remove('delete-mode');
                        this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
                    }
                    return;
                }

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
            if (this.isDeleteMode) return;

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
console.log('categoriesManager → PRONTO – PULSANTE X COLORE 100% SINCRONIZZATO');