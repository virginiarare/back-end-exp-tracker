const mongoose = require('mongoose');
require('dotenv').config();

// Test database URI from the environment variable
const testDbUri = process.env.TEST_DB_URI;

const testConn = async () => {
  try {
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to the test database!');
  } catch (error) {
    console.error('Test Connection Error:', error);
    process.exit(1);
  }
};

module.exports = testConn;

