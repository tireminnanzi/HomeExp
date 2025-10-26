// Frontend/src/categorizationPage/expenseManager.js
console.log('expenseManager.js loaded');

const expenseManager = {
    updateExpenseDisplay(expenses, selectedExpenseId) {
        console.log('updateExpenseDisplay called with expenses:', expenses, 'selectedExpenseId:', selectedExpenseId);
        const expenseList = document.getElementById('expense-list');
        if (!expenseList) {
            console.error('Expense list element not found');
            return;
        }
        expenseList.innerHTML = '';

        if (expenses.length === 0) {
            expenseList.innerHTML = '<p class="no-data">No expenses found</p>';
            return;
        }

        expenses.forEach(expense => {
            const li = document.createElement('li');
            li.className = `expense-item ${expense.id === selectedExpenseId ? 'selected' : ''} ${expense.amount < 0 ? 'expense-negative' : 'expense-positive'}`;
            li.dataset.id = expense.id; // Add data-id for easier selection
            li.innerHTML = `
                <span class="expense-date">${expense.date}</span>
                <span class="expense-description">${expense.description}</span>
                <span class="expense-amount">${expense.amount.toFixed(2)}</span>
                <div class="category-tags">
                    ${expense.category1 ? `<button class="expense-category-button level-1">${expense.category1}</button>` : ''}
                    ${expense.category2 ? `<button class="expense-category-button level-2">${expense.category2}</button>` : ''}
                    ${expense.category3 ? `<button class="expense-category-button level-3">${expense.category3}</button>` : ''}
                </div>
            `;
            li.onclick = () => {
                console.log('Expense selected:', expense.id);
                const event = new CustomEvent('expenseSelected', { detail: { id: expense.id } });
                expenseList.dispatchEvent(event);
            };
            // Handle category button clicks to remove categories
            li.querySelectorAll('.expense-category-button').forEach(button => {
                button.onclick = async (e) => {
                    e.stopPropagation(); // Prevent triggering expense selection
                    const level = button.classList.contains('level-1') ? 1 :
                                 button.classList.contains('level-2') ? 2 : 3;
                    console.log('Removing category at level:', level);
                    const result = await window.categoriesManager.removeCategoryFromExpense(expense, level);
                    if (result.success) {
                        const event = new CustomEvent('categoryUpdated');
                        document.getElementById('category-buttons').dispatchEvent(event);
                    }
                };
            });
            expenseList.appendChild(li);
        });

        // Add keyboard navigation
        expenseList.onkeydown = (e) => {
            const currentIndex = expenses.findIndex(exp => exp.id === selectedExpenseId);
            let newIndex = currentIndex;
            if (e.key === 'ArrowUp') {
                newIndex = currentIndex > 0 ? currentIndex - 1 : expenses.length - 1;
            } else if (e.key === 'ArrowDown') {
                newIndex = currentIndex < expenses.length - 1 ? currentIndex + 1 : 0;
            }
            if (newIndex !== currentIndex) {
                const newSelectedId = expenses[newIndex].id;
                console.log('Keyboard navigation: New selected ID:', newSelectedId);
                const event = new CustomEvent('expenseSelected', { detail: { id: newSelectedId } });
                expenseList.dispatchEvent(event);
            }
        };
    },

    updateSingleExpenseDisplay(expense) {
        console.log('updateSingleExpenseDisplay called for expense:', expense);
        const expenseItem = document.querySelector(`.expense-item[data-id="${expense.id}"]`);
        if (expenseItem) {
            expenseItem.className = `expense-item ${expense.id === window.selectedExpenseId ? 'selected' : ''} ${expense.amount < 0 ? 'expense-negative' : 'expense-positive'}`;
            expenseItem.innerHTML = `
                <span class="expense-date">${expense.date}</span>
                <span class="expense-description">${expense.description}</span>
                <span class="expense-amount">${expense.amount.toFixed(2)}</span>
                <div class="category-tags">
                    ${expense.category1 ? `<button class="expense-category-button level-1">${expense.category1}</button>` : ''}
                    ${expense.category2 ? `<button class="expense-category-button level-2">${expense.category2}</button>` : ''}
                    ${expense.category3 ? `<button class="expense-category-button level-3">${expense.category3}</button>` : ''}
                </div>
            `;
            // Reattach click handler
            expenseItem.onclick = () => {
                console.log('Expense selected:', expense.id);
                const event = new CustomEvent('expenseSelected', { detail: { id: expense.id } });
                document.getElementById('expense-list').dispatchEvent(event);
            };
            // Reattach category button handlers
            expenseItem.querySelectorAll('.expense-category-button').forEach(button => {
                button.onclick = async (e) => {
                    e.stopPropagation();
                    const level = button.classList.contains('level-1') ? 1 :
                                 button.classList.contains('level-2') ? 2 : 3;
                    console.log('Removing category at level:', level);
                    const result = await window.categoriesManager.removeCategoryFromExpense(expense, level);
                    if (result.success) {
                        const event = new CustomEvent('categoryUpdated');
                        document.getElementById('category-buttons').dispatchEvent(event);
                    }
                };
            });
        }
    }
};

window.expenseManager = expenseManager;
console.log('expenseManager initialized');