async function fetchAllExpenses() {
  try {
    const response = await fetch('http://localhost:3000/expenses');
    const data = await response.json();
    console.log('Server response: Expenses fetched successfully', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return { success: false, message: error.message };
  }
}

async function fetchAllCategories() {
  try {
    const response = await fetch('http://localhost:3000/categories');
    const data = await response.json();
    console.log('Server response: Categories fetched successfully', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, message: error.message };
  }
}

async function assignCategoryToExpense(expense, level, categoryName) {
  try {
    const updatedExpense = { ...expense };
    if (level === 1) {
      updatedExpense.category1 = categoryName;
      updatedExpense.category2 = null;
      updatedExpense.category3 = null;
    } else if (level === 2) {
      updatedExpense.category2 = categoryName;
      updatedExpense.category3 = null;
    } else if (level === 3) {
      updatedExpense.category3 = categoryName;
    }
    const response = await fetch(`http://localhost:3000/expenses/${expense.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedExpense)
    });
    const data = await response.json();
    console.log('Server response: Category assigned to expense', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error assigning category:', error);
    return { success: false, message: error.message };
  }
}

async function addNewCategory(categoryName, parentCategory) {
  try {
    const newCategory = { id: Date.now().toString(), name: categoryName, parent: parentCategory };
    const response = await fetch('http://localhost:3000/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory)
    });
    const data = await response.json();
    console.log('Server response: Category added successfully', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error adding category:', error);
    return { success: false, message: error.message };
  }
}

async function deleteSingleCategory(categoryName) {
  try {
    // Fetch all categories to find the ID
    const categoriesResponse = await fetch('http://localhost:3000/categories');
    const allCategories = await categoriesResponse.json();
    const category = allCategories.find(c => c.name === categoryName);
    if (!category) throw new Error('Category not found');

    const categoryId = category.id;

    // Update expenses referencing this category
    const expensesResponse = await fetch('http://localhost:3000/expenses');
    const expenses = await expensesResponse.json();
    for (const expense of expenses) {
      let needsUpdate = false;
      const updatedExpense = { ...expense };
      if (expense.category1 === categoryName) {
        updatedExpense.category1 = null;
        updatedExpense.category2 = null;
        updatedExpense.category3 = null;
        needsUpdate = true;
      } else if (expense.category2 === categoryName) {
        updatedExpense.category2 = null;
        updatedExpense.category3 = null;
        needsUpdate = true;
      } else if (expense.category3 === categoryName) {
        updatedExpense.category3 = null;
        needsUpdate = true;
      }
      if (needsUpdate) {
        await fetch(`http://localhost:3000/expenses/${expense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedExpense)
        });
      }
    }

    // Delete the category
    const response = await fetch(`http://localhost:3000/categories/${categoryId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      console.log('Server response: Category deleted successfully', { id: categoryId });
      return { success: true, data: { id: categoryId } };
    } else {
      throw new Error('Failed to delete category');
    }
  } catch (error) {
    console.error('Error deleting single category:', error);
    return { success: false, message: error.message };
  }
}

async function deleteAllExpenses() {
  try {
    const response = await fetch('http://localhost:3000/expenses', {
      method: 'DELETE'
    });
    if (response.ok) {
      console.log('Server response: All expenses deleted successfully');
      return { success: true };
    } else {
      throw new Error('Failed to delete expenses');
    }
  } catch (error) {
    console.error('Error deleting expenses:', error);
    return { success: false, message: error.message };
  }
}

// Expose functions to window object
window.fetchAllExpenses = fetchAllExpenses;
window.fetchAllCategories = fetchAllCategories;
window.assignCategoryToExpense = assignCategoryToExpense;
window.addNewCategory = addNewCategory;
window.deleteSingleCategory = deleteSingleCategory;
window.deleteAllExpenses = deleteAllExpenses;