const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const db = new sqlite3.Database('./food_app.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('✅ Connected to the SQLite database.');
});

// Create Tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    imageUrl TEXT
  )`, (err) => {
    if (err) console.error('Error creating menu_items table:', err.message);
    else console.log("✅ Table 'menu_items' is ready.");
  });

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    orderId INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    items TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    orderTimestamp TEXT NOT NULL
  )`, (err) => {
    if (err) console.error('Error creating orders table:', err.message);
    else console.log("✅ Table 'orders' is ready.");
  });
});

// ========= API Endpoints for Menu =========

// GET: Get all menu items
app.get('/api/menu', (req, res) => {
  const sql = "SELECT * FROM menu_items ORDER BY id";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows });
  });
});

// POST: Create a new menu item
app.post('/api/menu', (req, res) => {
  const { name, price, description, imageUrl } = req.body;
  const sql = `INSERT INTO menu_items (name, price, description, imageUrl) VALUES (?, ?, ?, ?)`;
  db.run(sql, [name, price, description, imageUrl], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// DELETE: Delete a menu item
app.delete('/api/menu/:id', (req, res) => {
  const sql = `DELETE FROM menu_items WHERE id = ?`;
  db.run(sql, [req.params.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Deleted successfully', changes: this.changes });
  });
});

// PUT: Update a menu item
app.put('/api/menu/:id', (req, res) => {
    const { name, price, description, imageUrl } = req.body;
    const sql = `UPDATE menu_items SET name = ?, price = ?, description = ?, imageUrl = ? WHERE id = ?`;
    db.run(sql, [name, price, description, imageUrl, req.params.id], function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ message: "Updated successfully", changes: this.changes });
    });
});


// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});