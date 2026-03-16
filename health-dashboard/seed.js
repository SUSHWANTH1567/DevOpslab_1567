require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Volunteer = require('./models/Volunteer');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/health_dashboard';

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB!');

  // Clear existing data
  await User.deleteMany({});
  await Volunteer.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // CREATE USERS
  const users = await User.create([
    {
      username: 'admin',
      password: 'admin123',
      name: 'Dr. Admin',
      role: 'Administrator',
      email: 'admin@healthplatform.com'
    },
    {
      username: 'doctor',
      password: 'doc123',
      name: 'Dr. Smith',
      role: 'Doctor',
      email: 'drsmith@healthplatform.com'
    },
    {
      username: 'patient',
      password: 'pat123',
      name: 'John Patient',
      role: 'Patient',
      email: 'john@healthplatform.com'
    },
    {
      username: 'researcher',
      password: 'res123',
      name: 'Dr. Wang',
      role: 'Researcher',
      email: 'wang@healthplatform.com'
    }
  ]);
  console.log(`👤 Created ${users.length} users`);

  // CREATE VOLUNTEER GROUPS
  const volunteers = await Volunteer.create([
    {
      groupNumber: 1,
      participantCount: 100,
      ageRangeMin: 21, ageRangeMax: 30,
      preIntervention: {
        hypertension: 32, dyslipidemia: 34, fattyLiver: 32,
        ecgAbnormal: 12, kidneyDisease: 10, liverDisease: 35
      },
      postIntervention: {
        hypertension: 26, dyslipidemia: 30, fattyLiver: 25,
        ecgAbnormal: 9, kidneyDisease: 9, liverDisease: 30
      },
      notes: 'Youngest group, best response to interventions'
    },
    {
      groupNumber: 2,
      participantCount: 100,
      ageRangeMin: 31, ageRangeMax: 40,
      preIntervention: {
        hypertension: 34, dyslipidemia: 37, fattyLiver: 33,
        ecgAbnormal: 14, kidneyDisease: 12, liverDisease: 39
      },
      postIntervention: {
        hypertension: 27, dyslipidemia: 31, fattyLiver: 27,
        ecgAbnormal: 10, kidneyDisease: 10, liverDisease: 32
      },
      notes: 'Most common age for chronic disease onset'
    },
    {
      groupNumber: 3,
      participantCount: 100,
      ageRangeMin: 41, ageRangeMax: 50,
      preIntervention: {
        hypertension: 35, dyslipidemia: 40, fattyLiver: 34,
        ecgAbnormal: 15, kidneyDisease: 13, liverDisease: 41
      },
      postIntervention: {
        hypertension: 28, dyslipidemia: 33, fattyLiver: 29,
        ecgAbnormal: 11, kidneyDisease: 11, liverDisease: 34
      },
      notes: 'High prevalence of metabolic syndrome'
    },
    {
      groupNumber: 4,
      participantCount: 100,
      ageRangeMin: 51, ageRangeMax: 60,
      preIntervention: {
        hypertension: 36, dyslipidemia: 41, fattyLiver: 35,
        ecgAbnormal: 16, kidneyDisease: 15, liverDisease: 43
      },
      postIntervention: {
        hypertension: 28, dyslipidemia: 34, fattyLiver: 31,
        ecgAbnormal: 11, kidneyDisease: 12, liverDisease: 35
      },
      notes: 'Oldest group, highest baseline disease rates'
    }
  ]);
  console.log(`👥 Created ${volunteers.length} volunteer groups`);

  console.log('\n✅ Database seeded successfully!\n');
  console.log('─────────────────────────────────');
  console.log('🔐 Login Credentials:');
  console.log('   admin      / admin123');
  console.log('   doctor     / doc123');
  console.log('   patient    / pat123');
  console.log('   researcher / res123');
  console.log('─────────────────────────────────\n');

  await mongoose.connection.close();
  console.log('📦 MongoDB connection closed');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});