import { createSlice } from '@reduxjs/toolkit';

const loanSlice = createSlice({
  name: 'loan',
  initialState: {
    loans: [],
    loading: false,
    error: null,
  },
  reducers: {
    setLoans: (state, action) => {
      state.loans = action.payload;
      state.loading = false;
      state.error = null;
    },
    addLoan: (state, action) => {
      state.loans.unshift(action.payload);
    },
    updateLoan: (state, action) => {
      const index = state.loans.findIndex(l => l._id === action.payload._id);
      if (index !== -1) {
        state.loans[index] = action.payload;
      }
    },
    updateLoanState: (state, action) => {
      const index = state.loans.findIndex(l => l._id === action.payload._id);
      if (index !== -1) {
        state.loans[index] = action.payload;
      }
    },
    deleteLoan: (state, action) => {
      state.loans = state.loans.filter(l => l._id !== action.payload);
    },
    removeLoan: (state, action) => {
      state.loans = state.loans.filter(l => l._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { 
  setLoans, 
  addLoan, 
  updateLoan, 
  updateLoanState,
  deleteLoan, 
  removeLoan,
  setLoading, 
  setError 
} = loanSlice.actions;

export default loanSlice.reducer;
