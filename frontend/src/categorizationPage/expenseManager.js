// frontend/src/categorizationPage/expenseManager.js
console.log('expenseManager.js loaded');

const expenseManager = {
    updateExpenseDisplay(expenses, selectedExpenseId) {
        console.log('updateExpenseDisplay called with expenses:', expenses.length, 'selectedExpenseId:', selectedExpenseId);
        const expenseList = document.getElementById('expense-list');
        if (!expenseList) {
            console.error('expense-list element not found');
            return;
        }
        expenseList.innerHTML = '';

        expenses.forEach(expense => {
            const expenseItem = document.createElement('li');
            expenseItem.className = 'expense-item';
            expenseItem.dataset.expenseId = expense.id; // per debug

            expenseItem.innerHTML = `
                <span class="expense-date">${expense.date}</span>
                <span class="expense-description" contenteditable="false">${expense.description}</span>
                <span class="expense-amount ${expense.amount < 0 ? 'expense-negative' : 'expense-positive'}">${expense.amount}</span>
            `;

            if (expense.amount < 0) expenseItem.classList.add('expense-negative');
            else if (expense.amount > 0) expenseItem.classList.add('expense-positive');

            // === DOPPIO CLICK SULLA DESCRIZIONE ===
            const descriptionSpan = expenseItem.querySelector('.expense-description');
            descriptionSpan.style.cursor = 'text';
            descriptionSpan.title = 'Doppio click per modificare';

            descriptionSpan.addEventListener('dblclick', (e) => {
                console.log('DOPPIO CLICK RILEVATO! ID:', expense.id); // LOG VISIBILE

                e.stopPropagation(); // Blocca selezione

                const span = e.target;
                const originalText = span.textContent;

                span.contentEditable = true;
                span.focus();
                document.execCommand('selectAll', false, null);

                span.style.outline = '1px solid #007bff';
                span.style.borderRadius = '4px';
                span.style.padding = '2px';

                const save = async () => {
                    const newText = span.textContent.trim();
                    if (newText && newText !== originalText) {
                        try {
                            const updated = { ...expense, description: newText };
                            const res = await fetch(`http://localhost:3000/expenses/${expense.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(updated)
                            });
                            if (res.ok) {
                                const data = await res.json();
                                const idx = expenses.findIndex(e => e.id === expense.id);
                                if (idx !== -1) expenses[idx] = data;
                                if (window.expensesList) {
                                    const gIdx = window.expensesList.findIndex(e => e.id === expense.id);
                                    if (gIdx !== -1) window.expensesList[gIdx] = data;
                                }
                                console.log('Descrizione salvata:', newText);
                            }
                        } catch (err) {
                            console.error('Errore:', err);
                            span.textContent = originalText;
                        }
                    }
                    span.contentEditable = false;
                    span.style.outline = '';
                    span.style.borderRadius = '';
                    span.style.padding = '';
                };

                const handleKey = (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        span.blur();
                    } else if (e.key === 'Escape') {
                        span.textContent = originalText;
                        span.blur();
                    }
                };

                span.addEventListener('keydown', handleKey);
                span.addEventListener('blur', () => {
                    span.removeEventListener('keydown', handleKey);
                    save();
                }, { once: true });
            });

            // === CATEGORIE ===
            const categoryTags = document.createElement('div');
            categoryTags.className = 'category-tags';
            const categories = [
                { name: expense.category1, level: 1 },
                { name: expense.category2, level: 2 },
                { name: expense.category3, level: 3 }
            ].filter(c => c.name);

            categories.forEach(cat => {
                const tag = document.createElement('button');
                tag.textContent = cat.name;
                tag.className = `expense-category-button level-${cat.level}`;
                tag.onclick = (e) => {
                    e.stopPropagation();
                    window.assignCategoryToExpense(expense, cat.level, null).then(result => {
                        if (result.success) {
                            const idx = expenses.findIndex(e => e.id === expense.id);
                            if (idx !== -1) expenses[idx] = result.data;
                            if (window.expensesList) {
                                const gIdx = window.expensesList.findIndex(e => e.id === expense.id);
                                if (gIdx !== -1) window.expensesList[gIdx] = result.data;
                            }
                            expenseList.dispatchEvent(new CustomEvent('expenseSelected', { detail: { id: expense.id } }));
                        }
                    });
                };
                categoryTags.appendChild(tag);
            });
            expenseItem.appendChild(categoryTags);

            // === SELEZIONE: SOLO SU ELEMENTI NON EDITABILI ===
            const selectableElements = [
                expenseItem.querySelector('.expense-date'),
                expenseItem.querySelector('.expense-amount'),
                ...expenseItem.querySelectorAll('.expense-category-button')
            ];

            selectableElements.forEach(el => {
                if (el) {
                    el.style.cursor = 'pointer';
                    el.onclick = (e) => {
                        e.stopPropagation();
                        console.log('Selezione da elemento:', expense.id);
                        expenseList.dispatchEvent(new CustomEvent('expenseSelected', { detail: { id: expense.id } }));
                    };
                }
            });

            // Highlight selezionata
            if (expense.id === selectedExpenseId) {
                expenseItem.classList.add('selected');
            }

            expenseList.appendChild(expenseItem);
        });
        console.log('updateExpenseDisplay completed');
    }
};

window.expenseManager = expenseManager;
console.log('expenseManager initialized');