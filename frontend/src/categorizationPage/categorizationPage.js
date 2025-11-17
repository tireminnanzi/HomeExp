// frontend/src/categorizationPage/categorizationPage.js
console.log('categorizationPage.js loaded');

// ← FUNZIONE PRINCIPALE (senza export)
async function initializeCategorization() {
    console.log('initializeCategorization started');
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error('main-content element not found');
        return;
    }

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
            </ div>
        </div>
    `;

    // === LOGICA ADD RULE (tutto il tuo codice che avevi prima) ===
    const addRuleButton = document.getElementById('add-rule-button');
    const ruleForm = document.getElementById('rule-form');
    const ruleInput = document.getElementById('rule-input');
    const rulesList = document.getElementById('rules-list');

    if (addRuleButton && ruleForm && ruleInput && rulesList) {
        addRuleButton.addEventListener('click', () => {
            ruleForm.style.display = 'block';
            ruleInput.disabled = false;
            ruleInput.focus();
            addRuleButton.classList.add('active');
        });

        const handleSubmit = async () => {
            const words = ruleInput.value.trim();
            if (!words) return;

            ruleForm.style.display = 'none';
            ruleInput.disabled = true;
            ruleInput.value = '';
            addRuleButton.classList.remove('active');

            if (!window.selectedExpenseId || !window.expensesList) return;
            const expense = window.expensesList.find(e => e.id === window.selectedExpenseId);
            if (!expense) return;

            const descWords = expense.description.toLowerCase().split(/\s+/);
            if (!words.toLowerCase().split(/\s+/).some(w => descWords.includes(w))) return;

            const categories = [expense.category1, expense.category2, expense.category3].filter(Boolean);
            const display = categories.length ? categories.join(' > ') : 'None';

            if (confirm(`Create rule "${words}" → ${display}?`)) {
                const result = await window.rulesManager.addNewRule({ words, categories });
                if (result.success) {
                    const el = document.createElement('div');
                    el.className = 'rule-item';
                    el.dataset.ruleId = result.data.id;
                    el.innerHTML = `<span class="rule-text">${words}: ${display}</span><button class="rule-delete-button">X</button>`;
                    rulesList.appendChild(el);
                    el.querySelector('.rule-delete-button').onclick = () => window.rulesManager.deleteRule(result.data.id).then(() => el.remove());
                }
            }
        };

        ruleInput.addEventListener('keypress', e => e.key === 'Enter' && (e.preventDefault(), handleSubmit()));
        ruleInput.addEventListener('blur', handleSubmit);
    }

    await loadPageData();
    await window.rulesManager.applyAllRulesToExpenses();
}

async function loadPageData() {
    const expenseList = document.getElementById('expense-list');
    const rulesList = document.getElementById('rules-list');
    if (!expenseList || !rulesList) return;

    try {
        const [exp, cat, rules] = await Promise.all([
            window.fetchAllExpenses(),
            window.fetchAllCategories(),
            window.fetchAllRules()
        ]);

        window.expensesList = exp.success ? exp.data : [];
        window.categoriesList = cat.success ? cat.data : [];

        rules.success && rules.data.forEach(rule => {
            const display = rule.categories.length ? rule.categories.join(' > ') : 'None';
            const el = document.createElement('div');
            el.className = 'rule-item';
            el.dataset.ruleId = rule.id;
            el.innerHTML = `<span class="rule-text">${rule.words}: ${display}</span><button class="rule-delete-button">X</button>`;
            rulesList.appendChild(el);
            el.querySelector('.rule-delete-button').onclick = () => window.rulesManager.deleteRule(rule.id).then(() => el.remove());
        });

        if (window.expensesList.length > 0) {
            window.selectedExpenseId = window.expensesList[0].id;
            window.expenseManager?.updateExpenseDisplay(window.expensesList, window.selectedExpenseId);
            window.categoriesManager?.updateCategoryButtons(window.selectedExpenseId, window.expensesList, window.categoriesList);
        } else {
            expenseList.innerHTML = '<p class="no-data">No expenses found</p>';
        }
    } catch (e) { console.error(e); }
}

function updateExpenseDisplay() {
    window.expenseManager?.updateExpenseDisplay(window.expensesList, window.selectedExpenseId);
}

// ← ESPORTAZIONE GLOBALE (UNICA RIGA IMPORTANTE)
window.initializeCategorization = initializeCategorization;

// ← NIENT'ALTRO QUI SOTTO! (niente DOMContentLoaded, niente listener)