import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk for uploading CSV
export const uploadTransactions = createAsyncThunk(
  "transactions/upload",
  async (file, { rejectWithValue }) => {
    try {
      console.log("uploadTransactions: Starting upload for file:", file.name);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:8081/api/transactions/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("uploadTransactions: Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      // Backend returns plain text, not JSON
      const text = await response.text();
      console.log("uploadTransactions: Response text:", text);

      return [];
    } catch (error) {
      console.error("uploadTransactions: Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Transactions Slice
const transactionsSlice = createSlice({
  name: "transactions",
  initialState: {
    data: [],
    isLoading: false,
    error: null,
    searchTerm: "",
    filterType: "all",
    selectedCategories: [],
  },
  reducers: {
    setTransactions: (state, action) => {
      console.log(
        "transactionsSlice: setTransactions called with",
        action.payload.length,
        "transactions"
      );
      state.data = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
    toggleCategory: (state, action) => {
      const category = action.payload;
      const index = state.selectedCategories.indexOf(category);
      if (index > -1) {
        state.selectedCategories.splice(index, 1);
      } else {
        state.selectedCategories.push(category);
      }
    },
    clearCategoryFilters: (state) => {
      state.selectedCategories = [];
    },
    clearTransactions: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadTransactions.pending, (state) => {
        console.log("transactionsSlice: uploadTransactions.pending");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadTransactions.fulfilled, (state) => {
        console.log("transactionsSlice: uploadTransactions.fulfilled");
        state.isLoading = false;
        state.error = null;
      })
      .addCase(uploadTransactions.rejected, (state, action) => {
        console.log(
          "transactionsSlice: uploadTransactions.rejected",
          action.payload
        );
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const {
  setTransactions,
  setSearchTerm,
  setFilterType,
  toggleCategory,
  clearCategoryFilters,
  clearTransactions,
} = transactionsSlice.actions;

// Selectors
export const selectTransactions = (state) => state.transactions.data;
export const selectIsLoading = (state) => state.transactions.isLoading;
export const selectError = (state) => state.transactions.error;
export const selectSearchTerm = (state) => state.transactions.searchTerm;
export const selectFilterType = (state) => state.transactions.filterType;
export const selectSelectedCategories = (state) =>
  state.transactions.selectedCategories;

// Get unique categories from transactions
export const selectAllCategories = (state) => {
  const transactions = selectTransactions(state);
  const categories = [
    ...new Set(transactions.map((txn) => txn.category).filter(Boolean)),
  ];
  return categories.sort();
};

export const selectFilteredTransactions = (state) => {
  const transactions = selectTransactions(state);
  const searchTerm = selectSearchTerm(state);
  const filterType = selectFilterType(state);
  const selectedCategories = selectSelectedCategories(state);

  return transactions.filter((txn) => {
    // Search filter
    const matchesSearch =
      txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.merchant?.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter (credit/debit)
    const matchesType =
      filterType === "all" ||
      (filterType === "credit" && txn.txn_type === "CREDIT") ||
      (filterType === "debit" && txn.txn_type === "DEBIT");

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(txn.category);

    return matchesSearch && matchesType && matchesCategory;
  });
};

export const selectTotalIncome = (state) => {
  return selectTransactions(state)
    .filter((t) => t.txn_type === "CREDIT")
    .reduce((sum, t) => sum + t.amount, 0);
};

export const selectTotalExpense = (state) => {
  return selectTransactions(state)
    .filter((t) => t.txn_type === "DEBIT")
    .reduce((sum, t) => sum + t.amount, 0);
};

export default transactionsSlice.reducer;
