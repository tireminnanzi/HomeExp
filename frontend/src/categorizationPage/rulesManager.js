// frontend/src/categorizationPage/rulesManager.js

const rulesManager = {
    _isAddingRule: false, // ← IL FIX MAGICO ANTI-DOPPIA CHIAMATA

    async canCreateRule(expense, words) {
        if (!expense || !words?.trim()) return { ok: false, message: "Parole chiave mancanti" };
        if (!expense.category1 && !expense.category2 && !expense.category3)
            return { ok: false, message: "Nessuna categoria assegnata alla spesa" };

        const keywords = words.toLowerCase().trim().split(/\s+/).filter(Boolean);
        if (!keywords.some(kw => expense.description.toLowerCase().includes(kw)))
            return { ok: false, message: "Parola chiave non trovata nella descrizione" };

        const { data: rules } = await window.fetchAllRules();
        const normalized = keywords.sort().join(' ');
        const exists = rules.some(r =>
            r.words.toLowerCase().trim().split(/\s+/).filter(Boolean).sort().join(' ') === normalized
        );

        return exists
            ? { ok: false, message: "Regola già esistente con queste parole chiave" }
            : { ok: true };
    },

    async addNewRule({ words, categories }) {
        // BLOCCO TOTALE DI CHIAMATE DUPLICATE
        if (this._isAddingRule) {
            return { success: false, ignored: true };
        }
        this._isAddingRule = true;

        // Esci da delete mode se attivo
        if (window.categoriesManager?.isDeleteMode) {
            window.categoriesManager.exitDeleteMode(window.selectedExpenseId, window.expensesList, window.categoriesList);
            this._isAddingRule = false;
            return { success: false };
        }

        const expense = window.expensesList.find(e => e.id === window.selectedExpenseId);
        const check = await this.canCreateRule(expense, words);

        if (!check.ok) {
            alert("Impossibile creare la regola:\n\n" + check.message);
            this._isAddingRule = false;
            return { success: false };
        }

        // UI: disabilita tutto
        const btn = document.querySelector('.add-rule-button');
        const input = document.getElementById('rule-text-input');
        const originalText = btn?.textContent;

        if (btn) {
            btn.disabled = true;
            btn.textContent = "Salvataggio...";
        }
        if (input) input.disabled = true;

        try {
            const res = await fetch('http://localhost:3000/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    words: words.trim(),
                    categories: categories.filter(Boolean)
                })
            });

            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Errore server");

            // SUCCESSO → aggiorna e chiudi
            await this.applyAllRulesToExpenses();

            // PULISCI E CHIUDI IL FORM
            if (input) input.value = '';
            if (typeof window.closeRuleForm === 'function') {
                window.closeRuleForm();
            } else if (document.querySelector('.rule-form')) {
                document.querySelector('.rule-form').remove();
            }

            return { success: true, data };

        } catch (err) {
            alert("Errore: " + err.message);
            return { success: false };
        } finally {
            // RIABILITA SEMPRE
            this._isAddingRule = false;
            if (btn && document.body.contains(btn)) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
            if (input) input.disabled = false;
        }
    },

    async deleteRule(ruleId) {
        if (window.categoriesManager?.isDeleteMode) {
            window.categoriesManager.exitDeleteMode(window.selectedExpenseId, window.expensesList, window.categoriesList);
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
                if (rule.words.toLowerCase().trim().split(/\s+/).some(kw => expense.description.toLowerCase().includes(kw))) {
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

window.rulesManager = {
    addNewRule: rulesManager.addNewRule.bind(rulesManager),
    deleteRule: rulesManager.deleteRule.bind(rulesManager),
    applyAllRulesToExpenses: rulesManager.applyAllRulesToExpenses.bind(rulesManager),
    canCreateRule: rulesManager.canCreateRule.bind(rulesManager)
};