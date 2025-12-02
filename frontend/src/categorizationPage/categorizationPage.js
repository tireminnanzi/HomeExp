// frontend/src/categorizationPage/categorizationPage.js

console.log('categorizationPage.js → VERSIONE FINALE - FILTRO REGOLE FUNZIONA AL 100% (fix id string/number)');

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
                        <input type="text" id="rule-input" class="rule-input" placeholder="Parole chiave (es. amazon netto)" disabled>
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
            return alert("Assegna almeno una categoria prima");

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

        const result = await window.rulesManager.addNewRule({ words, categories });

        if (result.success) {
            const { data: freshRules } = await window.fetchAllRules();
            window.rulesList = freshRules;
            window.renderRulesList(freshRules);
            window.expenseManager.renderAll(window.expensesList);
        }

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
    window.rulesList = rulesRes.success ? rulesRes.data : [];

    if (!window.selectedRuleIds) window.selectedRuleIds = new Set();

    if (window.expensesList.length > 0) {
        window.expenseManager.renderAll(window.expensesList);
    }

    window.renderRulesList(window.rulesList);
    window.expenseManager.renderAll(window.expensesList);
}

// =============================================================
// FUNZIONE CENTRALE AGGIORNATA: regole con checkbox
// =============================================================
// =============================================================
// FUNZIONE CENTRALE CORRETTA – NON RICREA MAI IL SET!
// =============================================================
// =============================================================
// VERSIONE FINALE 100% FUNZIONANTE – ID come NUMERI + FILTRO PERFETTO
// =============================================================
window.renderRulesList = function(rulesData) {
    const rulesList = document.getElementById('rules-list');
    if (!rulesList) return;

    const sorted = [...rulesData].reverse();

    if (sorted.length === 0) {
        rulesList.innerHTML = '<p style="color:#666; font-style:italic; text-align:center;">Nessuna regola definita</p>';
        return;
    }

    // Inizializza il Set solo la prima volta
    if (!window.selectedRuleIds) {
        window.selectedRuleIds = new Set();
    }

    rulesList.innerHTML = sorted.map(rule => {
        const display = rule.categories.filter(Boolean).join(' > ') || 'Nessuna';
        const isChecked = window.selectedRuleIds.has(rule.id) ? 'checked' : '';

        return `<div class="rule-item">
            <label class="rule-checkbox-container">
                <input type="checkbox" class="rule-checkbox" data-rule-id="${rule.id}" ${isChecked}>
                <span class="checkmark"></span>
            </label>
            <span class="rule-text">${rule.words} → ${display}</span>
            <button class="rule-delete-button">X</button>
        </div>`;
    }).join('');

    // === CHECKBOX: converte SEMPRE in numero ===
    rulesList.querySelectorAll('.rule-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const ruleId = Number(this.dataset.ruleId);  // ← QUI LA CHIAVE!

            if (this.checked) {
                window.selectedRuleIds.add(ruleId);
            } else {
                window.selectedRuleIds.delete(ruleId);
            }

            console.log('Regole selezionate (numeri):', Array.from(window.selectedRuleIds));
            window.expenseManager.renderAll(window.expensesList);  // ← aggiorna subito
        });
    });

    // === DELETE BUTTON ===
    rulesList.querySelectorAll('.rule-delete-button').forEach(btn => {
        btn.onclick = () => {
            const item = btn.closest('.rule-item');
            const ruleId = Number(item.querySelector('.rule-checkbox').dataset.ruleId);

            if (confirm(`Eliminare regola: "${item.querySelector('.rule-text').textContent}"?`)) {
                window.selectedRuleIds.delete(ruleId);
                window.rulesManager.deleteRule(ruleId).then(() => {
                    window.fetchAllRules().then(res => {
                        if (res.success) {
                            window.rulesList = res.data;
                            window.renderRulesList(res.data);
                            window.expenseManager.renderAll(window.expensesList);
                        }
                    });
                });
            }
        };
    });
};

window.initializeCategorization = initializeCategorization;
console.log('categorizationPage.js → PRONTO - filtro regole ora funziona davvero');