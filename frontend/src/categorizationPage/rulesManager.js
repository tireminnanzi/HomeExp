// frontend/src/categorizationPage/rulesManager.js
console.log('rulesManager.js → VERSIONE FINALE CORRETTA E COMPLETA');

const rulesManager = {

    async canCreateRule(expense, words) {
        if (!expense || !words?.trim()) return { ok: false, message: "Parole chiave mancanti" };

        const hasCategory = expense.category1 || expense.category2 || expense.category3;
        if (!hasCategory) return { ok: false, message: "Nessuna categoria assegnata alla spesa" };

        const keywords = words.toLowerCase().split(/\s+/).filter(Boolean);
        const descLower = expense.description.toLowerCase();
        if (!keywords.some(kw => descLower.includes(kw))) {
            return { ok: false, message: "Nessuna parola chiave trovata nella descrizione" };
        }

        const { data: rules } = await window.fetchAllRules();
        const normalized = keywords.sort().join(' ');
        const exists = rules.some(r => {
            const existing = r.words.toLowerCase().split(/\s+/).filter(Boolean).sort().join(' ');
            return existing === normalized;
        });

        if (exists) return { ok: false, message: "Regola già esistente con queste parole chiave" };

        return { ok: true };
    },

    async addNewRule({ words, categories }) {
 
 if (window.categoriesManager?.isDeleteMode) {
        window.categoriesManager.exitDeleteMode(
            window.selectedExpenseId,
            window.expensesList,
            window.categoriesList
        );
        return { success: false };
    }
 
 
        const expense = window.expensesList.find(e => e.id === window.selectedExpenseId);
        const check = await this.canCreateRule(expense, words);
        if (!check.ok) {
            alert("Impossibile creare la regola:\n" + check.message);
            return { success: false };
        }

        const res = await fetch('http://localhost:3000/rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ words: words.trim(), categories: categories.filter(Boolean) })
        });

        const data = await res.json();
        if (!res.ok || data.error) {
            alert("Errore: " + (data.error || "Impossibile salvare"));
            return { success: false };
        }

        await this.applyAllRulesToExpenses();
        return { success: true, data };
    },

    async deleteRule(ruleId) {
// BLOCCA ELIMINAZIONE REGOLE IN DELETE MODE
    if (window.categoriesManager?.isDeleteMode) {
        window.categoriesManager.exitDeleteMode(
            window.selectedExpenseId,
            window.expensesList,
            window.categoriesList
        );
        return;
    }

    await fetch(`http://localhost:3000/rules/${ruleId}`, { method: 'DELETE' });
        await this.applyAllRulesToExpenses();
    },

    async applyAllRulesToExpenses() {
        const { data: expenses } = await window.fetchAllExpenses();
        const { data: rules } = await window.fetchAllRules();
        if (!rules?.length) return;

        const promises = [];

        for (const expense of expenses) {
            for (const rule of rules) {
                if (rule.words.toLowerCase().split(/\s+/).some(kw => expense.description.toLowerCase().includes(kw))) {
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
    }
};

// ESPORTA TUTTO CORRETTAMENTE
window.rulesManager = {
    addNewRule: rulesManager.addNewRule.bind(rulesManager),
    deleteRule: rulesManager.deleteRule.bind(rulesManager),
    applyAllRulesToExpenses: rulesManager.applyAllRulesToExpenses.bind(rulesManager),
    canCreateRule: rulesManager.canCreateRule.bind(rulesManager)
};

console.log('rulesManager → PRONTO E COMPLETO');