const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); 
const Transaction = require('../models/model');


// Load environment variables from .env file
require('dotenv').config();

// Test database URI from the environment variable
const testDbUri = process.env.TEST_DB_URI;

// Connect to the test database before running the tests
beforeAll(async () => {
  try {
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to the test database!');
  } catch (error) {
    console.error('Error connecting to the test database:', error);
    process.exit(1); // Exit the test suite if the connection fails
  }
});

// Disconnect from the test database after running the tests
afterAll(async () => {
  await mongoose.disconnect();
  console.log('Disconnected from the test database!');
});

describe('Transaction API Tests', () => {
  beforeEach(async () => {
    // Clear the test database collections before each test
    await Transaction.deleteMany({});
  });

  it('should create a new transaction and return the saved transaction', async () => {
    const newTransaction = {
      name: 'Test Transaction',
      type: 'Expense',
      amount: 50.0,
    };

    const response = await request(app)
      .post('/transaction')
      .send(newTransaction);

    // Assert the HTTP status code
    expect(response.status).toBe(200);

    // Assert the response body
    expect(response.body).toHaveProperty('name', newTransaction.name);
    expect(response.body).toHaveProperty('type', newTransaction.type);
    expect(response.body).toHaveProperty('amount', newTransaction.amount);
    

    // Fetch the created transaction from the database
    const fetchedTransaction = await TransactionModel.findById(response.body._id);

    // Assert the fetched transaction
    expect(fetchedTransaction).not.toBeNull();
    expect(fetchedTransaction.name).toBe(newTransaction.name);
    expect(fetchedTransaction.type).toBe(newTransaction.type);
    expect(fetchedTransaction.amount).toBe(newTransaction.amount);

    // You may add more specific assertions here if needed
  });
});

