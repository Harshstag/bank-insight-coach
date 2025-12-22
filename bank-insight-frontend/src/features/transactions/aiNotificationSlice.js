import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk for fetching AI notifications
export const fetchAINotifications = createAsyncThunk(
  "aiNotifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/insights/last5NlpNotifications"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch AI notifications");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const aiNotificationsSlice = createSlice({
  name: "aiNotifications",
  initialState: {
    notifications: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAINotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAINotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.error = null;
      })
      .addCase(fetchAINotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNotifications } = aiNotificationsSlice.actions;

export const selectAINotifications = (state) =>
  state.aiNotifications.notifications;
export const selectAINotificationsLoading = (state) =>
  state.aiNotifications.isLoading;
export const selectAINotificationsError = (state) =>
  state.aiNotifications.error;

export default aiNotificationsSlice.reducer;
