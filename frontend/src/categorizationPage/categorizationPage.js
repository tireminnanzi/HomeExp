let selectedExpenseId = null;
let expensesList = [];
let categoriesList = [];
let isDeleteMode = false;

async function loadPage() {
  const expenseList = document.getElementById('expense-list');
  expenseList.innerHTML = '';

  const [fetchExpensesResult, fetchCategoriesResult] = await Promise.all([
    window.fetchAllExpenses(),
    window.fetchAllCategories()
  ]);

  expensesList = fetchExpensesResult.success ? fetchExpensesResult.data : [];
  categoriesList = fetchCategoriesResult.success ? fetchCategoriesResult.data : [];

  if (expensesList.length > 0) {
    // Initialize expense selection
    initializeExpenseSelection();
    updateExpenseDisplay();
    updateCategoryDisplay();
  } else {
    expenseList.innerHTML = '<p class="no-data">No expenses found</p>';
    document.getElementById('category-buttons').innerHTML = '<p class="no-data">No expenses to categorize</p>';
  }
}

function initializeExpenseSelection() {
  if (!selectedExpenseId || !expensesList.some(exp => exp.id === selectedExpenseId)) {
    const firstUncategorized = expensesList.find(exp => !exp.category3) || expensesList[0];
    selectedExpenseId = firstUncategorized ? firstUncategorized.id : null;
  }
}

function updateExpenseDisplay() {
  window.expenseManager.updateExpenseDisplay(expensesList, selectedExpenseId);
}

function updateCategoryDisplay() {
  const selectedExpense = expensesList.find(exp => exp.id === selectedExpenseId);
  if (selectedExpense) {
    window.categoriesManager.updateCategoryButtons(selectedExpense, categoriesList, isDeleteMode);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadPage();
  document.getElementById('expense-list').addEventListener('expenseSelected', (e) => {
    selectedExpenseId = e.detail.id;
    updateCategoryDisplay();
  });
  document.getElementById('category-buttons').addEventListener('categoryUpdated', () => {
    loadPage(); // Reload to reflect changes
  });
});