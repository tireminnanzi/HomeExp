// frontend/src/categorizationPage/rulesManager.js
console.log('rulesManager.js – VERSIONE FINALE CON RENDERROW');

async function applyAllRulesToExpenses() {
    const { data: expenses } = await window.fetchAllExpenses();
    const { data: rules } = await window.fetchAllRules();
    if (!rules?.length) return;

    const promises = [];

    for (const expense of expenses) {
        for (const rule of rules) {
            const words = rule.words.toLowerCase().split(',').map(w => w.trim());
            if (words.some(w => expense.description.toLowerCase().includes(w))) {
                const updated = {
                    ...expense,
                    category1: rule.categories[0] || null,
                    category2: rule.categories[1] || null,
                    category3: rule.categories[2] || null
                };
                promises.push(
                    fetch(`http://localhost:3000/expenses/${expense.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updated)
                    }).then(r => r.json())
                );
                break;
            }
        }
    }

    if (promises.length > 0) {
        const results = await Promise.all(promises);
        results.forEach(exp => {
            const idx = window.expensesList.findIndex(e => e.id === exp.id);
            if (idx !== -1) {
                window.expensesList[idx] = exp;
                window.expenseManager.renderRow(exp, exp.id === window.selectedExpenseId);
            }
        });
        if (window.selectedExpenseId) {
            window.categoriesManager.updateCategoryButtons(window.selectedExpenseId, window.expensesList, window.categoriesList);
        }
    }
}

async function addNewRule(rule) {
    const res = await window.addNewRule(rule);
    if (res.success) {
        await applyAllRulesToExpenses();
    }
    return res;
}

async function deleteRule(ruleId) {
    const { data: rules } = await window.fetchAllRules();
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    const words = rule.words.toLowerCase().split(',').map(w => w.trim());
    const cats = rule.categories;

    const { data: expenses } = await window.fetchAllExpenses();
    const promises = [];

    for (const exp of expenses) {
        const matchesDesc = words.some(w => exp.description.toLowerCase().includes(w));
        const matchesCats = [exp.category1, exp.category2, exp.category3].every((c, i) => c === (cats[i] || null));
        if (matchesDesc && matchesCats) {
            const cleaned = { ...exp, category1: null, category2: null, category3: null };
            promises.push(
                fetch(`http://localhost:3000/expenses/${exp.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleaned)
                }).then(r => r.json())
            );
        }
    }

    if (promises.length) {
        const results = await Promise.all(promises);
        results.forEach(exp => {
            const idx = window.expensesList.findIndex(e => e.id === exp.id);
            if (idx !== -1) {
                window.expensesList[idx] = exp;
                window.expenseManager.renderRow(exp, exp.id === window.selectedExpenseId);
            }
        });
        if (window.selectedExpenseId) {
            window.categoriesManager.updateCategoryButtons(window.selectedExpenseId, window.expensesList, window.categoriesList);
        }
    }

    return await window.deleteRule(ruleId);
}

window.rulesManager = {
    applyAllRulesToExpenses,
    addNewRule,
    deleteRule
};