// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'db.json');

app.use(express.json()); // parse JSON bodies
app.use(express.static(path.join(__dirname, 'public'))); // serve frontend

// ensure db file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function writeDB(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// --- RESTful CRUD endpoints for "users" ---

// GET /api/users  -> list all users
app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

// GET /api/users/:id -> get single user
app.get('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/users -> create new user
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  const db = readDB();
  const nextId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser = { id: nextId, name, email };
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

// PUT /api/users/:id -> update user
app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  const db = readDB();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  db.users[idx] = { id, name, email };
  writeDB(db);
  res.json(db.users[idx]);
});

// DELETE /api/users/:id -> delete user
app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  db.users.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Deleted' });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});