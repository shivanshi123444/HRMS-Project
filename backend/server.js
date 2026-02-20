const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const db = new sqlite3.Database('./hrms.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to hrms.db');
});

// Initialize Tables - Ensuring Email column exists
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        status TEXT,
        date TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
    )`);
});

// --- API ROUTES ---

// GET: All employees
app.get('/api/employees', (req, res) => {
    db.all("SELECT * FROM employees", [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

// POST: Add new employee
app.post('/api/employees', (req, res) => {
    const { name, email, role } = req.body;
    db.run(`INSERT INTO employees (name, email, role) VALUES (?, ?, ?)`, 
    [name, email, role], function(err) {
        if (err) res.status(400).json({ error: err.message });
        else res.json({ id: this.lastID, name, email, role });
    });
});

// POST: Mark Attendance (This fixes your 404 Error)
app.post('/api/attendance', (req, res) => {
    const { employee_id, status } = req.body;
    const date = new Date().toISOString().split('T')[0];
    db.run(`INSERT INTO attendance (employee_id, status, date) VALUES (?, ?, ?)`,
    [employee_id, status, date], function(err) {
        if (err) res.status(400).json({ error: err.message });
        else res.json({ message: "Attendance marked!", id: this.lastID });
    });
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));