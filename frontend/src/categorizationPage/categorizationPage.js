// frontend/src/categorizationPage/categorizationPage.js
console.log('categorizationPage.js → VERSIONE STABILE + REGOLE IN ORDINE INVERSO');

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

    addRuleButton.addEventListener('click', () => {
        if (!window.selectedExpenseId) return alert("Seleziona una spesa");

        const expense = window.expensesList.find(e => e.id === window.selectedExpenseId);
        if (!expense.category1 && !expense.category2 && !expense.category3)
            return alert("Assegna almeno una categoria alla spesa prima di creare una regola");

        ruleForm.style.display = 'block';
        ruleInput.disabled = false;
        ruleInput.value = '';
        ruleInput.focus();
        addRuleButton.classList.add('active');
    });

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

        await window.rulesManager.addNewRule({ words, categories });

        ruleForm.style.display = 'none';
        ruleInput.disabled = true;
        addRuleButton.classList.remove('active');
    };

    ruleInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); submitRule(); }
        if (e.key === 'Escape') { ruleForm.style.display = 'none'; ruleInput.disabled = true; addRuleButton.classList.remove('active'); }
    });
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

    if (window.expensesList.length > 0) {
        window.expenseManager.renderAll(window.expensesList);

        const firstUncategorized = window.expensesList.find(e => 
            !e.category1 && !e.category2 && !e.category3
        );
        if (firstUncategorized && firstUncategorized.id !== window.selectedExpenseId) {
            window.selectedExpenseId = firstUncategorized.id;
            window.expenseManager.renderAll(window.expensesList);
        }
    }

    // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
    // Usa la funzione centrale (definita sotto)
    // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
    window.renderRulesList(rulesRes.success ? rulesRes.data : []);
}

// =============================================================
// FUNZIONE CENTRALE: mostra regole con ultima in alto
// =============================================================
window.renderRulesList = function(rulesData) {
    const rulesList = document.getElementById('rules-list');
    if (!rulesList) return;

    const sorted = [...rulesData].reverse(); // ultima creata in alto

    if (sorted.length === 0) {
        rulesList.innerHTML = '<p style="color:#666; font-style:italic; text-align:center;">Nessuna regola definita</p>';
        return;
    }

    rulesList.innerHTML = sorted.map(rule => {
        const display = rule.categories.filter(Boolean).join(' > ') || 'Nessuna';
        return `<div class="rule-item">
            <span class="rule-text">${rule.words} → ${display}</span>
            <button class="rule-delete-button">X</button>
        </div>`;
    }).join('');

    rulesList.querySelectorAll('.rule-delete-button').forEach(btn => {
        btn.onclick = () => {
            const text = btn.closest('.rule-item').querySelector('.rule-text').textContent;
            if (confirm(`Eliminare regola: "${text}"?`)) {
                const rule = sorted.find(r => 
                    r.words + ' → ' + (r.categories.filter(Boolean).join(' > ') || 'Nessuna') === text
                );
                if (rule) window.rulesManager.deleteRule(rule.id);
            }
        };
    });
};

// =============================================================
// Esposizione
// =============================================================
window.initializeCategorization = initializeCategorization;

console.log('categorizationPage.js → REGOLE IN ORDINE INVERSO + PULITO');