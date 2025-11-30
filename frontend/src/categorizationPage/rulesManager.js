// frontend/src/categorizationPage/rulesManager.js
console.log('rulesManager.js → VERSIONE FINALE 100% FUNZIONANTE');

const rulesManager = {
    _isAddingRule: false,

    async canCreateRule(expense, words) {
        if (!expense || !words?.trim()) return { ok: false, message: "Parole chiave mancanti" };
        if (!expense.category1 && !expense.category2 && !expense.category3)
            return { ok: false, message: "Nessuna categoria assegnata alla spesa" };

        const keywords = words.toLowerCase().trim().split(/\s+/).filter(Boolean);
        if (!keywords.some(kw => expense.description.toLowerCase().includes(kw)))
            return { ok: false, message: "Nessuna parola chiave trovata nella descrizione" };

        const { data: rules } = await window.fetchAllRules();
        const normalized = keywords.sort().join(' ');
        const exists = rules.some(r => {
            const ruleWords = r.words.toLowerCase().trim().split(/\s+/).filter(Boolean).sort().join(' ');
            return ruleWords === normalized;
        });

        return exists
            ? { ok: false, message: "Regola già esistente" }
            : { ok: true };
    },

    async addNewRule({ words, categories }) {
        if (this._isAddingRule) return { success: false, ignored: true };
        this._isAddingRule = true;

        if (window.categoriesManager?.isDeleteMode) {
            window.categoriesManager.exitDeleteMode();
        }

        const expense = window.expensesList.find(e => e.id === window.selectedExpenseId);
        if (!expense) {
            this._isAddingRule = false;
            return { success: false };
        }

        const check = await this.canCreateRule(expense, words);
        if (!check.ok) {
            alert("Impossibile creare la regola:\n\n" + check.message);
            this._isAddingRule = false;
            return { success: false };
        }

        const btn = document.querySelector('.add-rule-button');
        const input = document.getElementById('rule-input');
        const originalText = btn?.textContent || "Add a Rule";

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

            await this.applyAllRulesToExpenses();

            if (input) input.value = '';
            const ruleForm = document.getElementById('rule-form');
            if (ruleForm) ruleForm.style.display = 'none';

            if (btn) {
                btn.textContent = originalText;
                btn.disabled = false;
            }

            return { success: true, data };

        } catch (err) {
            console.error('[rulesManager] Errore creazione regola:', err);
            alert("Errore: " + err.message);
            return { success: false };
        } finally {
            this._isAddingRule = false;
            if (btn && document.body.contains(btn)) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
            if (input) input.disabled = false;
        }
    },

    async deleteRule(ruleId) {
        console.log('[rulesManager] Eliminazione regola:', ruleId);
        try {
            const res = await fetch(`http://localhost:3000/rules/${ruleId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Errore server');

            await this.applyAllRulesToExpenses();

            const { data: updatedRules } = await window.fetchAllRules();
            const rulesList = document.getElementById('rules-list');
            if (!rulesList) return;

            rulesList.innerHTML = updatedRules.length > 0
                ? updatedRules.map(rule => {
                    const display = rule.categories.filter(Boolean).join(' > ') || 'Nessuna';
                    return `<div class="rule-item">
                        <span class="rule-text">${rule.words} → ${display}</span>
                        <button class="rule-delete-button">X</button>
                    </div>`;
                }).join('')
                : '<p style="color:#666; font-style:italic; text-align:center;">Nessuna regola definita</p>';

            rulesList.querySelectorAll('.rule-delete-button').forEach(btn => {
                btn.onclick = () => {
                    const item = btn.closest('.rule-item');
                    const text = item.querySelector('.rule-text').textContent;
                    if (confirm(`Eliminare regola: "${text}"?`)) {
                        const rule = updatedRules.find(r =>
                            r.words + ' → ' + (r.categories.filter(Boolean).join(' > ') || 'Nessuna') === text
                        );
                        if (rule) window.rulesManager.deleteRule(rule.id);
                    }
                };
            });

        } catch (err) {
            console.error('[rulesManager] Errore delete:', err);
            alert("Errore eliminazione regola");
        }
    },

    async applyAllRulesToExpenses() {
        console.log('[rulesManager] Applicazione regole in corso...');

        const { data: freshExpenses } = await window.fetchAllExpenses();
        const { data: rules } = await window.fetchAllRules();
        if (!rules?.length) return;

        const updatedIds = new Set();
        const promises = [];

        for (const expense of freshExpenses) {
            for (const rule of rules) {
                if (rule.words.toLowerCase().trim().split(/\s+/).some(kw =>
                    expense.description.toLowerCase().includes(kw)
                )) {
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
                        })
                        .then(r => r.json())
                        .then(data => {
                            updatedIds.add(data.id);
                            return data;
                        })
                    );
                    break;
                }
            }
        }

        if (promises.length === 0) return;

        const results = await Promise.all(promises);

        results.forEach(exp => {
            const idx = window.expensesList.findIndex(e => e.id === exp.id);
            if (idx !== -1) window.expensesList[idx] = exp;
        });

        updatedIds.forEach(id => {
            const exp = window.expensesList.find(e => e.id === id);
            if (exp) {
                const isSelected = id === window.selectedExpenseId;
                window.expenseManager.renderRow(exp, isSelected);
            }
        });

        if (window.selectedExpenseId) {
            window.categoriesManager?.updateCategoryButtons?.(
                window.selectedExpenseId,
                window.expensesList,
                window.categoriesList
            );
        }

        console.log('[rulesManager] Regole applicate e UI aggiornata');
    }
};

window.rulesManager = rulesManager;
console.log('rulesManager → CARICATO CORRETTAMENTE E PRONTO');