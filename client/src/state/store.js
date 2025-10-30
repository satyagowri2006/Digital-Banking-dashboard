import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import accountReducer from './accountSlice';
import transactionReducer from './transactionSlice';
import budgetReducer from './budgetSlice';
import goalReducer from './goalSlice';
import loanReducer from './loanSlice';  // Add this import
import notificationReducer from './notificationSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    account: accountReducer,
    transaction: transactionReducer,
    budget: budgetReducer,
    goal: goalReducer,
    loan: loanReducer,  // Add this line
    notification: notificationReducer,
  },
});

export default store;
