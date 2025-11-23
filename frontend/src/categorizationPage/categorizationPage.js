// frontend/src/categorizationPage/categorizationPage.js
console.log('categorizationPage.js → VERSIONE FINALE DEFINITIVA');

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
                        <input type="text" id="rule-input" class="rule-input" placeholder="Parole chiave (es. amazon netflix)" disabled>
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

    // ADD A RULE – BLOCCATO SE NESSUNA CATEGORIA
    addRuleButton.addEventListener('click', () => {
        if (!window.selectedExpenseId) {
            alert("Seleziona una spesa");
            return;
        }

        const expense = window.expensesList.find(e => e.id === window.selectedExpenseId);
        const hasCategory = expense.category1 || expense.category2 || expense.category3;

        if (!hasCategory) {
            alert("Assegna almeno una categoria alla spesa prima di creare una regola");
            return;
        }

        ruleForm.style.display = 'block';
        ruleInput.disabled = false;
        ruleInput.value = '';
        ruleInput.focus();
        addRuleButton.classList.add('active');
    });

    // SUBMIT REGOLA
    const submitRule = async () => {
        const words = ruleInput.value.trim();
        if (!words) {
            ruleForm.style.display = 'none';
            ruleInput.disabled = true;
            addRuleButton.classList.remove('active');
            return;
        }

        const expense = window.expensesList.find(e => e.id === window.selectedExpenseId);
        const categories = [expense.category1, expense.category2, expense.category3].filter(Boolean);

        const result = await window.rulesManager.addNewRule({ words, categories });

        ruleForm.style.display = 'none';
        ruleInput.disabled = true;
        addRuleButton.classList.remove('active');


if (result.success) {
    // Ricarica le regole per mostrarle subito
    const { data: updatedRules } = await window.fetchAllRules();
    const rulesList = document.getElementById('rules-list');
    rulesList.innerHTML = '';

    if (updatedRules.length > 0) {
        updatedRules.forEach(rule => {
            const display = rule.categories.filter(Boolean).join(' > ') || 'Nessuna';
            const el = document.createElement('div');
            el.className = 'rule-item';
            el.innerHTML = `
                <span class="rule-text">${rule.words} → ${display}</span>
                <button class="rule-delete-button">X</button>
            `;
            el.querySelector('.rule-delete-button').onclick = () => {
                if (confirm("Eliminare questa regola?")) {
                    window.rulesManager.deleteRule(rule.id).then(() => el.remove());
                }
            };
            rulesList.appendChild(el);
        });
    } else {
        rulesList.innerHTML = '<p style="color:#666; font-style:italic; text-align:center;">Nessuna regola definita</p>';
    }

    alert("Regola creata con successo!");
}




    };

    ruleInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitRule();
        }
        if (e.key === 'Escape') {
            ruleForm.style.display = 'none';
            ruleInput.disabled = true;
            addRuleButton.classList.remove('active');
        }
    });

    ruleInput.addEventListener('blur', submitRule);

    // CARICA DATI
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

    // Render spese
    if (window.expensesList.length > 0) {
        window.expenseManager.renderAll(window.expensesList);
    }

    // Render regole
    const rulesList = document.getElementById('rules-list');
    rulesList.innerHTML = '';

    if (rulesRes.success && rulesRes.data.length > 0) {
        rulesRes.data.forEach(rule => {
            const display = rule.categories.filter(Boolean).join(' > ') || 'Nessuna';
            const el = document.createElement('div');
            el.className = 'rule-item';
            el.innerHTML = `
                <span class="rule-text">${rule.words} → ${display}</span>
                <button class="rule-delete-button">X</button>
            `;
            el.querySelector('.rule-delete-button').onclick = () => {
                if (confirm("Eliminare questa regola?")) {
                    window.rulesManager.deleteRule(rule.id).then(() => el.remove());
                }
            };
            rulesList.appendChild(el);
        });
    } else {
        rulesList.innerHTML = '<p style="color:#666; font-style:italic; text-align:center;">Nessuna regola definita</p>';
    }
}

window.initializeCategorization = initializeCategorization;
console.log('categorizationPage.js → PRONTO E PERFETTO');