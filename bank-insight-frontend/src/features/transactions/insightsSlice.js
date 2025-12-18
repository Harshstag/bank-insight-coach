import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk for fetching insights
export const fetchInsights = createAsyncThunk(
  "insights/fetch",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log(
        "fetchInsights: Making request to http://localhost:8081/api/transactions/insights"
      );

      const response = await fetch(
        "http://localhost:8081/api/transactions/insights"
      );

      console.log("fetchInsights: Response status:", response.status);
      console.log("fetchInsights: Response ok:", response.ok);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch insights - Status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("fetchInsights: Data received:", data);
      console.log(
        "fetchInsights: Transactions count:",
        data.transactions?.length
      );

      // Import and dispatch setTransactions action
      const { setTransactions } = await import("./transactionsSlice");
      if (data.transactions && data.transactions.length > 0) {
        console.log(
          "fetchInsights: Dispatching setTransactions with",
          data.transactions.length,
          "transactions"
        );
        dispatch(setTransactions(data.transactions));
      } else {
        console.warn("fetchInsights: No transactions in response");
      }

      return data;
    } catch (error) {
      console.error("fetchInsights: Error occurred:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Insights Slice
const insightsSlice = createSlice({
  name: "insights",
  initialState: {
    data: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearInsights: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInsights.pending, (state) => {
        console.log("insightsSlice: fetchInsights.pending");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        console.log("insightsSlice: fetchInsights.fulfilled", action.payload);
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        console.log("insightsSlice: fetchInsights.rejected", action.payload);
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInsights } = insightsSlice.actions;

export const selectInsights = (state) => state.insights.data;
export const selectInsightsLoading = (state) => state.insights.isLoading;
export const selectInsightsError = (state) => state.insights.error;

export default insightsSlice.reducer;
