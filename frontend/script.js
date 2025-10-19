// Store state for the sequence
let firstExpense = null; // Store full expense object
let selectedCategory = 'Food'; // Default, set in step 6

// Step 1: Push new expense
async function step1PushExpense() {
  console.log('Step 1: Pushing new expense');
  const testExpense = {
    date: '2025-10-19',
    description: 'Test Grocery Purchase',
    amount: 25.75,
    source: 'CSV',
    category1: null,
    category2: null,
    category3: null
  };
  const result = await pushNewExpense(testExpense);
  if (result.success) {
    firstExpense = result.data; // Store full expense object
    console.log('Step 1: Stored first expense', {
      id: firstExpense.id,
      date: firstExpense.date,
      description: firstExpense.description,
      amount: firstExpense.amount,
      fullExpense: firstExpense
    });
    console.log('Step 1: Expense ID:', firstExpense.id || 'undefined');
  } else {
    console.log('Step 1: Failed to store first expense:', result.message);
  }
}

// Step 3: Push same expense again (expect duplicate error)
async function step3PushDuplicateExpense() {
  console.log('Step 3: Pushing same expense again');
  const testExpense = {
    date: '2025-10-19',
    description: 'Test Grocery Purchase',
    amount: 25.75,
    source: 'CSV',
    category1: null,
    category2: null,
    category3: null
  };
  await pushNewExpense(testExpense);
}

// Step 6: Add new category
async function step6AddCategory() {
  console.log('Step 6: Adding new category');
  await addNewCategory('Food', null);
}

// Step 7: Fetch all categories
async function step7FetchCategories() {
  console.log('Step 7: Fetching all categories');
  const fetchResult = await fetchAllCategories();
  console.log('Step 7: Fetch result:', {
    success: fetchResult.success,
    data: fetchResult.data.map(c => ({
      id: c.id,
      name: c.name,
      parent: c.parent
    }))
  });
}

// Step 8: Add same category again (expect duplicate error)
async function step8AddDuplicateCategory() {
  console.log('Step 8: Adding same category again');
  await addNewCategory('Food', null);
}

// Step 10: Fetch expenses, select first, assign category
async function step10AssignCategory() {
  console.log('Step 10: Fetching expenses and assigning category');
  const fetchResult = await fetchAllExpenses();
  console.log('Step 10: Fetch result:', {
    success: fetchResult.success,
    data: fetchResult.data.map(e => ({
      id: e.id,
      date: e.date,
      description: e.description,
      amount: e.amount
    }))
  });
  if (fetchResult.success && fetchResult.data.length > 0) {
    firstExpense = fetchResult.data[0]; // Select first expense
    console.log('Step 10: Selected first expense', {
      id: firstExpense.id,
      date: firstExpense.date,
      description: firstExpense.description,
      amount: firstExpense.amount,
      fullExpense: firstExpense
    });
    console.log('Step 10: Selected expense ID:', firstExpense.id || 'undefined');
    if (firstExpense.id) {
      await assignCategoryToExpense(firstExpense, 1, selectedCategory);
    } else {
      console.log('Step 10: Error: No valid expense ID found in fetched expense');
    }
  } else {
    console.log('Step 10: No expenses available to assign category');
  }
}

// Step 12: Delete all expenses
async function step12DeleteAllExpenses() {
  console.log('Step 12: Deleting all expenses');
  await deleteAllExpenses();
  firstExpense = null; // Reset state
}

// Expose functions for button clicks
window.step1PushExpense = step1PushExpense;
window.step3PushDuplicateExpense = step3PushDuplicateExpense;
window.step6AddCategory = step6AddCategory;
window.step7FetchCategories = step7FetchCategories;
window.step8AddDuplicateCategory = step8AddDuplicateCategory;
window.step10AssignCategory = step10AssignCategory;
window.step12DeleteAllExpenses = step12DeleteAllExpenses;