// frontend/src/categorizationPage/categorizationPage.js
console.log('categorizationPage.js loaded');

// Initialize the categorization page and start the loading process
export async function initializeCategorization() {
    console.log('initializeCategorization started');
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error('main-content element not found');
        return;
    }

    // Set up the page-specific content
    mainContent.innerHTML = `
        <div class="grid-container">
            <div class="expense-column">
                <h2 class="column-title">Expenses</h2>
                <ul id="expense-list" class="expense-list"></ul>
            </div>
            <div class="category-column">
                <div class="category-top">
                    <h2 class="column-title">Categories</h2>
                    <div id="category-buttons" class="category-buttons"></div>
                </div>
                <div class="category-bottom">
                    <button id="add-rule-button" class="add-rule-button">Add a Rule</button>
                    <form id="rule-form" class="rule-form" style="display: none;">
                        <input type="text" id="rule-input" class="rule-input" placeholder="Enter words to match" disabled>
                    </form>
                    <div id="rules-list" class="rules-list"></div>
                </div>
            </div>
        </div>
    `;
    console.log('Categorization page HTML set up');

    // Set up event listeners for the "Add a Rule" button and form
    const addRuleButton = document.getElementById('add-rule-button');
    const ruleForm = document.getElementById('rule-form');
    const ruleInput = document.getElementById('rule-input');
    const rulesList = document.getElementById('rules-list');

    if (addRuleButton && ruleForm && ruleInput && rulesList) {
        addRuleButton.addEventListener('click', () => {
            console.log('Add a Rule button clicked');
            ruleForm.style.display = 'block';
            ruleInput.disabled = false;
            ruleInput.focus();
            addRuleButton.classList.add('active');
        });

        // Handle form submission on Enter key
        ruleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleRuleSubmission();
            }
        });

        // Handle form submission on blur
        ruleInput.addEventListener('blur', handleRuleSubmission);

        async function handleRuleSubmission() {
            const inputValue = ruleInput.value.trim();
            console.log('Rule input submitted:', inputValue);

            // Reset form
            ruleForm.style.display = 'none';
            ruleInput.disabled = true;
            ruleInput.value = '';
            addRuleButton.classList.remove('active');

            // Validate input
            if (!inputValue) {
                console.log('Input is empty, action cancelled');
                return;
            }

            // Check if a valid expense is selected
            if (!window.selectedExpenseId || !window.expensesList) {
                console.log('No expense selected or expenses list not available, action cancelled');
                return;
            }

            const selectedExpense = window.expensesList.find(expense => expense.id === window.selectedExpenseId);
            if (!selectedExpense) {
                console.log('Selected expense not found, action cancelled');
                return;
            }

            // Split input into words and check if any match the expense description
            const inputWords = inputValue.toLowerCase().split(/\s+/);
            const descriptionWords = selectedExpense.description.toLowerCase().split(/\s+/);
            const hasMatchingWord = inputWords.some(word => descriptionWords.includes(word));

            if (!hasMatchingWord) {
                console.log('No matching words in expense description, action cancelled');
                return;
            }

            // Prepare rule data
            const categories = [
                selectedExpense.category1,
                selectedExpense.category2,
                selectedExpense.category3
            ].filter(cat => cat !== null && cat !== undefined);
            const ruleData = {
                words: inputValue,
                categories: categories
            };

            // Show confirmation popup
            const categoriesDisplay = categories.length > 0 ? categories.join(' > ') : 'None';
            const confirmationMessage = `Create rule with words "${inputValue}" for categories: ${categoriesDisplay}?`;
            console.log('Showing confirmation popup:', confirmationMessage);
            const confirmed = confirm(confirmationMessage);

            if (confirmed) {
                console.log('Rule creation confirmed, storing rule:', ruleData);
                // Store rule using rulesManager
                try {
                    const result = await window.rulesManager.addNewRule(ruleData);
                    if (result.success) {
                        console.log('Rule added successfully:', result.data);
                        // Add rule to rules-list display
                        const ruleElement = document.createElement('div');
                        ruleElement.className = 'rule-item';
                        ruleElement.dataset.ruleId = result.data.id;
                        ruleElement.innerHTML = `
                            <span class="rule-text">${result.data.words}: ${categoriesDisplay}</span>
                            <button class="rule-delete-button" title="Delete Rule">X</button>
                        `;
                        rulesList.appendChild(ruleElement);
                        console.log('Rule added to rules-list:', ruleElement.innerHTML);

                        // Add delete button event listener
                        const deleteButton = ruleElement.querySelector('.rule-delete-button');
                        deleteButton.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            console.log('Delete rule button clicked for ID:', result.data.id);
                            const deleteResult = await window.rulesManager.deleteRule(result.data.id);
                            if (deleteResult.success) {
                                ruleElement.remove();
                                console.log('Rule deleted from UI and db.json:', result.data.id);
                            } else {
                                console.error('Failed to delete rule:', deleteResult.message);
                                alert('Failed to delete rule: ' + deleteResult.message);
                            }
                        });
                    } else {
                        console.error('Failed to add rule:', result.message);
                        alert('Failed to add rule: ' + result.message);
                    }
                } catch (error) {
                    console.error('Error storing rule:', error);
                    alert('Error storing rule: ' + error.message);
                }
            } else {
                console.log('Rule creation cancelled');
            }
        }
    } else {
        console.error('Failed to find add-rule-button, rule-form, rule-input, or rules-list elements');
    }

    await loadPage();
    await window.rulesManager.applyAllRulesToExpenses(); // ← APPLICA REGOLE AL CARICAMENTO
}

// Load page data and set up the initial display
async function loadPage() {
    console.log('loadPage started');
    const expenseList = document.getElementById('expense-list');
    const rulesList = document.getElementById('rules-list');
    if (!expenseList || !rulesList) {
        console.error('expense-list or rules-list element not found');
        return;
    }
    expenseList.innerHTML = '';
    rulesList.innerHTML = '';

    try {
        console.log('Fetching expenses, categories, and rules...');
        const [fetchExpensesResult, fetchCategoriesResult, fetchRulesResult] = await Promise.all([
            window.fetchAllExpenses(),
            window.fetchAllCategories(),
            window.fetchAllRules()
        ]);
        window.expensesList = fetchExpensesResult.success ? fetchExpensesResult.data : [];
        window.categoriesList = fetchCategoriesResult.success ? fetchCategoriesResult.data : [];
        const rulesListData = fetchRulesResult.success ? fetchRulesResult.data : [];
        console.log('Expenses list at startup:', window.expensesList);
        console.log('Categories list:', window.categoriesList);
        console.log('Rules list:', rulesListData);

        // Populate rules-list
        rulesListData.forEach(rule => {
            const categoriesDisplay = rule.categories.length > 0 ? rule.categories.join(' > ') : 'None';
            const ruleElement = document.createElement('div');
            ruleElement.className = 'rule-item';
            ruleElement.dataset.ruleId = rule.id;
            ruleElement.innerHTML = `
                <span class="rule-text">${rule.words}: ${categoriesDisplay}</span>
                <button class="rule-delete-button" title="Delete Rule">X</button>
            `;
            rulesList.appendChild(ruleElement);
            console.log('Rule added to rules-list:', ruleElement.innerHTML);

            // Add delete button event listener
            const deleteButton = ruleElement.querySelector('.rule-delete-button');
            deleteButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                console.log('Delete rule button clicked for ID:', rule.id);
                const deleteResult = await window.rulesManager.deleteRule(rule.id);
                if (deleteResult.success) {
                    ruleElement.remove();
                    console.log('Rule deleted from UI and db.json:', rule.id);
                } else {
                    console.error('Failed to delete rule:', deleteResult.message);
                    alert('Failed to delete rule: ' + deleteResult.message);
                }
            });
        });
    } catch (error) {
        console.error('Fetch error in loadPage:', error);
        window.expensesList = [];
        window.categoriesList = [];
    }

    if (window.expensesList.length > 0) {
        console.log('Initializing expense selection...');
        window.selectedExpenseId = window.expensesList[0].id; // ← GLOBALE
        console.log('Selected expense ID:', window.selectedExpenseId);
        updateExpenseDisplay();
        window.categoriesManager.updateCategoryButtons(window.selectedExpenseId, window.expensesList, window.categoriesList);
    } else {
        console.log('No expenses found, setting no-data message');
        expenseList.innerHTML = '<p class="no-data">No expenses found</p>';
    }
    console.log('loadPage completed');
}

// Update the display of expenses based on the current list and selection
function updateExpenseDisplay() {
    console.log('updateExpenseDisplay called');
    if (window.expenseManager) {
        window.expenseManager.updateExpenseDisplay(window.expensesList, window.selectedExpenseId);
    } else {
        console.error('expenseManager not found');
    }
    console.log('updateExpenseDisplay completed');
}

// ← ESPORTA GLOBALE
window.selectedExpenseId = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded in categorizationPage.js');
        initializeCategorization();
    });
} else {
    console.log('Document already loaded, calling initializeCategorization');
    initializeCategorization();
}

// Handle expense selection events to update the display
document.getElementById('expense-list')?.addEventListener('expenseSelected', (e) => {
    console.log('expenseSelected event received, new ID:', e.detail.id);
    window.selectedExpenseId = e.detail.id;
    updateExpenseDisplay();
    window.categoriesManager.updateCategoryButtons(window.selectedExpenseId, window.expensesList, window.categoriesList);
});