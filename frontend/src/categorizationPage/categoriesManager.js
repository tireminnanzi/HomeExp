// frontend/src/categorizationPage/categoriesManager.js
const categoriesManager = {
    updateCategoryButtons(selectedExpense, categoriesList, isDeleteMode) {
        console.log('updateCategoryButtons started, selectedExpense:', selectedExpense, 'isDeleteMode:', isDeleteMode);
        const categoryButtons = document.getElementById('category-buttons');
        categoryButtons.innerHTML = '';
        categoryButtons.className = `category-buttons ${isDeleteMode ? 'delete-mode' : ''}`;

        const deleteToggleBtn = document.createElement('button');
        deleteToggleBtn.textContent = 'x';
        deleteToggleBtn.className = 'delete-toggle-button';
        deleteToggleBtn.onclick = () => {
            console.log('Delete mode toggled to:', !isDeleteMode);
            isDeleteMode = !isDeleteMode;
            this.updateCategoryButtons(selectedExpense, categoriesList, isDeleteMode);
        };
        categoryButtons.appendChild(deleteToggleBtn);

        let categoriesToShow = [];
        let level = 1;
        let currentCategory = selectedExpense?.category || null;

        // Determine the current level based on parent hierarchy with detailed logging
        console.log('Current category from selectedExpense:', currentCategory);
        if (currentCategory) {
            let parent = categoriesList.find(c => c.name === currentCategory);
            console.log('Initial parent found:', parent);
            while (parent && parent.parent) {
                parent = categoriesList.find(c => c.name === parent.parent);
                level++;
                console.log('Incremented level to:', level, 'due to parent:', parent?.name);
            }
            // Next level is one more than the current level
            level++;
            console.log('Calculated next level:', level);
            if (level > 3) {
                console.log('Expense fully categorized');
                categoryButtons.innerHTML = '<p class="no-data">Expense fully categorized</p>';
                return;
            }
        } else {
            console.log('No current category, defaulting to level 1');
        }

        // Filter categories for the next level with corrected level-3 logic
        if (level === 1) {
            categoriesToShow = categoriesList.filter(c => !c.parent);
            console.log('Filtering level 1: No parent');
        } else if (level === 2) {
            categoriesToShow = categoriesList.filter(c => c.parent === currentCategory);
            console.log('Filtering level 2 with parent:', currentCategory);
        } else if (level === 3) {
            const parentCategory = categoriesList.find(c => c.name === currentCategory);
            console.log('Parent category for level 3:', parentCategory);
            if (parentCategory) {
                categoriesToShow = categoriesList.filter(c => c.parent === currentCategory);
                console.log('Filtering level 3 with parent:', currentCategory, 'found categories:', categoriesToShow);
            } else {
                categoriesToShow = [];
                console.log('Invalid parent category for level 3:', currentCategory);
            }
        }
        console.log('Categories to show at level', level, ':', categoriesToShow);

        if (categoriesToShow.length === 0 && currentCategory) {
            categoryButtons.innerHTML = '<p class="no-data">No categories available at this level</p>';
            return;
        } else if (!selectedExpense) {
            categoryButtons.innerHTML = '<p class="no-data">No expense selected</p>';
            return;
        }

        categoriesToShow.forEach(c => {
            const button = document.createElement('button');
            button.textContent = c.name;
            button.className = `category-button level-${level}`;
            button.onclick = async () => {
                console.log('Category button clicked:', c.name, 'mode:', isDeleteMode ? 'delete' : 'assign', 'for expense:', {
                    id: selectedExpense.id,
                    description: selectedExpense.description,
                    currentCategory: selectedExpense.category
                });
                if (isDeleteMode) {
                    const result = await this.deleteWithDescendants(c.name, categoriesList);
                    if (result.success) {
                        console.log('Category deleted:', c.name);
                        const event = new CustomEvent('categoryUpdated');
                        document.getElementById('category-buttons').dispatchEvent(event);
                    } else {
                        console.error('Error deleting category:', result.message);
                        categoryButtons.innerHTML = '<p class="no-data">Error deleting category</p>';
                    }
                } else {
                    const result = await window.assignCategoryToExpense(selectedExpense, level, c.name);
                    console.log('Assignment result:', result);
                    if (result.success) {
                        console.log('Category assigned:', c.name, 'to expense:', {
                            id: selectedExpense.id,
                            description: selectedExpense.description,
                            newCategory: c.name
                        });
                        const event = new CustomEvent('categoryUpdated');
                        document.getElementById('category-buttons').dispatchEvent(event);
                    } else {
                        console.error('Error assigning category:', result.message);
                        categoryButtons.innerHTML = '<p class="no-data">Error assigning category</p>';
                    }
                }
            };
            categoryButtons.appendChild(button);
        });

        const addCategoryBtn = document.createElement('button');
        addCategoryBtn.textContent = '...';
        addCategoryBtn.className = `category-button level-${level}`;
        addCategoryBtn.id = 'add-category-btn';
        addCategoryBtn.contentEditable = false;
        addCategoryBtn.onclick = () => {
            console.log('Add category button clicked');
            if (!isDeleteMode) {
                addCategoryBtn.contentEditable = true;
                addCategoryBtn.textContent = '';
                addCategoryBtn.classList.add('editing');
                requestAnimationFrame(() => {
                    addCategoryBtn.focus();
                    const range = document.createRange();
                    range.selectNodeContents(addCategoryBtn);
                    range.collapse(true);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                });
            }
        };
        const saveCategory = async () => {
            const newCategoryName = addCategoryBtn.textContent.trim();
            console.log('Saving new category:', newCategoryName);
            if (newCategoryName && !/^\s+$/.test(newCategoryName) && newCategoryName !== '...' && !categoriesList.some(c => c.name === newCategoryName)) {
                const parentCategory = level === 1 ? null : level === 2 ? currentCategory : categoriesList.find(c => c.name === currentCategory)?.parent;
                if (parentCategory && !categoriesList.some(c => c.name === parentCategory)) {
                    console.error('Error adding category: Parent category does not exist');
                    categoryButtons.innerHTML = '<p class="no-data">Error: Parent category does not exist</p>';
                    addCategoryBtn.textContent = '...';
                    addCategoryBtn.contentEditable = false;
                    addCategoryBtn.classList.remove('editing');
                    requestAnimationFrame(() => addCategoryBtn.focus());
                    return;
                }
                const result = await window.addNewCategory(newCategoryName, parentCategory);
                if (result.success) {
                    console.log('New category added:', newCategoryName);
                    addCategoryBtn.textContent = '...';
                    addCategoryBtn.contentEditable = false;
                    addCategoryBtn.classList.remove('editing');
                    const event = new CustomEvent('categoryUpdated');
                    document.getElementById('category-buttons').dispatchEvent(event);
                } else {
                    console.error('Error adding category:', result.message);
                    categoryButtons.innerHTML = '<p class="no-data">Error adding category</p>';
                }
            } else {
                addCategoryBtn.textContent = '...';
                addCategoryBtn.contentEditable = false;
                addCategoryBtn.classList.remove('editing');
                requestAnimationFrame(() => addCategoryBtn.focus());
            }
        };
        addCategoryBtn.onkeydown = async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                await saveCategory();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                addCategoryBtn.textContent = '...';
                addCategoryBtn.contentEditable = false;
                addCategoryBtn.classList.remove('editing');
                requestAnimationFrame(() => addCategoryBtn.focus());
            }
        };
        addCategoryBtn.onblur = saveCategory;
        categoryButtons.appendChild(addCategoryBtn);
        console.log('updateCategoryButtons completed');
    },

    async deleteWithDescendants(categoryName, categoriesList) {
        console.log('deleteWithDescendants started for:', categoryName);
        const getDescendantNames = (parentName, visited = new Set()) => {
            if (visited.has(parentName)) return [];
            visited.add(parentName);
            const descendants = [];
            const children = categoriesList.filter(c => c.parent === parentName);
            for (const child of children) {
                descendants.push(child.name);
                descendants.push(...getDescendantNames(child.name, visited));
            }
            return descendants;
        };
        const namesToDelete = [categoryName, ...getDescendantNames(categoryName)];
        const deletedIds = [];

        for (const name of namesToDelete) {
            const category = categoriesList.find(c => c.name === name);
            if (category) {
                const result = await window.deleteSingleCategory(name);
                if (result.success) {
                    deletedIds.push(category.id);
                } else {
                    return { success: false, message: result.message };
                }
            }
        }
        console.log('deleteWithDescendants completed, deleted:', namesToDelete);
        return { success: true, data: { deletedNames: namesToDelete } };
    },

    async removeCategoryFromExpense(expense, level) {
        console.log('removeCategoryFromExpense called for expense:', expense.id, 'level:', level);
        const updatedExpense = { ...expense };
        updatedExpense.category = null; // Reset to uncategorized

        const result = await window.assignCategoryToExpense(updatedExpense, level, null);
        if (result.success) {
            console.log('Category removed from expense:', expense.id, 'level:', level);
            return { success: true, data: result.data };
        } else {
            console.error('Error removing category:', result.message);
            return { success: false, message: result.message };
        }
    }
};

window.categoriesManager = categoriesManager;
console.log('categoriesManager initialized');