const express = require('express');
const Class = require('../models/Class');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all classes
router.get('/', async (req, res) => {
  try {
    const { category, date } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    if (date) filter.date = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000) };

    const classes = await Class.find(filter).populate('registeredUsers', 'name email');
    res.json({ classes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for a class
router.post('/:classId/register', auth, async (req, res) => {
  try {
    const classId = req.params.classId;
    const userId = req.user._id;

    const gymClass = await Class.findById(classId);
    if (!gymClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (gymClass.registeredUsers.includes(userId)) {
      return res.status(400).json({ message: 'Already registered for this class' });
    }

    if (gymClass.registeredUsers.length >= gymClass.capacity) {
      return res.status(400).json({ message: 'Class is full' });
    }

    gymClass.registeredUsers.push(userId);
    await gymClass.save();

    await User.findByIdAndUpdate(userId, { $push: { registeredClasses: classId } });

    res.json({ message: 'Successfully registered for class', class: gymClass });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unregister from a class
router.delete('/:classId/unregister', auth, async (req, res) => {
  try {
    const classId = req.params.classId;
    const userId = req.user._id;

    const gymClass = await Class.findById(classId);
    if (!gymClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    gymClass.registeredUsers = gymClass.registeredUsers.filter(id => !id.equals(userId));
    await gymClass.save();

    await User.findByIdAndUpdate(userId, { $pull: { registeredClasses: classId } });

    res.json({ message: 'Successfully unregistered from class' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's registered classes
router.get('/my-classes', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('registeredClasses');
    res.json({ classes: user.registeredClasses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;