const express = require('express');
// const mysql = require('mysql2');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const cors = require('cors');
const allowedOrigins = [
    'http://localhost:3000', // for local frontend testing
    'https://user-management-three-zeta.vercel.app', // your Vercel frontend URL
    'https://user-management-git-main-orifhon74s-projects.vercel.app', // optional if you're using this URL
];

const app = express();
app.use(bodyParser.json());
// app.use(cors());
app.use(cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies
}));


// Set up MySQL connection
// Create a connection
// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

module.exports = db;

// // Connect to the database
// db.connect((err) => {
//     if (err) {
//         console.error('Database connection error:', err);
//         process.exit(1); // Exit the process if connection fails
//     } else {
//         console.log('Connected to the MySQL database');
//     }
// });

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Registration
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, email, password, last_login, status) 
            VALUES (?, ?, ?, NOW(), "active")
        `;

        db.query(query, [name, email, hashedPassword], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                console.error(err);
                return res.status(500).json({ error: 'Server error' });
            }

            const token = jwt.sign({ userId: results.insertId }, JWT_SECRET, { expiresIn: '1h' });
            res.status(201).json({ token, userId: results.insertId });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (user.status === 'blocked') {
            return res.status(403).json({ error: 'Your account is blocked.' });
        }

        // Update last_login to the current time
        await db.promise().query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/users', authenticateToken, (req, res) => {
    const query = `
        SELECT id, name, email, last_login, status
        FROM users
        ORDER BY last_login DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(results);
    });
});

app.post('/api/users/action', authenticateToken, (req, res) => {
    const { action, userIds } = req.body;

    if (!action || !userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    let query;
    switch (action) {
        case 'block':
            query = 'UPDATE users SET status = "blocked" WHERE id IN (?)';
            break;
        case 'unblock':
            query = 'UPDATE users SET status = "active" WHERE id IN (?)';
            break;
        case 'delete':
            query = 'DELETE FROM users WHERE id IN (?)';
            break;
        default:
            return res.status(400).json({ error: 'Invalid action' });
    }

    db.query(query, [userIds], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error' });
        }

        res.json({
            message: `${results.affectedRows} ${
                results.affectedRows === 1 ? 'user' : 'users'
            } successfully ${action === 'delete' ? 'deleted' : `${action}ed`}.`,
        });
    });
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});