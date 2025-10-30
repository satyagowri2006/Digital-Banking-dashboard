import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accounts: [],
  currentAccount: null,
  isLoading: false,
  error: null,
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccounts: (state, action) => {
      state.accounts = action.payload;
    },
    setCurrentAccount: (state, action) => {
      state.currentAccount = action.payload;
    },
    addAccount: (state, action) => {
      state.accounts.push(action.payload);
    },
    updateAccount: (state, action) => {
      const index = state.accounts.findIndex((acc) => acc._id === action.payload._id);
      if (index !== -1) {
        state.accounts[index] = action.payload;
      }
    },
    deleteAccount: (state, action) => {
      state.accounts = state.accounts.filter((acc) => acc._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAccounts,
  setCurrentAccount,
  addAccount,
  updateAccount,
  deleteAccount,
  setLoading,
  setError,
} = accountSlice.actions;

export default accountSlice.reducer;
