const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  hypertension:   { type: Number, min: 0, max: 100 },
  dyslipidemia:   { type: Number, min: 0, max: 100 },
  fattyLiver:     { type: Number, min: 0, max: 100 },
  ecgAbnormal:    { type: Number, min: 0, max: 100 },
  kidneyDisease:  { type: Number, min: 0, max: 100 },
  liverDisease:   { type: Number, min: 0, max: 100 }
});

const volunteerSchema = new mongoose.Schema({
  groupNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  participantCount: {
    type: Number,
    default: 100
  },
  ageRangeMin: { type: Number },
  ageRangeMax: { type: Number },
  preIntervention: { type: healthDataSchema },
  postIntervention: { type: healthDataSchema },
  notes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
