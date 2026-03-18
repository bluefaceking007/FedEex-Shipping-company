js
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock DB
const users = [];
const shipments = [
  {
    id: '1',
    trackingId: 'FX-INTL-784523961187',
    status: 'In Transit',
    path: [
      { lat: 40.7128, lng: -74.0060 },
      { lat: 50.1109, lng: 8.6821 },
      { lat: 47.3769, lng: 8.5417 }
    ],
    timeline: [
      { location: 'NYC', status: 'Picked up', time: 'Mar 11' },
      { location: 'Frankfurt', status: 'Transit hub', time: 'Mar 12' },
      { location: 'Zurich', status: 'Arrival', time: 'Mar 14' }
    ]
  }
];

// Auth Middleware
function authenticateToken(req, res, next){
  const token = req.headers['authorization']?.split(' ')[1];
  if(!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if(err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Auth Routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if(users.find(u => u.username === username)) return res.status(400).json({ message: 'User exists' });
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ id: Date.now().toString(), username, password: hashedPassword });
  res.json({ message: 'User registered' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if(!user) return res.status(400).json({ message: 'User not found' });
  if(await bcrypt.compare(password, user.password)){
    const accessToken = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET);
    res.json({ accessToken });
  } else {
    res.status(401).json({ message: 'Incorrect password' });
  }
});

// Shipments Routes
app.get('/api/shipments', authenticateToken, (req, res) => res.json(shipments));
app.get('/api/shipments/:id', authenticateToken, (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id);
  if(!shipment) return res.status(404).json({ message: 'Not found' });
  res.json(shipment);
});

// Live position simulation
app.get('/api/shipments/:id/live', authenticateToken, (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id);
  if(!shipment) return res.status(404).json({ message: 'Not found' });
  const pos = shipment.path[Math.floor(Math.random() * shipment.path.length)];
  res.json({ currentPosition: pos, status: shipment.status });
});

app.listen(process.env.PORT || 5000, () => console.log('Backend running'));
