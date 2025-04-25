import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css"; // Make sure this import exists

const API = "http://localhost:5000/api";
const categories = ["Food", "Rent", "Salary", "Entertainment", "Other"];

function App() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    type: "Income",
    amount: "",
    category: "",
    description: "",
    user_id: 1,
  });
  const [filters, setFilters] = useState({ type: "", category: "" });
  const [editId, setEditId] = useState(null);

  const fetchTransactions = async () => {
    const res = await axios.get(`${API}/transactions/1`);
    setTransactions(res.data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`${API}/transactions/${editId}`, form);
      setEditId(null);
    } else {
      await axios.post(`${API}/transactions`, form);
    }
    setForm({ type: "Income", amount: "", category: "", description: "", user_id: 1 });
    fetchTransactions();
  };

  const handleEdit = (tx) => {
    setForm(tx);
    setEditId(tx.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this transaction?")) {
      await axios.delete(`${API}/transactions/${id}`);
      fetchTransactions();
    }
  };

  const filtered = transactions.filter((tx) => {
    return (
      (!filters.type || tx.type === filters.type) &&
      (!filters.category || tx.category === filters.category)
    );
  });

  return (
    <div className="container">
      <h1>Expense Tracker</h1>

      <form className="form" onSubmit={handleSubmit}>
        <h2>{editId ? "Edit" : "Add"} Transaction</h2>

        <div className="form-group">
          <label>
            <input type="radio" name="type" value="Income" checked={form.type === "Income"} onChange={handleChange} />
            Income
          </label>
          <label>
            <input type="radio" name="type" value="Expense" checked={form.type === "Expense"} onChange={handleChange} />
            Expense
          </label>
        </div>

        <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required />
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

        <button type="submit" className="btn-primary">
          {editId ? "Update" : "Add"} Transaction
        </button>
      </form>

      <div className="filters">
        <select onChange={(e) => setFilters({ ...filters, type: e.target.value })} value={filters.type}>
          <option value="">Filter by Type</option>
          <option>Income</option>
          <option>Expense</option>
        </select>
        <select onChange={(e) => setFilters({ ...filters, category: e.target.value })} value={filters.category}>
          <option value="">Filter by Category</option>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <table className="transactions-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Description</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="6">No transactions found.</td>
            </tr>
          ) : (
            filtered.map((tx) => (
              <tr key={tx.id}>
                <td className={tx.type.toLowerCase()}>{tx.type}</td>
                <td>₹{tx.amount}</td>
                <td>{tx.category}</td>
                <td>{tx.description}</td>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(tx)}><i className="fas fa-edit"></i></button>
                  <button className="btn-delete" onClick={() => handleDelete(tx.id)}><i className="fas fa-trash-alt"></i> </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
