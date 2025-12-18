import { configureStore } from "@reduxjs/toolkit";
import transactionsReducer from "../features/transactions/transactionsSlice";
import insightsReducer from "../features/transactions/insightsSlice";

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    insights: insightsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
