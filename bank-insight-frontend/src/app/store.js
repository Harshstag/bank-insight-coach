import { configureStore } from "@reduxjs/toolkit";
import transactionsReducer from "../features/transactions/transactionsSlice";
import insightsReducer from "../features/transactions/insightsSlice";
import aiNotificationsReducer from "../features/transactions/aiNotificationSlice";

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    insights: insightsReducer,
    aiNotifications: aiNotificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
