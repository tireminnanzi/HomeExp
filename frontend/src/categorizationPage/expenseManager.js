// frontend/src/categorizationPage/expenseManager.js
console.log('expenseManager.js loaded - initializing with logs');

// OGGETTO PRINCIPALE: contiene la funzione per disegnare la lista delle spese
const expenseManager = {
  // Funzione principale: RICOSTRUISCE TUTTA la lista delle spese nell'HTML
  updateExpenseDisplay(expenses, selectedExpenseId) {
    console.log('updateExpenseDisplay called:', { count: expenses.length, selected: selectedExpenseId });
    
    // Prende il <ul> dove vanno le spese
    const expenseList = document.getElementById('expense-list');
    if (!expenseList) {
      console.error('expense-list not found!');
      return;
    }
    
    // SVUOTA completamente la lista (importante: ogni volta si ricostruisce da zero)
    expenseList.innerHTML = '';

    // Per OGNI spesa nel database...
    expenses.forEach(expense => {
      // Crea un <li> per la singola riga
      const expenseItem = document.createElement('li');
      expenseItem.className = 'expense-item';
      expenseItem.dataset.expenseId = expense.id;  // utile per trovare la riga dopo

      // HTML base della riga: data, descrizione, importo
      expenseItem.innerHTML = `
        <span class="expense-date">${expense.date}</span>
        <span class="expense-description" contenteditable="false">${expense.description}</span>
        <span class="expense-amount ${expense.amount < 0 ? 'expense-negative' : 'expense-positive'}">
          ${expense.amount.toFixed(2)} €
        </span>
      `;

      // Colorazione riga intera se positivo/negativo
      if (expense.amount < 0) expenseItem.classList.add('expense-negative');
      else if (expense.amount > 0) expenseItem.classList.add('expense-positive');

      // === CREAZIONE TAG CATEGORIE (es. Food → Groceries → Pasta) ===
      const categoryTags = document.createElement('div');
      categoryTags.className = 'category-tags';

      // Prende solo le categorie assegnate (massimo 3 livelli)
      const categories = [
        { name: expense.category1, level: 1 },
        { name: expense.category2, level: 2 },
        { name: expense.category3, level: 3 }
      ].filter(c => c.name);  // filtra quelle vuote

      categories.forEach(cat => {
        const tag = document.createElement('button');
        tag.textContent = cat.name;
        tag.className = `expense-category-button level-${cat.level}`;  // per colore
        tag.onclick = (e) => {
          e.stopPropagation();  // importante: non triggera click sulla riga
          console.log('Category tag clicked:', cat.name, 'on expense:', expense.id);
          
          // Chiama funzione globale che rimuove la categoria dal backend
          window.assignCategoryToExpense(expense, cat.level, null).then(result => {
            if (result.success) {
              // Aggiorna i dati in memoria
              const idx = expenses.findIndex(e => e.id === expense.id);
              if (idx !== -1) expenses[idx] = result.data;
              if (window.expensesList) {
                const gIdx = window.expensesList.findIndex(e => e.id === expense.id);
                if (gIdx !== -1) window.expensesList[gIdx] = result.data;
              }
              // Spara un evento personalizzato: "ehi, ho cambiato selezione!"
              expenseList.dispatchEvent(new CustomEvent('expenseSelected', { 
                detail: { id: expense.id } 
              }));
            }
          });
        };
        categoryTags.appendChild(tag);
      });
      expenseItem.appendChild(categoryTags);

      // === CLICK SU QUALSIASI PARTE DELLA RIGA → seleziona questa spesa ===
      expenseItem.addEventListener('click', (e) => {
        // Ignora se ho cliccato su un tag categoria o sto modificando la descrizione
        if (e.target.closest('.expense-category-button') || 
            (e.target.classList.contains('expense-description') && e.target.isContentEditable)) {
          return;
        }

        console.log('CLICK RIGA → seleziono ID:', expense.id);
        // Spara lo stesso evento usato sopra
        expenseList.dispatchEvent(new CustomEvent('expenseSelected', { 
          detail: { id: expense.id } 
        }));
      });

      // === DOPPIO CLICK sulla descrizione → la modifica ===
      const descriptionSpan = expenseItem.querySelector('.expense-description');
      descriptionSpan.style.cursor = 'text';
      descriptionSpan.title = 'Doppio click per modificare';

      descriptionSpan.addEventListener('dblclick', (e) => {
        // ... tutto il codice di modifica inline (funzionante, non lo tocco)
      });

      // === Evidenzia la riga selezionata (classe .selected) ===
      if (expense.id === selectedExpenseId) {
        expenseItem.classList.add('selected');
      }

      // Aggiunge la riga al <ul>
      expenseList.appendChild(expenseItem);
    });
  }
};

// === NAVIGAZIONE CON FRECCE SU/GIÙ (funziona già) ===
document.addEventListener('keydown', (e) => {
  // Ignora se sto scrivendo da qualche parte
  if (document.activeElement?.isContentEditable || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    return;
  }

  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    navigateWithArrows(e.key);  // ← funzione qui sotto
  }
});

// Questa funzione fa esattamente quello che vogliamo anche per il click!
function navigateWithArrows(key) {
  const currentIdx = window.expensesList.findIndex(e => e.id === window.selectedExpenseId);
  let newIdx = currentIdx;

  if (key === 'ArrowUp' && currentIdx > 0) newIdx--;
  if (key === 'ArrowDown' && currentIdx < window.expensesList.length - 1) newIdx++;

  if (newIdx !== currentIdx) {
    const newExpense = window.expensesList[newIdx];
    window.selectedExpenseId = newExpense.id;

    // ← Fa esattamente quello che vogliamo: aggiorna tutto!
    window.expenseManager.updateExpenseDisplay(window.expensesList, newExpense.id);
    window.categoriesManager.updateCategoryButtons(newExpense.id, window.expensesList, window.categoriesList);

    // Scroll dolce alla riga
    const item = document.querySelector(`li[data-expense-id="${newExpense.id}"]`);
    if (item) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Esporta l'oggetto così lo possono usare gli altri file
window.expenseManager = expenseManager;
console.log('expenseManager inizializzato con LOG completi');