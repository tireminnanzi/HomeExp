// frontend/src/categorizationPage/expenseManager.js
console.log('expenseManager.js → SINGLE LINE REFRESH + CATEGORIE SEMPRE SINCRONIZZATE');

const expenseManager = {
  rows: new Map(),

  renderRow(expense, isSelected = false) {
    let row = this.rows.get(expense.id);
    if (!row) {
      row = document.createElement('li');
      row.className = 'expense-item';
      row.dataset.expenseId = expense.id;
      document.getElementById('expense-list').appendChild(row);
      this.rows.set(expense.id, row);
    }

    row.className = 'expense-item';
    if (isSelected) row.classList.add('selected');
    if (expense.amount < 0) row.classList.add('expense-negative');
    if (expense.amount > 0) row.classList.add('expense-positive');

    row.innerHTML = `
      <span class="expense-date">${expense.date}</span>
      <span class="expense-description" contenteditable="false">${expense.description}</span>
      <span class="expense-amount ${expense.amount < 0 ? 'expense-negative' : 'expense-positive'}">
        ${expense.amount.toFixed(2)} €
      </span>
      <div class="category-tags"></div>
    `;

    const tagsContainer = row.querySelector('.category-tags');
    tagsContainer.innerHTML = '';

    ['category1', 'category2', 'category3'].forEach((key, i) => {
      if (expense[key]) {
        const btn = document.createElement('button');
        btn.textContent = expense[key];
        btn.className = `expense-category-button level-${i+1}`;
        btn.title = 'Clicca per rimuovere';

        btn.onclick = (e) => {
          e.stopPropagation();
          if (window.categoriesManager?.isDeleteMode) return;
          if (window.selectedExpenseId !== expense.id) {
            this.selectExpense(expense.id);
          }
          window.assignCategoryToExpense(expense, i+1, null).then(res => {
            if (res.success) {
              const idx = window.expensesList.findIndex(e => e.id === expense.id);
              if (idx !== -1) window.expensesList[idx] = res.data;
              this.renderRow(res.data, true);
            }
          });
        };
        tagsContainer.appendChild(btn);
      }
    });

    row.onclick = (e) => {
      if (e.target.closest('.expense-category-button') || e.target.isContentEditable) return;
      this.selectExpense(expense.id);
    };

    const desc = row.querySelector('.expense-description');
    desc.style.cursor = 'text';
    desc.title = 'Doppio click per modificare';

    let clickTimeout = null;
    desc.addEventListener('click', (e) => {
      e.stopPropagation();
      if (clickTimeout) clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        this.selectExpense(expense.id);
        clickTimeout = null;
      }, 250);
    });
    desc.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (window.categoriesManager?.isDeleteMode) return;
      if (clickTimeout) clearTimeout(clickTimeout);
      this.editDescription(expense, desc);
    });

    // UNICO POSTO DOVE AGGIORNARE LE CATEGORIE A DESTRA
    if (isSelected && window.categoriesManager && window.expensesList && window.categoriesList) {
      window.categoriesManager.updateCategoryButtons(
        expense.id,
        window.expensesList,
        window.categoriesList
      );
    }

    return row;
  },

  // MINIMALISTA: solo cambia selezione e chiama renderRow
  selectExpense(newId) {
    if (window.categoriesManager?.isDeleteMode) return;

    if (window.selectedExpenseId === newId) return;

    const oldId = window.selectedExpenseId;
    window.selectedExpenseId = newId;

    if (oldId) {
      const oldExp = window.expensesList.find(e => e.id === oldId);
      if (oldExp) this.renderRow(oldExp, false);
    }

    const newExp = window.expensesList.find(e => e.id === newId);
    if (newExp) {
      this.renderRow(newExp, true);
      this.rows.get(newId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },

  renderAll(expenses, initialSelectedId = null) {
    this.rows.clear();
    document.getElementById('expense-list').innerHTML = '';
    window.expensesList = expenses;

    expenses.forEach(exp => {
      const selected = exp.id === (initialSelectedId || expenses[0]?.id);
      this.renderRow(exp, selected);
    });

    if (expenses.length > 0 && !window.selectedExpenseId) {
      window.selectedExpenseId = initialSelectedId || expenses[0].id;
    }
  },

  editDescription(expense, span) {
    const original = span.textContent;
    span.contentEditable = true;
    span.focus();
    document.getSelection().selectAllChildren(span);

    const save = () => {
      const nuovo = span.textContent.trim();
      if (nuovo && nuovo !== original) {
        fetch(`http://localhost:3000/expenses/${expense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...expense, description: nuovo })
        })
          .then(r => r.json())
          .then(data => {
            const idx = window.expensesList.findIndex(e => e.id === data.id);
            if (idx !== -1) window.expensesList[idx] = data;
            this.renderRow(data, data.id === window.selectedExpenseId);
          });
      }
      span.contentEditable = false;
    };

    span.onblur = save;
    span.onkeydown = e => {
      if (e.key === 'Enter') { e.preventDefault(); span.blur(); }
      if (e.key === 'Escape') { span.textContent = original; span.blur(); }
    };
  }
};

document.addEventListener('keydown', e => {
  if (window.categoriesManager?.isDeleteMode) return;
  if (!['ArrowUp', 'ArrowDown'].includes(e.key) || document.activeElement?.isContentEditable) return;
  e.preventDefault();
  const list = window.expensesList;
  if (!list?.length) return;
  const idx = list.findIndex(ex => ex.id === window.selectedExpenseId);
  if (idx === -1) return;
  let newIdx = e.key === 'ArrowUp' ? idx - 1 : idx + 1;
  if (newIdx < 0) newIdx = list.length - 1;
  if (newIdx >= list.length) newIdx = 0;
  expenseManager.selectExpense(list[newIdx].id);
});

window.expenseManager = expenseManager;
console.log('expenseManager → PRONTO, ROBUSTO, CATEGORIE SEMPRE GIUSTE');