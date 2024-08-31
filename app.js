const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();


const PORT = 3000;

const SECRET_KEY = 'mySecretKey'; // Ensure this matches your actual secret key


// Configuration de la connexion à la base de données
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'Gestion_Contact'
});
//Middleware
app.use(express.json());

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});


// Route pour créer un nouvel utilisateur avec mot de passe haché
app.post('/register', (req, res) => {
  const { nom,email, mot_de_pass} = req.body;
  // Hachage du mot de passe avant l'enregistrement
  bcrypt.hash(mot_de_pass, 10, (err, hashedPassword) => {
  if (err) return res.status(500).json({ message: 'Error hashing password' });
  // Insertion de l'utilisateur avec le mot de passe haché
  const sql = 'INSERT INTO utilisateur (nom,email, mot_de_pass) VALUES (?, ?,?)';
  db.query(sql, [nom,email, hashedPassword], (err, result) => {
  if (err) {
  return res.status(500).json({ message: 'Error registering user' });
  }
  res.status(201).json({ message: 'User registered successfully' });
  });
  });
  });

// Route de connexion qui génère un JWT
app.post('/login', (req, res) => {
  const { email,mot_de_pass} = req.body;
  const sql = 'SELECT * FROM utilisateur WHERE email = ?';
  db.query(sql, [email], (err, results) => {
  if (err) {
  return res.status(500).json({ message: 'Error logging in' });
  }
  if (results.length > 0) {
  const utilisateur = results[0];
  // Comparaison du mot de passe en clair avec le hash stocké
  bcrypt.compare(mot_de_pass, utilisateur.mot_de_pass, (err, match) => {
  if (err) return res.status(500).json({ message: 'Error comparing passwords' });
  if (match) {
  const token = jwt.sign({ userId: utilisateur.id }, SECRET_KEY, { expiresIn: '24h' });
  res.json({ token: `Bearer ${token}` });
  } else {
  res.status(401).json({ message: 'Invalid credentials' });
  }
  });
  } else {
  res.status(401).json({ message: 'Invalid credentials' });
  }
  });
  });

// Middleware pour vérifier le JWT

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];
  if (token) {
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
  if (err) {
  return res.status(403).json({ message: 'Forbidden' });
  }
  req.user = decoded;
  next();
  });
  } else {
  res.status(401).json({ message: 'Unauthorized' });
  }
  };
  
app.delete('/users/:id', authenticateJWT, (req, res) => {
  const query = 'DELETE  FROM utilisateur WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error deleting user' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

//update
app.put('/users/:id', authenticateJWT, (req, res) => {
  const { nom, email } = req.body;
  const query = 'UPDATE User SET username = ?, email = ? WHERE id = ?';
  db.query(query, [nom, email, req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error updating user' });
    }
    res.json({ message: 'User updated successfully' });
  });
});


// Route protégée pour récupérer les informations de l'utilisateur
app.get('/user', authenticateJWT, (req, res) => {
  const sql = 'SELECT id, nom,email,mot_de_pass FROM utilisateur WHERE id = ?';
  db.query(sql, [req.user.userId], (err, results) => {
  if (err) {
  return res.status(500).json({ message: 'Error fetching user data' });
  }
  if (results.length > 0) {
  res.json(results[0]);
  } else {
  res.status(404).json({ message: 'User not found' });
  }
  });
  });

// Contact routes
app.get('/contacts',authenticateJWT, (req, res) => {
  const query = 'SELECT * FROM Contact WHERE user_id = ?';
  db.query(query, [req.user.userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching contacts' });
    }
    res.json(results);
  });
});

// get avec id
app.get('/contacts/:id', authenticateJWT,(req, res) => {
  const query = 'SELECT * FROM Contact WHERE id = ? AND user_id = ?';
  db.query(query, [req.params.id, req.user.userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching contact' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(results[0]);
  });
});

//post insert
app.post('/contacts',authenticateJWT, (req, res) => {
  const { nom, prenom, email, telephone } = req.body;
  const query = 'INSERT INTO Contact (user_id, nom, prenom, email, telephone ) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [req.user.userId, nom, prenom, email, telephone ], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error creating contact' });
    }
    res.status(201).json({ message: 'Contact created successfully', id: result.insertId });
  });
});

//update
app.put('/contacts/:id',authenticateJWT,(req, res) => {
  const { nom, prenom, email, telephone } = req.body;
  const query = 'UPDATE Contact SET nom = ?, prenom = ?, email = ?, telephone = ? WHERE id = ? AND user_id = ?';
  db.query(query, [nom, prenom, email, telephone , req.params.id, req.user.userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error updating contact' });
    }
    res.json({ message: 'Contact updated successfully' });
  });
});

//delete

app.delete('/contacts/:id', authenticateJWT,(req, res) => {
  const query = 'DELETE FROM Contact WHERE id = ? AND user_id = ?';
  db.query(query, [req.params.id, req.user.userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error deleting contact' });
    }
    res.json({ message: 'Contact deleted successfully' });
  });
});

// Note routes
//select
app.get('/contacts/:contactId/notes',authenticateJWT,(req, res) => {
  const query = 'SELECT * FROM Note WHERE contact_id = ?';
  db.query(query, [req.params.contactId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching notes' });
    }
    res.json(results);
  });
});

//insert
app.post('/contacts/:contactId/notes', authenticateJWT,(req, res) => {
  const { contenu } = req.body;
  const query = 'INSERT INTO Note (contact_id, contenu) VALUES (?, ?)';
  db.query(query, [req.params.contactId, contenu], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error creating note' });
    }
    res.status(201).json({ message: 'Note created successfully', id: result.insertId });
  });
});

//update
app.put('/notes/:id',authenticateJWT, (req, res) => {
  const { contenu } = req.body;
  const query = 'UPDATE Note SET contenu = ? WHERE id = ?';
  db.query(query, [contenu, req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error updating note' });
    }
    res.json({ message: 'Note updated successfully' });
  });
});

//delete
app.delete('/notes/:id', authenticateJWT, (req, res) => {
  const query = 'DELETE FROM Note WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error deleting note' });
    }
    res.json({ message: 'Note deleted successfully' });
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
