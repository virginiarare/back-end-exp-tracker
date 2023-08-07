const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { Transaction, Categories } = require('../models/model');

require('dotenv').config();

const testDbUri = process.env.TEST_DB_URI;

beforeAll(async () => {
  try {
    // Connect to the test database directly
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

afterAll(async () => {
  await mongoose.disconnect();
  console.log('Disconnected from the test database!');
});

describe('Create Transaction Test', () => {
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
    const fetchedTransaction = await Transaction.findById(response.body._id);

    // Assert the fetched transaction
    expect(fetchedTransaction).not.toBeNull();
    expect(fetchedTransaction.name).toBe(newTransaction.name);
    expect(fetchedTransaction.type).toBe(newTransaction.type);
    expect(fetchedTransaction.amount).toBe(newTransaction.amount);

  });
});

//Get transaction test
describe('Get Transaction Test', () => {
  beforeEach(async () => {
    // Clear the test database collections before each test
    await Transaction.deleteMany({});
  });

  it('should get all transactions from the database', async () => {
    const transactions = [
      {
        name: 'Transaction 1',
        type: 'Expense',
        amount: 100.0,
      },
      {
        name: 'Transaction 2',
        type: 'Income',
        amount: 200.0,
      },
    ];

    await Transaction.insertMany(transactions);

    // Make a GET request to the /transaction endpoint
    const response = await request(app).get('/transaction');

    // Assert the HTTP status code
    expect(response.status).toBe(200);

    // Assert the response body
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    // Assert the content of the transactions
    expect(response.body[0].name).toBe(transactions[0].name);
    expect(response.body[0].type).toBe(transactions[0].type);
    expect(response.body[0].amount).toBe(transactions[0].amount);

    expect(response.body[1].name).toBe(transactions[1].name);
    expect(response.body[1].type).toBe(transactions[1].type);
    expect(response.body[1].amount).toBe(transactions[1].amount);
  });
});

//Delete transaction test 
describe('Delete Transaction Tests', () => {
  beforeEach(async () => {
    // Clear the test database collections before each test
    await Transaction.deleteMany({});
  });

  it('should delete a transaction from the database', async () => {
    // Create a test transaction in the database
    const transaction = {
      name: 'Transaction to be deleted',
      type: 'Expense',
      amount: 150.0,
    };

    const createdTransaction = await Transaction.create(transaction);

    // Make a DELETE request to the /transaction endpoint with the transaction ID to be deleted
    const response = await request(app).delete(`/transaction`).send({
      _id: createdTransaction._id,
    });

    // Assert the HTTP status code
    expect(response.status).toBe(200);

    // Assert the response body
    expect(response.body).toBe('Record Deleted...!');

    // Check if the transaction is deleted from the database
    const deletedTransaction = await Transaction.findById(createdTransaction._id);
    expect(deletedTransaction).toBeNull();
  });

  it('should return an error when trying to delete a non-existing transaction', async () => {
    // Make a DELETE request to the /transaction endpoint with a non-existing transaction ID
    const response = await request(app).delete(`/transaction`).send({
      _id: 'non-existing-id',
    });

    // Assert the HTTP status code
    expect(response.status).toBe(500);

    // Assert the response body
  expect(response.body.message).toEqual('Error while deleting Transaction Record');
});

});

//Get labels test 
// Test data for categories
const testCategories = [
  {
    type: 'Income',
    color: '#00A4CCFF',
  },
  {
    type: 'Savings',
    color: '#FF3EA5FF',
  },
  {
    type: 'Expense',
    color: '#EDFF00FF',
  },
];

describe('Get Labels Tests', () => {
  beforeAll(async () => {
    // Connect to the test database
    const testDbUri = process.env.TEST_DB_URI;
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Clear the test database collections before each test
    await Transaction.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });

  it('should get labels with category color from the database', async () => {
    // Create some test transactions in the database
    const transactions = [
      {
        name: 'Transaction 1',
        type: 'Income',
        amount: 100.0,
      },
      {
        name: 'Transaction 2',
        type: 'Savings',
        amount: 200.0,
      },
    ];

    await Transaction.insertMany(transactions);

    // Make a GET request to the /labels endpoint
    const response = await request(app).get('/labels');

    // Assert the HTTP status code
    expect(response.status).toBe(200);

    // Assert the response body
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    // Assert the content of the labels
    expect(response.body[0]._id).toBeTruthy();
    expect(response.body[0].name).toBe(transactions[0].name);
    expect(response.body[0].type).toBe(transactions[0].type);
    expect(response.body[0].amount).toBe(transactions[0].amount);

    expect(response.body[1]._id).toBeTruthy();
    expect(response.body[1].name).toBe(transactions[1].name);
    expect(response.body[1].type).toBe(transactions[1].type);
    expect(response.body[1].amount).toBe(transactions[1].amount);
  });
});