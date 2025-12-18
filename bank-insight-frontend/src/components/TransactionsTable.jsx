import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { TrendingUp, DollarSign, Calendar, Search, Store } from "lucide-react";
import {
  selectFilteredTransactions,
  selectSearchTerm,
  selectTotalIncome,
  selectTotalExpense,
  setSearchTerm,
} from "../features/transactions/transactionsSlice";
import ToggleFilter from "./ToggleFilter";
import CategoryFilter from "./CategoryFilter";

const TransactionsTable = () => {
  const dispatch = useDispatch();
  const transactions = useSelector(selectFilteredTransactions);
  const searchTerm = useSelector(selectSearchTerm);
  const totalIncome = useSelector(selectTotalIncome);
  const totalExpense = useSelector(selectTotalExpense);

  const categoryColors = {
    Food: "bg-orange-100 text-orange-800 border-orange-300",
    Shopping: "bg-pink-100 text-pink-800 border-pink-300",
    Travel: "bg-blue-100 text-blue-800 border-blue-300",
    Entertainment: "bg-purple-100 text-purple-800 border-purple-300",
    Utilities: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Healthcare: "bg-red-100 text-red-800 border-red-300",
    Education: "bg-indigo-100 text-indigo-800 border-indigo-300",
    Salary: "bg-green-100 text-green-800 border-green-300",
    default: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const getCategoryStyle = (category) => {
    return categoryColors[category] || categoryColors.default;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-yellow-400">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-yellow-500 p-4 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
            Transaction Insights
          </h2>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-yellow-50">
          <div className="bg-white rounded-xl p-4 sm:p-5 border-l-4 border-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Total Income
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
                  ₹{totalIncome.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 border-l-4 border-red-500 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Total Expenses
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">
                  ₹{totalExpense.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-red-100 p-2 sm:p-3 rounded-full">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 border-l-4 border-yellow-500 shadow-lg hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Net Balance
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">
                  ₹{(totalIncome - totalExpense).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 space-y-3 sm:space-y-4">
          {/* Search and Toggle */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 sm:left-4 top-3 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
              />
            </div>
            <ToggleFilter />
          </div>

          {/* Category Filter */}
          <CategoryFilter />
        </div>

        {/* Desktop Table View - Hidden on Mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  Merchant
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((txn, idx) => (
                <tr key={idx} className="hover:bg-yellow-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(txn.txn_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {txn.merchant}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getCategoryStyle(
                        txn.category
                      )}`}
                    >
                      {txn.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span
                      className={`font-bold text-lg ${
                        txn.txn_type === "CREDIT"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {txn.txn_type === "CREDIT" ? "+" : "-"}₹
                      {Math.abs(txn.amount).toLocaleString("en-IN")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - Visible only on Mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {transactions.map((txn, idx) => (
            <div
              key={idx}
              className="p-4 hover:bg-yellow-50 transition-colors active:bg-yellow-100"
            >
              {/* Transaction Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4 text-gray-400" />
                    <h3 className="font-bold text-gray-800 text-base">
                      {txn.merchant}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(txn.txn_date)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-bold text-xl ${
                      txn.txn_type === "CREDIT"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {txn.txn_type === "CREDIT" ? "+" : "-"}₹
                    {Math.abs(txn.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Transaction Footer */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryStyle(
                    txn.category
                  )}`}
                >
                  {txn.category}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    txn.txn_type === "CREDIT"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {txn.txn_type}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {transactions.length === 0 && (
          <div className="p-8 sm:p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-4">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <p className="text-lg sm:text-xl text-gray-500 font-medium">
              No transactions found
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Try adjusting your filters or search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsTable;
