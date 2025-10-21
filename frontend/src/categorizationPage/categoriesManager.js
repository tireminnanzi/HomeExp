const categoriesManager = {
  updateCategoryButtons(selectedExpense, categoriesList, isDeleteMode) {
    const categoryButtons = document.getElementById('category-buttons');
    categoryButtons.innerHTML = '';
    categoryButtons.className = `category-buttons ${isDeleteMode ? 'delete-mode' : ''}`;

    const deleteToggleBtn = document.createElement('button');
    deleteToggleBtn.textContent = 'x';
    deleteToggleBtn.className = 'delete-toggle-button';
    deleteToggleBtn.onclick = () => {
      isDeleteMode = !isDeleteMode;
      this.updateCategoryButtons(selectedExpense, categoriesList, isDeleteMode);
    };
    categoryButtons.appendChild(deleteToggleBtn);

    let categoriesToShow = [];
    let level = 1;
    if (!selectedExpense.category1) {
      categoriesToShow = categoriesList.filter(c => !c.parent);
      level = 1;
    } else if (!selectedExpense.category2) {
      categoriesToShow = categoriesList.filter(c => c.parent === selectedExpense.category1);
      level = 2;
    } else if (!selectedExpense.category3) {
      categoriesToShow = categoriesList.filter(c => c.parent === selectedExpense.category2);
      level = 3;
    } else {
      categoryButtons.innerHTML = '<p class="no-data">Expense fully categorized</p>';
      return;
    }

    categoriesToShow.forEach(c => {
      const button = document.createElement('button');
      button.textContent = c.name;
      button.className = `category-button level-${level}`;
      button.onclick = async () => {
        if (isDeleteMode) {
          const result = await this.deleteWithDescendants(c.name, categoriesList);
          if (result.success) {
            const event = new CustomEvent('categoryUpdated');
            document.getElementById('category-buttons').dispatchEvent(event);
          } else {
            console.error('Error deleting category:', result.message);
            categoryButtons.innerHTML = '<p class="no-data">Error deleting category</p>';
          }
        } else {
          const result = await window.assignCategoryToExpense(selectedExpense, level, c.name);
          if (result.success) {
            const event = new CustomEvent('categoryUpdated');
            document.getElementById('category-buttons').dispatchEvent(event);
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
      if (newCategoryName && !/^\s+$/.test(newCategoryName) && newCategoryName !== '...' && !categoriesList.some(c => c.name === newCategoryName)) {
        const parentCategory = level === 1 ? null : level === 2 ? selectedExpense.category1 : selectedExpense.category2;
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
  },

  async deleteWithDescendants(categoryName, categoriesList) {
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

    return { success: true, data: { deletedNames: namesToDelete } };
  }
};

window.categoriesManager = categoriesManager;