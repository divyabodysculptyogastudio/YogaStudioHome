const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  instructor: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  capacity: { type: Number, required: true, default: 20 },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  category: { type: String, enum: ['cardio', 'strength', 'yoga', 'pilates', 'crossfit'], required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }
}, { timestamps: true });

classSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.registeredUsers.length;
});

module.exports = mongoose.model('Class', classSchema);