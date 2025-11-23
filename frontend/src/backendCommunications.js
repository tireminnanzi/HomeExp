// frontend/src/backendCommunications.js

// === CREA UNA SINGOLA EXPENSE (MANUALE) ===
async function createExpense(expenseData) {
  try {
    const response = await fetch('http://localhost:3000/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 400 && errorText.includes('Duplicate')) {
        return { success: false, message: 'Transazione già presente (duplicato)' };
      }
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Server response: Expense created successfully', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { success: false, message: error.message };
  }
}

// === UPLOAD BULK (MASSIVO) DI EXPENSES ===
async function uploadBulkExpenses(expensesArray) {
  try {
    const response = await fetch('http://localhost:3000/expenses/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expensesArray)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Errore server: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Server response: Bulk upload successful', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error during bulk upload:', error);
    return { success: false, message: error.message };
  }
}


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

// Fetch all rules from db.json
async function fetchAllRules() {
  try {
    const response = await fetch('http://localhost:3000/rules');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Server response: Rules fetched successfully', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching rules:', error);
    return { success: false, data: [], message: error.message };
  }
}

// Add a new rule to db.json
async function addNewRule(rule) {
  try {
    // Check for duplicate rules (based on words and categories)
    const rulesResponse = await fetch('http://localhost:3000/rules');
    const allRules = await rulesResponse.json();
    const isDuplicate = allRules.some(existingRule => 
      existingRule.words === rule.words && 
      JSON.stringify(existingRule.categories.sort()) === JSON.stringify(rule.categories.sort())
    );
    if (isDuplicate) {
      console.log('Duplicate rule detected:', rule);
      return { success: false, message: 'Duplicate rule detected' };
    }

    // Assign sequential ID
    const lastId = allRules.length > 0 ? Math.max(...allRules.map(r => parseInt(r.id || 0))) : 0;
    const newId = (lastId + 1).toString();
    const newRule = { ...rule, id: newId };

    const response = await fetch('http://localhost:3000/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRule)
    });
    const data = await response.json();
    console.log('Server response: Rule added successfully', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error adding rule:', error);
    return { success: false, message: error.message };
  }
}

// Delete a rule from db.json by ID
async function deleteRule(ruleId) {
  try {
    const response = await fetch(`http://localhost:3000/rules/${ruleId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      console.log('Server response: Rule deleted successfully', { id: ruleId });
      return { success: true };
    } else {
      throw new Error('Failed to delete rule');
    }
  } catch (error) {
    console.error('Error deleting rule:', error);
    return { success: false, message: error.message };
  }
}

// Expose functions to window object
window.createExpense = createExpense;
window.uploadBulkExpenses = uploadBulkExpenses;
window.fetchAllExpenses = fetchAllExpenses;
window.fetchAllCategories = fetchAllCategories;
window.assignCategoryToExpense = assignCategoryToExpense;
window.addNewCategory = addNewCategory;
window.deleteSingleCategory = deleteSingleCategory;
window.deleteAllExpenses = deleteAllExpenses;
window.fetchAllRules = fetchAllRules;
window.addNewRule = addNewRule;
window.deleteRule = deleteRule;