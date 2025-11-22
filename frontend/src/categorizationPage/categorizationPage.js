// frontend/src/categorizationPage/categorizationPage.js
console.log('categorizationPage.js – VERSIONE FINALE CON SINGLE LINE REFRESH');

async function initializeCategorization() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return console.error('main-content not found');

    mainContent.innerHTML = `
        <div class="grid-container">
            <div class="expense-column">
                <h2 class="column-title">Expenses</h2>
                <ul id="expense-list" class="expense-list"></ul>
            </div>
            <div class="category-column">
                <div class="category-top">
                    <h2 class="column-title">Categories</h2>
                    <div id="category-buttons"></div>
                </div>
                <div class="category-bottom">
                    <button id="add-rule-button" class="add-rule-button">Add a Rule</button>
                    <form id="rule-form" class="rule-form" style="display:none;">
                        <input type="text" id="rule-input" class="rule-input" placeholder="Parole da cercare..." disabled>
                    </form>
                    <div id="rules-list"></div>
                </div>
            </div>
        </div>
    `;

    const addRuleButton = document.getElementById('add-rule-button');
    const ruleForm = document.getElementById('rule-form');
    const ruleInput = document.getElementById('rule-input');
    const rulesList = document.getElementById('rules-list');

    // BLOCCA ADD RULE SE NESSUNA CATEGORIA ASSEGNATA
    addRuleButton.addEventListener('click', () => {
        if (!window.selectedExpenseId) {
            alert('Seleziona una spesa prima');
            return;
        }
        const expense = window.expensesList.find(e => e.id === window.selectedExpenseId);
        if (!expense || (!expense.category1 && !expense.category2 && !expense.category3)) {
            alert('Assegna almeno una categoria alla spesa prima di creare una regola.');
            return;
        }

        ruleForm.style.display = 'block';
        ruleInput.disabled = false;
        ruleInput.focus();
        addRuleButton.classList.add('active');
    });

    // Gestione invio regola
    const submitRule = async () => {
        const words = ruleInput.value.trim();
        if (!words) return;

        ruleForm.style.display = 'none';
        ruleInput.value = '';
        ruleInput.disabled = true;
        addRuleButton.classList.remove('active');

        const expense = window.expensesList.find(e => e.id === window.selectedExpenseId);
        if (!expense) return;

        const categories = [expense.category1, expense.category2, expense.category3].filter(Boolean);
        if (confirm(`Creare regola: "${words}" → ${categories.join(' > ')}?`)) {
            await window.rulesManager.addNewRule({ words, categories });
        }
    };

    ruleInput.addEventListener('keydown', e => e.key === 'Enter' && (e.preventDefault(), submitRule()));
    ruleInput.addEventListener('blur', submitRule);

    await loadData();
    await window.rulesManager.applyAllRulesToExpenses();
}

async function loadData() {
    const [expRes, catRes, rulesRes] = await Promise.all([
        window.fetchAllExpenses(),
        window.fetchAllCategories(),
        window.fetchAllRules()
    ]);

    window.expensesList = expRes.success ? expRes.data : [];
    window.categoriesList = catRes.success ? catRes.data : [];

    document.getElementById('rules-list').innerHTML = '';
    if (rulesRes.success) {
        rulesRes.data.forEach(rule => {
            const display = rule.categories.filter(Boolean).join(' > ') || 'Nessuna';
            const el = document.createElement('div');
            el.className = 'rule-item';
            el.innerHTML = `<span>${rule.words}: ${display}</span><button class="rule-delete">X</button>`;
            el.querySelector('.rule-delete').onclick = () => 
                window.rulesManager.deleteRule(rule.id).then(() => el.remove());
            document.getElementById('rules-list').appendChild(el);
        });
    }

    if (window.expensesList.length > 0) {
        window.expenseManager.renderAll(window.expensesList);
    }
}

window.initializeCategorization = initializeCategorization;