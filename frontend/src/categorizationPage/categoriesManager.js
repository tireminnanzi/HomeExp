// frontend/src/categorizationPage/categoriesManager.js
console.log('categoriesManager.js loaded');

const categoriesManager = {
    // Track delete mode state
    isDeleteMode: false,

    // Update category buttons based on the selected expense ID
    updateCategoryButtons(selectedExpenseId, expensesList, categoriesList) {
        console.log('updateCategoryButtons called for expense ID:', selectedExpenseId);
        const categoryButtons = document.getElementById('category-buttons');
        if (!categoryButtons) {
            console.error('category-buttons element not found');
            return;
        }
        categoryButtons.innerHTML = ''; // Clear existing buttons

        if (!selectedExpenseId || !expensesList || !categoriesList) {
            console.log('No selected expense, expenses list, or categories list');
            return;
        }

        const expense = expensesList.find(e => e.id === selectedExpenseId);
        if (!expense) {
            console.log('Expense not found for ID:', selectedExpenseId);
            return;
        }

        let levelToDisplay;
        let parentCategoryName = null;

        // Rule 1: No categories, show Level 1 categories
        if (!expense.category1) {
            levelToDisplay = 1;
            console.log('No categories assigned, displaying Level 1 categories');
        }
        // Rule 2: Has categories
        else {
            // If only Level 1, show Level 2 categories (parent is Level 1)
            if (expense.category1 && !expense.category2) {
                levelToDisplay = 2;
                parentCategoryName = expense.category1;
                console.log(`Level 1 category (${expense.category1}) assigned, displaying Level 2 categories`);
            }
            // If Level 1 and Level 2 (or all three), show Level 3 categories (parent is Level 2)
            else if (expense.category2) {
                levelToDisplay = 3;
                parentCategoryName = expense.category2;
                console.log(`Level 2 category (${expense.category2}) assigned, displaying Level 3 categories`);
            }
        }

        // Add container for delete toggle button to position it top-right
        const deleteToggleContainer = document.createElement('div');
        deleteToggleContainer.className = 'delete-toggle-container';
        const deleteToggleButton = document.createElement('button');
        deleteToggleButton.textContent = 'X';
        deleteToggleButton.className = `category-button delete-toggle level-${levelToDisplay} ${this.isDeleteMode ? 'delete-mode-active' : ''}`;
        deleteToggleButton.title = this.isDeleteMode ? 'Exit Delete Mode' : 'Enter Delete Mode';
        deleteToggleButton.onclick = () => {
            this.isDeleteMode = !this.isDeleteMode;
            console.log(`Delete mode ${this.isDeleteMode ? 'enabled' : 'disabled'}`);
            // Update class on category-buttons to reflect delete mode
            categoryButtons.classList.toggle('delete-mode', this.isDeleteMode);
            this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList); // Refresh buttons
        };
        deleteToggleContainer.appendChild(deleteToggleButton);
        categoryButtons.appendChild(deleteToggleContainer);

        // Filter categories based on the determined level and parent
        const categoriesToShow = categoriesList.filter(cat => {
            if (levelToDisplay === 1) return !cat.parent; // Level 1: no parent
            return cat.parent === parentCategoryName; // Level 2 or 3: match parent name
        });

        // Log for debugging
        console.log(`expense selected: ${selectedExpenseId}, categories: ${JSON.stringify(categoriesToShow.map(cat => cat.name))}`);
        console.log(`searching for children of: ${parentCategoryName || 'none (Level 1)'}`);
        console.log(`children found: ${JSON.stringify(categoriesToShow.map(cat => cat.name))}`);

        // Render buttons for the selected level
        categoriesToShow.forEach(cat => {
            const button = document.createElement('button');
            button.textContent = cat.name;
            button.className = `category-button level-${levelToDisplay}`;
            button.onclick = async () => {
                if (this.isDeleteMode) {
                    // Delete mode: delete the category
                    console.log(`Deleting category ${cat.name}`);
                    const result = await window.deleteSingleCategory(cat.name);
                    if (result.success) {
                        console.log('Category deleted successfully:', cat.name);
                        // Remove category from categoriesList
                        const index = categoriesList.findIndex(c => c.name === cat.name);
                        if (index !== -1) {
                            categoriesList.splice(index, 1);
                            console.log('Removed category from categoriesList:', cat.name);
                        }
                        // Update expensesList to reflect category removal
                        expensesList.forEach(expense => {
                            if (expense.category1 === cat.name) {
                                expense.category1 = null;
                                expense.category2 = null;
                                expense.category3 = null;
                            } else if (expense.category2 === cat.name) {
                                expense.category2 = null;
                                expense.category3 = null;
                            } else if (expense.category3 === cat.name) {
                                expense.category3 = null;
                            }
                        });
                        // Refresh UI
                        window.expenseManager.updateExpenseDisplay(expensesList, selectedExpenseId);
                        this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
                    } else {
                        console.error('Failed to delete category:', result.message);
                        alert('Failed to delete category: ' + result.message);
                    }
                } else {
                    // Normal mode: assign category
                    console.log(`Assigning category ${cat.name} at level ${levelToDisplay} to expense ${selectedExpenseId}`);
                    const result = await window.assignCategoryToExpense(expense, levelToDisplay, cat.name);
                    if (result.success) {
                        console.log('Category assigned successfully:', result.data);
                        const index = expensesList.findIndex(e => e.id === selectedExpenseId);
                        if (index !== -1) {
                            expensesList[index] = result.data;
                        }
                        window.expenseManager.updateExpenseDisplay(expensesList, selectedExpenseId);
                        // Auto-select next expense after Level 3 assignment
                        if (levelToDisplay === 3) {
                            console.log('Level 3 assigned, selecting next expense');
                            const currentIndex = expensesList.findIndex(e => e.id === selectedExpenseId);
                            const nextIndex = currentIndex + 1 < expensesList.length ? currentIndex + 1 : 0;
                            const nextExpenseId = expensesList[nextIndex].id;
                            console.log(`Dispatching expenseSelected event for next expense ID: ${nextExpenseId}, index: ${nextIndex}`);
                            const expenseList = document.getElementById('expense-list');
                            if (expenseList) {
                                expenseList.dispatchEvent(new CustomEvent('expenseSelected', { detail: { id: nextExpenseId } }));
                                // Scroll to top if selecting first expense
                                if (nextIndex === 0) {
                                    expenseList.scrollTop = 0;
                                    console.log('Scrolled to top of expense list');
                                }
                            } else {
                                console.error('expense-list not found for dispatching event');
                            }
                        } else {
                            this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
                        }
                    } else {
                        console.error('Failed to assign category:', result.message);
                        alert('Failed to assign category: ' + result.message);
                    }
                }
            };
            categoryButtons.appendChild(button);
        });

        // Add three dots button for adding a new category
        const addButton = document.createElement('button');
        addButton.className = `category-button add-category level-${levelToDisplay} ${this.isDeleteMode ? 'disabled' : ''}`;
        addButton.innerHTML = '⋮'; // Three dots symbol
        addButton.title = `Add new category to Level ${levelToDisplay}`;
        addButton.onclick = () => {
            // Disable add category in delete mode
            if (this.isDeleteMode) {
                console.log('Cannot add category in delete mode');
                return;
            }
            // Replace button with input field
            const input = document.createElement('input');
            input.type = 'text';
            input.className = `category-button add-category level-${levelToDisplay} editing`;
            input.style.minWidth = '100px';
            input.style.caretColor = '#fff'; // White cursor
            categoryButtons.replaceChild(input, addButton);
            input.focus();

            // Handle input submission (Enter key or blur)
            const submitCategory = async () => {
                const categoryName = input.value.trim();
                if (categoryName) {
                    // Validate: must have at least 2 alphabetic letters
                    const alphabeticCount = (categoryName.match(/[a-zA-Z]/g) || []).length;
                    if (alphabeticCount < 2) {
                        console.log(`Invalid category name: ${categoryName}, only ${alphabeticCount} alphabetic letters`);
                        // Silently restore three dots button
                        categoryButtons.replaceChild(addButton, input);
                        return;
                    }
                    const parentCategory = levelToDisplay === 1 ? null :
                        levelToDisplay === 2 ? expense.category1 :
                        expense.category2;
                    const result = await window.addNewCategory(categoryName, parentCategory);
                    if (result.success) {
                        console.log('New category added:', result.data);
                        categoriesList.push(result.data);
                        this.updateCategoryButtons(selectedExpenseId, expensesList, categoriesList);
                    } else {
                        console.error('Failed to add category:', result.message);
                        alert('Failed to add category: ' + result.message);
                        // Restore three dots button
                        categoryButtons.replaceChild(addButton, input);
                    }
                } else {
                    // Empty input, restore three dots button
                    categoryButtons.replaceChild(addButton, input);
                }
            };

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitCategory();
                }
            });

            input.addEventListener('blur', submitCategory);
        };
        categoryButtons.appendChild(addButton);

        console.log('updateCategoryButtons completed');
    }
};

window.categoriesManager = categoriesManager;
console.log('categoriesManager initialized');