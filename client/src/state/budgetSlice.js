import { createSlice } from '@reduxjs/toolkit';

const budgetSlice = createSlice({
  name: 'budget',
  initialState: { budgets: [] },
  reducers: {
    setBudgets: (state, action) => { state.budgets = action.payload; },
    addBudget: (state, action) => { state.budgets.unshift(action.payload); },
  },
});

export const { setBudgets, addBudget } = budgetSlice.actions;
export default budgetSlice.reducer;
