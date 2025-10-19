const API_BASE_URL = 'http://localhost:3000'; // Adjust if port differs

// Push a new expense to the backend
async function pushNewExpense(expense) {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    const result = await response.json();
    if (response.ok) {
      console.log('Server response: Expense pushed successfully', {
        id: result.id,
        date: result.date,
        description: result.description,
        amount: result.amount,
        fullResponse: result
      });
      return { success: true, data: result };
    } else {
      console.log('Server response: Failed to push expense', { error: result.error || 'Unknown error' });
      return { success: false, message: result.error || 'Unknown error' };
    }
  } catch (error) {
    console.log('Server response: Error pushing expense', { error: error.message });
    return { success: false, message: error.message };
  }
}

// Fetch all expenses
async function fetchAllExpenses() {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`);
    const expenses = await response.json();
    if (response.ok) {
      console.log('Server response: Expenses fetched successfully', expenses.map(e => ({
        id: e.id,
        date: e.date,
        description: e.description,
        amount: e.amount
      })));
      return { success: true, data: expenses };
    } else {
      console.log('Server response: Failed to fetch expenses', { error: expenses.error || 'Unknown error' });
      return { success: false, message: expenses.error || 'Unknown error' };
    }
  } catch (error) {
    console.log('Server response: Error fetching expenses', { error: error.message });
    return { success: false, message: error.message };
  }
}

// Fetch all categories
async function fetchAllCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const categories = await response.json();
    if (response.ok) {
      console.log('Server response: Categories fetched successfully', categories.map(c => ({
        id: c.id,
        name: c.name,
        parent: c.parent
      })));
      return { success: true, data: categories };
    } else {
      console.log('Server response: Failed to fetch categories', { error: categories.error || 'Unknown error' });
      return { success: false, message: categories.error || 'Unknown error' };
    }
  } catch (error) {
    console.log('Server response: Error fetching categories', { error: error.message });
    return { success: false, message: error.message };
  }
}

// Add a new category to the categories list
async function addNewCategory(categoryName, parentCategory = null) {
  try {
    const newCategory = { name: categoryName, parent: parentCategory };
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory)
    });
    const result = await response.json();
    if (response.ok) {
      console.log('Server response: Category added successfully', {
        id: result.id,
        name: result.name,
        parent: result.parent,
        fullResponse: result
      });
      return { success: true, data: result };
    } else {
      console.log('Server response: Failed to add category', { error: result.error || 'Unknown error' });
      return { success: false, message: result.error || 'Unknown error' };
    }
  } catch (error) {
    console.log('Server response: Error adding category', { error: error.message });
    return { success: false, message: error.message };
  }
}

// Assign a category to an expense
async function assignCategoryToExpense(expense, level, categoryName) {
  try {
    // Validate expense object
    if (!expense || !expense.id) {
      console.log('Server response: Invalid expense or missing ID', { expense });
      return { success: false, message: 'Invalid expense or missing ID' };
    }
    // Update the appropriate category level in the expense object
    const updatedExpense = { ...expense };
    if (level === 1) updatedExpense.category1 = categoryName;
    else if (level === 2) updatedExpense.category2 = categoryName;
    else if (level === 3) updatedExpense.category3 = categoryName;

    const updateRes = await fetch(`${API_BASE_URL}/expenses/${expense.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedExpense)
    });
    const updated = await updateRes.json();
    if (updateRes.ok) {
      console.log('Server response: Category assigned to expense', {
        id: updated.id,
        date: updated.date,
        description: updated.description,
        amount: updated.amount,
        category1: updated.category1,
        fullResponse: updated
      });
      return { success: true, data: updated };
    } else {
      console.log('Server response: Failed to assign category', { error: updated.error || 'Unknown error' });
      return { success: false, message: updated.error || 'Unknown error' };
    }
  } catch (error) {
    console.log('Server response: Error assigning category', { error: error.message });
    return { success: false, message: error.message };
  }
}

// Delete all expenses
async function deleteAllExpenses() {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    if (response.ok) {
      console.log('Server response: All expenses deleted successfully', result);
      return { success: true, data: result };
    } else {
      console.log('Server response: Failed to delete all expenses', { error: result.error || 'Unknown error' });
      return { success: false, message: result.error || 'Unknown error' };
    }
  } catch (error) {
    console.log('Server response: Error deleting all expenses', { error: error.message });
    return { success: false, message: error.message };
  }
}

// Expose functions globally
window.pushNewExpense = pushNewExpense;
window.fetchAllExpenses = fetchAllExpenses;
window.fetchAllCategories = fetchAllCategories;
window.addNewCategory = addNewCategory;
window.assignCategoryToExpense = assignCategoryToExpense;
window.deleteAllExpenses = deleteAllExpenses;