// frontend/src/categorizationPage/expenseManager.js
console.log('expenseManager.js loaded');

const expenseManager = {
    // Render the list of expenses with their categories and highlight the selected one
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
            expenseItem.innerHTML = `
                <span class="expense-date">${expense.date}</span>
                <span class="expense-description">${expense.description}</span>
                <span class="expense-amount ${expense.amount < 0 ? 'expense-negative' : 'expense-positive'}">${expense.amount}</span>
            `;
            if (expense.amount < 0) expenseItem.classList.add('expense-negative');
            else if (expense.amount > 0) expenseItem.classList.add('expense-positive');

            // Add categories section using category1, category2, category3 with level classes
            const categoryTags = document.createElement('div');
            categoryTags.className = 'category-tags';
            const categories = [
                { name: expense.category1, level: 1 },
                { name: expense.category2, level: 2 },
                { name: expense.category3, level: 3 }
            ].filter(c => c.name !== null && c.name !== undefined); // Filter out null/undefined
            if (categories.length > 0) {
                categories.forEach(cat => {
                    const tag = document.createElement('button');
                    tag.textContent = cat.name;
                    const className = `expense-category-button level-${cat.level}`;
                    tag.className = className;
                    console.log(`Assigning class to ${cat.name}: ${className}`); // Debug log
                    // Add click handler for category deletion
                    tag.onclick = async (e) => {
                        e.stopPropagation(); // Prevent expense selection
                        console.log(`Clicked category ${cat.name} (level ${cat.level}) for expense ${expense.id}`);
                        // Update the local expenses array
                        try {
                            const result = await window.assignCategoryToExpense(expense, cat.level, null);
                            if (result.success) {
                                console.log('Category removed successfully:', result.data);
                                // Update local expenses array
                                const index = expenses.findIndex(e => e.id === expense.id);
                                if (index !== -1) {
                                    expenses[index] = result.data;
                                    console.log('Updated local expenses with:', result.data);
                                } else {
                                    console.error('Expense not found in local expenses:', expense.id);
                                }
                                // Try to update window.expensesList if it exists
                                if (window.expensesList) {
                                    const globalIndex = window.expensesList.findIndex(e => e.id === expense.id);
                                    if (globalIndex !== -1) {
                                        window.expensesList[globalIndex] = result.data;
                                        console.log('Updated window.expensesList with:', result.data);
                                    } else {
                                        console.error('Expense not found in window.expensesList:', expense.id);
                                    }
                                } else {
                                    console.warn('window.expensesList is undefined, using local expenses array');
                                }
                                // Dispatch expenseSelected event to trigger UI update
                                console.log(`Dispatching expenseSelected event for expense ${expense.id} after removing category`);
                                expenseList.dispatchEvent(new CustomEvent('expenseSelected', { detail: { id: expense.id } }));
                            } else {
                                console.error('Failed to remove category:', result.message);
                                alert('Failed to remove category: ' + result.message);
                            }
                        } catch (error) {
                            console.error('Error during category deletion:', error);
                            alert('Error removing category: ' + error.message);
                        }
                    };
                    categoryTags.appendChild(tag);
                });
            } // Left empty if no categories
            expenseItem.appendChild(categoryTags);

            // Highlight the selected expense
            if (expense.id === selectedExpenseId) {
                expenseItem.classList.add('selected');
            }

            // Trigger selection event when an expense is clicked
            expenseItem.onclick = () => {
                const event = new CustomEvent('expenseSelected', { detail: { id: expense.id } });
                expenseList.dispatchEvent(event);
            };

            expenseList.appendChild(expenseItem);
        });
        console.log('updateExpenseDisplay completed');
    }
};

window.expenseManager = expenseManager;
console.log('expenseManager initialized');