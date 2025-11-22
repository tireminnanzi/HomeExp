// frontend/src/categorizationPage/categoriesManager.js
console.log('categoriesManager.js → VERSIONE DEFINITIVA – SINGLE LINE REFRESH SEMPRE ATTIVO');

const categoriesManager = {
    isDeleteMode: false,

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

        // PULSANTE X (una sola volta)
        const titleContainer = document.querySelector('.category-top');
        if (titleContainer && !document.querySelector('.delete-toggle-container')) {
            const div = document.createElement('div');
            div.className = 'delete-toggle-container';
            const btn = document.createElement('button');
            btn.textContent = 'X';
            btn.className = `category-button delete-toggle level-${levelToDisplay} ${this.isDeleteMode ? 'delete-mode-active' : ''}`;
            btn.onclick = () => {
                this.isDeleteMode = !this.isDeleteMode;
                categoryButtons.classList.toggle('delete-mode', this.isDeleteMode);
                this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
            };
            div.appendChild(btn);
            titleContainer.style.position = 'relative';
            titleContainer.appendChild(div);
        }

        // CATEGORIE DEL LIVELLO CORRENTE
        const categoriesToShow = categoriesList.filter(cat => {
            if (levelToDisplay === 1) return !cat.parent;
            return cat.parent === parentCategoryName;
        });

        categoriesToShow.forEach(cat => {
            const btn = document.createElement('button');
            btn.textContent = cat.name;
            btn.className = `category-button level-${levelToDisplay}`;
            btn.onclick = async () => {
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
                        this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
                    }
                    return;
                }

                // ASSEGNAZIONE CATEGORIA – SINGLE LINE REFRESH GARANTITO
                const result = await window.assignCategoryToExpense(expense, levelToDisplay, cat.name);
                if (result.success) {
                    const updatedExpense = result.data;

                    // Aggiorna in memoria
                    const idx = expensesList.findIndex(e => e.id === updatedExpense.id);
                    if (idx !== -1) expensesList[idx] = updatedExpense;

                    // SINGLE LINE REFRESH – SEMPRE!
                    window.expenseManager.renderRow(updatedExpense, true);

                    // Aggiorna pulsanti se non è livello 3
                    if (levelToDisplay < 3) {
                        this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
                    }

                    // Al livello 3 → vai alla spesa successiva
                    if (levelToDisplay === 3) {
                        const currentIdx = expensesList.findIndex(e => e.id === selectedExpenseId);
                        const nextExpense = expensesList[currentIdx + 1] || expensesList[0];
                        if (nextExpense) {
                            window.expenseManager.selectExpense(nextExpense.id);
                        }
                    }
                }
            };
            categoryButtons.appendChild(btn);
        });

        // PULSANTE AGGIUNGI NUOVA CATEGORIA – FUNZIONA AL 100%
        const addButton = document.createElement('button');
        addButton.className = `category-button add-category level-${levelToDisplay} ${this.isDeleteMode ? 'disabled' : ''}`;
        addButton.innerHTML = '⋮';
        addButton.onclick = () => {
            if (this.isDeleteMode) return;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'category-button add-category editing';
            input.style.cssText = 'background:white;color:black;border:2px solid #3b82f6;padding:8px 16px;font-size:14px;border-radius:4px;min-width:140px;';
            input.placeholder = 'Nuova categoria...';

            categoryButtons.replaceChild(input, addButton);
            setTimeout(() => input.focus(), 10);

            const submit = async () => {
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
                    categoryButtons.replaceChild(addButton, input);
                }
            };

            let submitted = false;

            const safeSubmit = async () => {
                if (submitted) return;
                submitted = true;
                await submit();
            };

            input.onkeydown = e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    safeSubmit();
                }
                if (e.key === 'Escape') {
                    submitted = true; // blocca anche onblur
                    categoryButtons.replaceChild(addButton, input);
                }
            };

            input.onblur = () => {
                // Solo se non è stato già inviato con Enter o Escape
                if (!submitted) {
                    safeSubmit();
                }
            };



        };
        categoryButtons.appendChild(addButton);
    }
};

window.categoriesManager = categoriesManager;
console.log('categoriesManager → PRONTO E PERFETTO');