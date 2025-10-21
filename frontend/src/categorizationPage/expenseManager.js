const expenseManager = {
  updateExpenseDisplay(expensesList, selectedExpenseId) {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';

    expensesList.forEach((expense, index) => {
      const li = document.createElement('li');
      li.className = `expense-item ${expense.amount < 0 ? 'expense-negative' : 'expense-positive'} ${expense.id === selectedExpenseId ? 'selected' : ''}`;
      li.onclick = () => this.selectExpense(expense, index);
      li.dataset.id = expense.id;

      const dateSpan = document.createElement('span');
      dateSpan.className = 'expense-date';
      dateSpan.textContent = expense.date;
      li.appendChild(dateSpan);

      const descSpan = document.createElement('span');
      descSpan.className = 'expense-description';
      descSpan.textContent = expense.description;
      li.appendChild(descSpan);

      const amountSpan = document.createElement('span');
      amountSpan.className = 'expense-amount';
      amountSpan.textContent = `${expense.amount}`;
      li.appendChild(amountSpan);

      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category-tags';
      if (expense.category1) {
        const btn = document.createElement('button');
        btn.textContent = expense.category1;
        btn.className = 'expense-category-button level-1';
        btn.onclick = (e) => { e.stopPropagation(); this.removeCategory(expense, 1); };
        categoryDiv.appendChild(btn);
      }
      if (expense.category2) {
        const btn = document.createElement('button');
        btn.textContent = expense.category2;
        btn.className = 'expense-category-button level-2';
        btn.onclick = (e) => { e.stopPropagation(); this.removeCategory(expense, 2); };
        categoryDiv.appendChild(btn);
      }
      if (expense.category3) {
        const btn = document.createElement('button');
        btn.textContent = expense.category3;
        btn.className = 'expense-category-button level-3';
        btn.onclick = (e) => { e.stopPropagation(); this.removeCategory(expense, 3); };
        categoryDiv.appendChild(btn);
      }
      li.appendChild(categoryDiv);

      expenseList.appendChild(li);
    });

    if (expensesList.length === 0) {
      expenseList.innerHTML = '<p class="no-data">No expenses found</p>';
    }
  },

  selectExpense(expense, index) {
    if (!expense.category3) {
      const event = new CustomEvent('expenseSelected', { detail: { id: expense.id } });
      document.getElementById('expense-list').dispatchEvent(event);
      const lis = document.querySelectorAll('.expense-item');
      lis.forEach(li => li.classList.remove('selected'));
      lis[index].classList.add('selected');
    }
  },

  async removeCategory(expense, level) {
    const updatedExpense = { ...expense };
    if (level === 1) {
      updatedExpense.category1 = null;
      updatedExpense.category2 = null;
      updatedExpense.category3 = null;
    } else if (level === 2) {
      updatedExpense.category2 = null;
      updatedExpense.category3 = null;
    } else if (level === 3) {
      updatedExpense.category3 = null;
    }
    const result = await window.assignCategoryToExpense(updatedExpense, level, null);
    if (result.success) {
      const event = new CustomEvent('categoryUpdated');
      document.getElementById('category-buttons').dispatchEvent(event);
    } else {
      console.error('Error removing category:', result.message);
    }
  }
};

window.expenseManager = expenseManager;