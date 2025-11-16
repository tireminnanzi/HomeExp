// frontend/src/categorizationPage/expenseManager.js
console.log('expenseManager.js loaded - initializing with logs');

const expenseManager = {
  updateExpenseDisplay(expenses, selectedExpenseId) {
    console.log('updateExpenseDisplay called:', { count: expenses.length, selected: selectedExpenseId });
    const expenseList = document.getElementById('expense-list');
    if (!expenseList) {
      console.error('expense-list not found!');
      return;
    }
    expenseList.innerHTML = '';

    expenses.forEach(expense => {
      const expenseItem = document.createElement('li');
      expenseItem.className = 'expense-item';
      expenseItem.dataset.expenseId = expense.id;

      expenseItem.innerHTML = `
        <span class="expense-date">${expense.date}</span>
        <span class="expense-description" contenteditable="false">${expense.description}</span>
        <span class="expense-amount ${expense.amount < 0 ? 'expense-negative' : 'expense-positive'}">
          ${expense.amount.toFixed(2)} €
        </span>
      `;

      if (expense.amount < 0) expenseItem.classList.add('expense-negative');
      else if (expense.amount > 0) expenseItem.classList.add('expense-positive');

      // === CATEGORIE TAG ===
      const categoryTags = document.createElement('div');
      categoryTags.className = 'category-tags';
      const categories = [
        { name: expense.category1, level: 1 },
        { name: expense.category2, level: 2 },
        { name: expense.category3, level: 3 }
      ].filter(c => c.name);

      categories.forEach(cat => {
        const tag = document.createElement('button');
        tag.textContent = cat.name;
        tag.className = `expense-category-button level-${cat.level}`;
        tag.onclick = (e) => {
          e.stopPropagation();
          console.log('Category tag clicked:', cat.name, 'on expense:', expense.id);
          window.assignCategoryToExpense(expense, cat.level, null).then(result => {
            if (result.success) {
              const idx = expenses.findIndex(e => e.id === expense.id);
              if (idx !== -1) expenses[idx] = result.data;
              if (window.expensesList) {
                const gIdx = window.expensesList.findIndex(e => e.id === expense.id);
                if (gIdx !== -1) window.expensesList[gIdx] = result.data;
              }
              expenseList.dispatchEvent(new CustomEvent('expenseSelected', { detail: { id: expense.id } }));
            }
          });
        };
        categoryTags.appendChild(tag);
      });
      expenseItem.appendChild(categoryTags);

      // === CLICK SU RIGA → SELEZIONA (CON LOG) ===
      expenseItem.addEventListener('click', (e) => {
        if (e.target.classList.contains('expense-description')) {
          console.log('Click su descrizione → ignorato per doppio click');
          return;
        }
        console.log('CLICK RIGA RILEVATO → seleziono ID:', expense.id);
        expenseList.dispatchEvent(new CustomEvent('expenseSelected', { 
          detail: { id: expense.id } 
        }));
      });

      // === DOPPIO CLICK SU DESCRIZIONE → MODIFICA (CON LOG) ===
      const descriptionSpan = expenseItem.querySelector('.expense-description');
      descriptionSpan.style.cursor = 'text';
      descriptionSpan.title = 'Doppio click per modificare';

      descriptionSpan.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        console.log('DOPPIO CLICK SU DESCRIZIONE → ID:', expense.id);
        const span = e.target;
        const originalText = span.textContent;

        span.contentEditable = true;
        span.focus();

        // Seleziona tutto
        const range = document.createRange();
        range.selectNodeContents(span);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        span.style.outline = '1px solid #007bff';
        span.style.borderRadius = '4px';
        span.style.padding = '2px';

        const save = async () => {
          const newText = span.textContent.trim();
          console.log('Salvataggio descrizione:', { old: originalText, new: newText });
          if (newText && newText !== originalText) {
            try {
              const updated = { ...expense, description: newText };
              const res = await fetch(`http://localhost:3000/expenses/${expense.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
              });
              if (res.ok) {
                const data = await res.json();
                const idx = expenses.findIndex(e => e.id === expense.id);
                if (idx !== -1) expenses[idx] = data;
                if (window.expensesList) {
                  const gIdx = window.expensesList.findIndex(e => e.id === expense.id);
                  if (gIdx !== -1) window.expensesList[gIdx] = data;
                }
                console.log('Descrizione salvata con successo');
              }
            } catch (err) {
              console.error('Errore salvataggio:', err);
              span.textContent = originalText;
            }
          }
          span.contentEditable = false;
          span.style.outline = '';
          span.style.borderRadius = '';
          span.style.padding = '';
        };

        const handleKey = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            span.blur();
          } else if (e.key === 'Escape') {
            console.log('Escape → annulla modifica');
            span.textContent = originalText;
            span.blur();
          }
        };

        span.addEventListener('keydown', handleKey);
        span.addEventListener('blur', () => {
          span.removeEventListener('keydown', handleKey);
          save();
        }, { once: true });
      });

      // === HIGHLIGHT SELEZIONATA ===
      if (expense.id === selectedExpenseId) {
        expenseItem.classList.add('selected');
        console.log('Spesa selezionata evidenziata:', expense.id);
      }

      expenseList.appendChild(expenseItem);
    });
  }
};

// === NAVIGAZIONE CON FRECCE ↑ ↓ (CON LOG) ===
console.log('Aggiunto listener per frecce ↑ ↓');
document.addEventListener('keydown', (e) => {
  console.log('Tasto premuto:', e.key, 'activeElement:', document.activeElement?.tagName);

  // Ignora durante modifica
  if (document.activeElement?.classList.contains('expense-description') && 
      document.activeElement?.isContentEditable) {
    console.log('Modifica in corso → frecce ignorate');
    return;
  }

  if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    console.log('Input attivo → frecce ignorate');
    return;
  }

  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    console.log('FRECCIA RILEVATA →', e.key);
    navigateWithArrows(e.key);
  }
});

function navigateWithArrows(key) {
  if (!window.expensesList || !window.selectedExpenseId) {
    console.log('Nessuna spesa o selezione → navigazione bloccata');
    return;
  }

  const currentIdx = window.expensesList.findIndex(e => e.id === window.selectedExpenseId);
  if (currentIdx === -1) return;

  let newIdx = currentIdx;
  if (key === 'ArrowUp' && currentIdx > 0) {
    newIdx = currentIdx - 1;
    console.log('↑ → vado a indice:', newIdx);
  } else if (key === 'ArrowDown' && currentIdx < window.expensesList.length - 1) {
    newIdx = currentIdx + 1;
    console.log('↓ → vado a indice:', newIdx);
  } else {
    console.log('Fine lista → non mi muovo');
    return;
  }

  const newExpense = window.expensesList[newIdx];
  window.selectedExpenseId = newExpense.id;

  console.log('Nuova selezione:', newExpense.id, newExpense.description);

  window.expenseManager.updateExpenseDisplay(window.expensesList, newExpense.id);
  window.categoriesManager.updateCategoryButtons(newExpense.id, window.expensesList, window.categoriesList);

  const item = document.querySelector(`li[data-expense-id="${newExpense.id}"]`);
  if (item) {
    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    console.log('Scrollato alla riga:', newExpense.id);
  }
}

// === ESPORTA GLOBALE ===
window.expenseManager = expenseManager;
console.log('expenseManager inizializzato con LOG completi');