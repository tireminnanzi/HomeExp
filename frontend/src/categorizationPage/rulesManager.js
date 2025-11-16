// frontend/src/categorizationPage/rulesManager.js
console.log('rulesManager.js loaded');

// === APPLICA TUTTE LE REGOLE AL CARICAMENTO PAGINA ===
async function applyAllRulesToExpenses() {
  console.log('Applying ALL rules on page load...');

  const { success: expOk, data: expenses } = await window.fetchAllExpenses();
  const { success: ruleOk, data: rules } = await window.fetchAllRules();

  if (!expOk || !ruleOk || rules.length === 0) return;

  const updatePromises = [];

  for (const expense of expenses) {
    let applied = false;
    let cats = [null, null, null];

    for (const rule of rules) {
      const words = rule.words.toLowerCase().split(',').map(w => w.trim()).filter(Boolean);
      if (words.some(w => expense.description.toLowerCase().includes(w))) {
        cats = [rule.categories[0] || null, rule.categories[1] || null, rule.categories[2] || null];
        applied = true;
        break;
      }
    }

    if (applied) {
      const updated = { ...expense, category1: cats[0], category2: cats[1], category3: cats[2] };
      updatePromises.push(
        fetch(`http://localhost:3000/expenses/${expense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        }).then(() => updated)
      );
    }
  }

  const updatedExpenses = await Promise.all(updatePromises);
  updatedExpenses.forEach(exp => {
    const i = window.expensesList.findIndex(e => e.id === exp.id);
    if (i !== -1) window.expensesList[i] = exp;
  });

  // Usa window.selectedExpenseId (globale)
  if (window.expenseManager && window.selectedExpenseId) {
    window.expenseManager.updateExpenseDisplay(window.expensesList, window.selectedExpenseId);
    if (window.categoriesManager) {
      window.categoriesManager.updateCategoryButtons(window.selectedExpenseId, window.expensesList, window.categoriesList);
    }
  }
}

// === ADD NEW RULE + APPLICA SUBITO ===
async function addNewRule(rule) {
  console.log('Adding rule and applying immediately:', rule);

  const result = await window.addNewRule(rule);
  if (!result.success) return result;

  const newRule = result.data;
  const words = newRule.words.toLowerCase().split(',').map(w => w.trim()).filter(Boolean);
  const cats = [newRule.categories[0] || null, newRule.categories[1] || null, newRule.categories[2] || null];

  const { data: expenses } = await window.fetchAllExpenses();
  const updatePromises = [];

  for (const expense of expenses) {
    if (words.some(w => expense.description.toLowerCase().includes(w))) {
      const updated = { ...expense, category1: cats[0], category2: cats[1], category3: cats[2] };
      updatePromises.push(
        fetch(`http://localhost:3000/expenses/${expense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        }).then(() => updated)
      );
    }
  }

  const updatedExpenses = await Promise.all(updatePromises);
  updatedExpenses.forEach(exp => {
    const i = window.expensesList.findIndex(e => e.id === exp.id);
    if (i !== -1) window.expensesList[i] = exp;
  });

  // Usa window.selectedExpenseId
  if (window.expenseManager && window.selectedExpenseId) {
    window.expenseManager.updateExpenseDisplay(window.expensesList, window.selectedExpenseId);
    if (window.categoriesManager) {
      window.categoriesManager.updateCategoryButtons(window.selectedExpenseId, window.expensesList, window.categoriesList);
    }
  }

  return result;
}

// === DELETE RULE + RIMUOVI SOLO LE SUE CATEGORIE ===
async function deleteRule(ruleId) {
  const { data: rules } = await window.fetchAllRules();
  const rule = rules.find(r => r.id === ruleId);
  if (!rule) return { success: false };

  const words = rule.words.toLowerCase().split(',').map(w => w.trim()).filter(Boolean);
  const cats = rule.categories;

  const { data: expenses } = await window.fetchAllExpenses();
  const updatePromises = [];

  for (const expense of expenses) {
    const descMatch = words.some(w => expense.description.toLowerCase().includes(w));
    const catsMatch = [expense.category1, expense.category2, expense.category3].every((c, i) => c === (cats[i] || null));

    if (descMatch && catsMatch) {
      const updated = { ...expense, category1: null, category2: null, category3: null };
      updatePromises.push(
        fetch(`http://localhost:3000/expenses/${expense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        }).then(() => updated)
      );
    }
  }

  const updatedExpenses = await Promise.all(updatePromises);
  updatedExpenses.forEach(exp => {
    const i = window.expensesList.findIndex(e => e.id === exp.id);
    if (i !== -1) window.expensesList[i] = exp;
  });

  if (window.expenseManager && window.selectedExpenseId) {
    window.expenseManager.updateExpenseDisplay(window.expensesList, window.selectedExpenseId);
    if (window.categoriesManager) {
      window.categoriesManager.updateCategoryButtons(window.selectedExpenseId, window.expensesList, window.categoriesList);
    }
  }

  return await window.deleteRule(ruleId);
}

// === ESPORTA ===
window.rulesManager = {
  addNewRule,
  deleteRule,
  applyAllRulesToExpenses
};

console.log('rulesManager ready with instant UI update');