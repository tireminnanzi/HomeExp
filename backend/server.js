const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const express = require('express');



server.use(express.json());
server.use(middlewares);

// Ensure CORS for frontend requests
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Check for duplicate expenses and assign sequential ID
server.post('/expenses', (req, res) => {
  const { date, description, amount } = req.body;
  const expenses = router.db.get('expenses').value();
  const isDuplicate = expenses.some(
    expense => expense.date === date && 
               expense.description === description && 
               expense.amount === amount
  );
  if (isDuplicate) {
    console.log('Server: Duplicate expense detected', { date, description, amount });
    return res.status(400).json({ error: 'Duplicate expense detected' });
  }
  // Assign sequential ID
  const lastId = expenses.length > 0 ? Math.max(...expenses.map(e => parseInt(e.id || 0))) : 0;
  const newId = (lastId + 1).toString();
  const newExpense = { ...req.body, id: newId };
  router.db.get('expenses').push(newExpense).write();
  console.log('Server: Saved expense to db.json:', newExpense); // Detailed log
  res.status(201).json(newExpense); // Return expense with ID
});

// Delete all expenses
server.delete('/expenses', (req, res) => {
  router.db.set('expenses', []).write();
  console.log('Server: All expenses deleted');
  res.status(200).json({ message: 'All expenses deleted' });
});

// Check for duplicate categories and assign sequential ID
server.post('/categories', (req, res) => {
  const { name, parent } = req.body;
  const categories = router.db.get('categories').value();
  const exists = categories.some(cat => cat.name === name && cat.parent === parent);
  if (exists) {
    console.log('Server: Duplicate category detected', { name, parent });
    return res.status(400).json({ error: 'Category already exists' });
  }
  // Assign sequential ID
  const lastId = categories.length > 0 ? Math.max(...categories.map(c => parseInt(c.id || 0))) : 0;
  const newId = (lastId + 1).toString();
  const newCategory = { ...req.body, id: newId };
  router.db.get('categories').push(newCategory).write();
  console.log('Server: Saved category to db.json:', newCategory); // Detailed log
  res.status(201).json(newCategory); // Return category with ID
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server running on port 3000');
});