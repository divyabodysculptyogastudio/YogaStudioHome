const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage (for demo purposes)
const users = [];
const classes = [
  {
    id: '1',
    name: 'Morning Yoga',
    instructor: 'Sarah Johnson',
    date: '2024-02-20',
    startTime: '07:00',
    endTime: '08:00',
    capacity: 15,
    registeredUsers: [],
    category: 'yoga',
    difficulty: 'beginner'
  },
  {
    id: '2',
    name: 'HIIT Training',
    instructor: 'Mike Chen',
    date: '2024-02-20',
    startTime: '18:00',
    endTime: '19:00',
    capacity: 20,
    registeredUsers: [],
    category: 'cardio',
    difficulty: 'intermediate'
  }
];

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied' });
    }
    const decoded = jwt.verify(token, 'secret-key');
    req.user = users.find(u => u.id === decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
    registeredClasses: []
  };
  
  users.push(user);
  const token = jwt.sign({ userId: user.id }, 'secret-key');
  
  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, 'secret-key');
  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// Get classes
app.get('/api/classes', (req, res) => {
  res.json({ classes });
});

// Register for class
app.post('/api/classes/:classId/register', auth, (req, res) => {
  const classId = req.params.classId;
  const gymClass = classes.find(c => c.id === classId);
  
  if (!gymClass) {
    return res.status(404).json({ message: 'Class not found' });
  }

  if (gymClass.registeredUsers.includes(req.user.id)) {
    return res.status(400).json({ message: 'Already registered' });
  }

  if (gymClass.registeredUsers.length >= gymClass.capacity) {
    return res.status(400).json({ message: 'Class is full' });
  }

  gymClass.registeredUsers.push(req.user.id);
  req.user.registeredClasses.push(classId);
  
  res.json({ message: 'Successfully registered for class' });
});

// Get user's classes
app.get('/api/classes/my-classes', auth, (req, res) => {
  const userClasses = classes.filter(c => c.registeredUsers.includes(req.user.id));
  res.json({ classes: userClasses });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Gym Fitness App running on http://localhost:${PORT}`);
  console.log('📱 Ready to accept user registrations and class bookings!');
});