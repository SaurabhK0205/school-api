// File: server.js

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// to establish connection with database
const db = mysql.createConnection({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12785315', 
  password: 'M8LSWBd72M', 
  database: 'sql12785315'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Route: addSchool (to add a new school and data rergarding it)
// using POST method
app.post('/addSchool', (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  
  // valodating
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.execute(query, [name, address, latitude, longitude], (err, result) => {
    if (err) {
  console.error("❌ Insert Error:", err.message);
  return res.status(500).json({ error: err.message });
}
    res.status(201).json({ message: 'School added successfully' });
  });
});

// Route: listSchool (to fetch and list data of all schools from the database, 
// sorts them based on proximity to the user's location, and return the sorted list.)
// using GET method
app.get('/listSchools', (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLong = parseFloat(req.query.longitude);

  if (!userLat || !userLong) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  //to calculate and sort schools nearest to the user's provided longitude and latitude coordinates.
  const query = `
    SELECT *,
      6371 * 2 * ASIN(SQRT(
        POWER(SIN(RADIANS(latitude - ?) / 2), 2) +
        COS(RADIANS(?)) * COS(RADIANS(latitude)) *
        POWER(SIN(RADIANS(longitude - ?) / 2), 2)
      )) AS distance
    FROM schools
    ORDER BY distance ASC
  `;

  db.query(query, [userLat, userLat, userLong], (err, results) => {
    if (err) {
  console.error("❌ Failed to fetch schools", err.message);
  return res.status(500).json({ error: err.message });
}
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
