import { createSlice } from '@reduxjs/toolkit';

const goalSlice = createSlice({
  name: 'goal',
  initialState: {
    goals: [],
    loading: false,
    error: null,
  },
  reducers: {
    setGoals: (state, action) => {
      state.goals = action.payload;
      state.loading = false;
    },
    addGoal: (state, action) => {
      state.goals.unshift(action.payload);
    },
    updateGoal: (state, action) => {
      const index = state.goals.findIndex(g => g._id === action.payload._id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },
    // Add this new action for compatibility
    updateGoalState: (state, action) => {
      const index = state.goals.findIndex(g => g._id === action.payload._id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },
    deleteGoal: (state, action) => {
      state.goals = state.goals.filter(g => g._id !== action.payload);
    },
    // Add this new action for compatibility
    removeGoal: (state, action) => {
      state.goals = state.goals.filter(g => g._id !== action.payload);
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
  setGoals, 
  addGoal, 
  updateGoal, 
  updateGoalState,  // Export this
  deleteGoal, 
  removeGoal,       // Export this
  setLoading, 
  setError 
} = goalSlice.actions;

export default goalSlice.reducer;
