const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'expense_tracker'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
});

// Routes

// Add new transaction
app.post('/api/transactions', (req, res) => {
  const data = req.body;
  const sql = 'INSERT INTO transactions SET ?';
  db.query(sql, data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Transaction added', id: result.insertId });
  });
});

// Get all transactions for a user
app.get('/api/transactions/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const sql = 'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC';
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get transaction summary for a user
app.get('/api/transactions/summary/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const sql = `
    SELECT 
      SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) AS total_expense,
      SUM(CASE WHEN type = 'Income' THEN amount ELSE -amount END) AS balance
    FROM transactions
    WHERE user_id = ?
  `;
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// Update a transaction
app.put('/api/transactions/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const sql = 'UPDATE transactions SET ? WHERE id = ?';
  db.query(sql, [data, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Transaction updated' });
  });
});

// Delete a transaction
app.delete('/api/transactions/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM transactions WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Transaction deleted' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
