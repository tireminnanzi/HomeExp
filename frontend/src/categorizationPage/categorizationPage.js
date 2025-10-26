// frontend/src/categorizationPage/categorizationPage.js
console.log('categorizationPage.js loaded');

let selectedExpenseId = null;
let expensesList = [];
let categoriesList = [];
let isDeleteMode = false;

// Map category fields to a single category field with debug
function mapCategory(expense) {
    const category = expense.category1 || expense.category2 || expense.category3 || null;
    console.log('Mapping category for expense', expense.id, ':', { category1: expense.category1, category2: expense.category2, category3: expense.category3 }, '->', category);
    return category;
}

export async function initializeCategorization() {
    console.log('initializeCategorization started');
    await loadPage();
}

async function loadPage() {
    console.log('loadPage started');
    const expenseList = document.getElementById('expense-list');
    const categoryButtons = document.getElementById('category-buttons');
    if (!expenseList || !categoryButtons) {
        console.error('Required elements not found:', { expenseList, categoryButtons });
        return;
    }
    expenseList.innerHTML = '';

    try {
        console.log('Fetching expenses and categories...');
        const [fetchExpensesResult, fetchCategoriesResult] = await Promise.all([
            window.fetchAllExpenses(),
            window.fetchAllCategories()
        ]);
        expensesList = fetchExpensesResult.success ? fetchExpensesResult.data.map(exp => ({
            ...exp,
            category: mapCategory(exp)
        })) : [];
        categoriesList = fetchCategoriesResult.success ? fetchCategoriesResult.data : [];
        console.log('Expenses list at startup:', expensesList.map(exp => ({
            id: exp.id,
            description: exp.description,
            category: exp.category
        })));
        console.log('Categories list:', categoriesList);
    } catch (error) {
        console.error('Fetch error in loadPage:', error);
        expensesList = [];
        categoriesList = [];
    }

    if (expensesList.length > 0) {
        console.log('Initializing expense selection...');
        initializeExpenseSelection();
        console.log('Updating expense display...');
        updateExpenseDisplay();
        console.log('Updating category display...');
        updateCategoryDisplay();
    } else {
        console.log('No expenses found, setting no-data message');
        expenseList.innerHTML = '<p class="no-data">No expenses found</p>';
        categoryButtons.innerHTML = '<p class="no-data">No expenses to categorize</p>';
    }
    console.log('loadPage completed');
}

function initializeExpenseSelection() {
    console.log('initializeExpenseSelection started');
    if (!selectedExpenseId || !expensesList.some(exp => exp.id === selectedExpenseId)) {
        const firstUncategorized = expensesList.find(exp => !exp.category) || expensesList[0];
        selectedExpenseId = firstUncategorized ? firstUncategorized.id : null;
        window.selectedExpenseId = selectedExpenseId; // Expose globally
    }
    console.log('Selected expense ID:', selectedExpenseId);
    console.log('initializeExpenseSelection completed');
}

function updateExpenseDisplay() {
    console.log('updateExpenseDisplay called');
    if (window.expenseManager) {
        window.expenseManager.updateExpenseDisplay(expensesList, selectedExpenseId);
    } else {
        console.error('expenseManager not found');
    }
    console.log('updateExpenseDisplay completed');
}

function updateCategoryDisplay() {
    console.log('updateCategoryDisplay called');
    const selectedExpense = expensesList.find(exp => exp.id === selectedExpenseId);
    const loggedExpense = {
        id: selectedExpense?.id,
        description: selectedExpense?.description,
        category: selectedExpense?.category
    };
    console.log('Selected expense for category display:', loggedExpense);
    if (selectedExpense && window.categoriesManager) {
        window.categoriesManager.updateCategoryButtons(selectedExpense, categoriesList, isDeleteMode);
    } else {
        console.log('No selected expense or categoriesManager not found:', { selectedExpense, categoriesManager: window.categoriesManager });
        document.getElementById('category-buttons').innerHTML = '<p class="no-data">No expense selected or categoriesManager not loaded</p>';
    }
    console.log('updateCategoryDisplay completed');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded in categorizationPage.js');
        initializeCategorization();
    });
} else {
    console.log('Document already loaded, calling initializeCategorization');
    initializeCategorization();
}

document.getElementById('expense-list')?.addEventListener('expenseSelected', (e) => {
    console.log('expenseSelected event received, new ID:', e.detail.id);
    selectedExpenseId = e.detail.id;
    window.selectedExpenseId = selectedExpenseId; // Update global
    updateExpenseDisplay();
    updateCategoryDisplay();
});

document.getElementById('category-buttons')?.addEventListener('categoryUpdated', async (e) => {
    console.log('categoryUpdated event received');
    try {
        const fetchExpensesResult = await window.fetchAllExpenses();
        expensesList = fetchExpensesResult.success ? fetchExpensesResult.data.map(exp => ({
            ...exp,
            category: mapCategory(exp)
        })) : [];
        const selectedExpense = expensesList.find(exp => exp.id === selectedExpenseId);
        console.log('Expense after update:', {
            id: selectedExpense?.id,
            description: selectedExpense?.description,
            category: selectedExpense?.category
        });
        if (selectedExpense) {
            console.log('Updating single expense display for:', selectedExpense);
            window.expenseManager.updateSingleExpenseDisplay(selectedExpense);
            updateCategoryDisplay();
        } else {
            console.log('No selected expense to update, refreshing all');
            updateExpenseDisplay();
            updateCategoryDisplay();
        }
    } catch (error) {
        console.error('Error updating expenses after category change:', error);
    }
});