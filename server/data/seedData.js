// Demo seed data for MongoDB
const users = [
  { name: 'Admin User', email: 'admin@bank.com', password: 'Admin123', role: 'admin' },
  { name: 'User One', email: 'user@bank.com', password: 'User123', role: 'user' },
];

const accounts = [
  { accountNumber: '100000001', accountType: 'savings', balance: 25000, currency: 'INR' },
  { accountNumber: '100000002', accountType: 'current', balance: 90000, currency: 'INR' },
];

// Add additional demo data for transactions, budgets, goals as needed

module.exports = { users, accounts };
