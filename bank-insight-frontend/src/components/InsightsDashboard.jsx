import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Award,
  Calendar,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  Zap,
  ShoppingCart,
  Crown,
  ChevronDown,
  ChevronUp,
  Eye,
  Target,
  BarChart3,
  Percent,
} from "lucide-react";
import {
  fetchInsights,
  selectInsights,
  selectInsightsLoading,
} from "../features/transactions/insightsSlice";
import { setTransactions } from "../features/transactions/transactionsSlice";
import AINotificationsCarousel from "./AINotificationsCarousel";

const InsightsDashboard = () => {
  const dispatch = useDispatch();
  const insights = useSelector(selectInsights);
  const isLoading = useSelector(selectInsightsLoading);
  const [showDetailed, setShowDetailed] = useState(false);

  useEffect(() => {
    if (!insights) {
      dispatch(fetchInsights());
    }
  }, [dispatch, insights]);

  useEffect(() => {
    if (insights?.transactions) {
      dispatch(setTransactions(insights.transactions));
    }
  }, [insights, dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-500">No insights available yet.</p>
      </div>
    );
  }

  const COLORS = [
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  // Prepare data for charts - Top 5 only for primary view
  const topCategoriesData = Object.entries(insights.insights.top_categories)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const topMerchantsData = Object.entries(insights.insights.top_merchants)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const weeklySpendData = Object.entries(
    insights.insights.weekly_spend || {}
  ).map(([week, amount]) => ({
    week: week.split("/")[1],
    amount,
  }));

  // All categories for detailed view
  const allCategoriesData = Object.entries(
    insights.insights.category_totals
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const pieChartData = [
    {
      name: "Expenses",
      value: insights.insights.transaction_type_distribution.debit_percentage,
    },
    {
      name: "Income",
      value: insights.insights.transaction_type_distribution.credit_percentage,
    },
  ];

  const dailyCategoryData = Object.entries(
    insights.insights.daily_category_breakdown || {}
  )
    .slice(-7) // Last 7 days only
    .map(([date, categories]) => ({
      date: date.split("-").slice(1).join("/"),
      ...categories,
    }));

  return (
    <div className="w-full space-y-6">
      {/* AI NOTIFICATIONS CAROUSEL */}
      <AINotificationsCarousel />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-8 h-8" />
            <h2 className="text-2xl md:text-3xl font-bold">
              Financial Overview
            </h2>
          </div>
          <p className="text-white/90 text-sm md:text-base">
            {insights.insights.date_range.start_date} to{" "}
            {insights.insights.date_range.end_date}
          </p>
          <p className="text-white/80 text-xs md:text-sm mt-2">
            {insights.insights.total_transactions} transactions analyzed
          </p>
        </div>
      </div>

      {/* PRIMARY VIEW - Key Metrics */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-red-600" />
          Key Financial Metrics
        </h3>

        {/* 4 Main Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Income */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <ArrowUpCircle className="w-8 h-8 opacity-80" />
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                Income
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">
              ₹{insights.insights.total_income.toLocaleString("en-IN")}
            </p>
            <p className="text-green-100 text-xs">
              {insights.insights.total_income_transactions} credits
            </p>
          </div>

          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <ArrowDownCircle className="w-8 h-8 opacity-80" />
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                Expenses
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">
              ₹{insights.insights.monthly_spend.toLocaleString("en-IN")}
            </p>
            <p className="text-red-100 text-xs">
              {insights.insights.total_expense_transactions} debits
            </p>
          </div>

          {/* Savings */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <PiggyBank className="w-8 h-8 opacity-80" />
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                Saved
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">
              ₹{insights.insights.total_savings.toLocaleString("en-IN")}
            </p>
            <p className="text-blue-100 text-xs">
              {insights.insights.savings_rate.toFixed(1)}% rate
            </p>
          </div>

          {/* Avg Transaction */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 opacity-80" />
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                Average
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">
              ₹{insights.insights.avg_transaction_value.toFixed(0)}
            </p>
            <p className="text-purple-100 text-xs">per transaction</p>
          </div>
        </div>

        {/* Top Spending Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border-2 border-orange-300 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-7 h-7 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-800">Top Category</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600 mb-1">
              {insights.insights.highest_spending_category}
            </p>
            <p className="text-gray-600 text-sm">
              ₹
              {insights.insights.category_totals[
                insights.insights.highest_spending_category
              ]?.toLocaleString("en-IN")}{" "}
              spent
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 border-2 border-pink-300 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-7 h-7 text-pink-600" />
              <h3 className="text-lg font-bold text-gray-800">Top Merchant</h3>
            </div>
            <p className="text-3xl font-bold text-pink-600 mb-1">
              {insights.insights.highest_spending_merchant}
            </p>
            <p className="text-gray-600 text-sm">
              ₹
              {insights.insights.top_merchants[
                insights.insights.highest_spending_merchant
              ]?.toLocaleString("en-IN")}{" "}
              spent
            </p>
          </div>
        </div>

        {/* Primary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top 5 Categories */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-800">
                Top 5 Categories
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={topCategoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topCategoriesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top 5 Merchants */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-yellow-200">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-bold text-gray-800">
                Top 5 Merchants
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topMerchantsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  angle={-20}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Show More Button - Only when NOT showing detailed */}
      {!showDetailed && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowDetailed(true)}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <Eye className="w-5 h-5" />
            <span>See Detailed Insights</span>
            <ChevronDown className="w-5 h-5 group-hover:animate-bounce" />
          </button>
        </div>
      )}

      {/* DETAILED VIEW - Collapsible */}
      {showDetailed && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border-t-4 border-purple-500 pt-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-purple-600" />
              Detailed Analytics
            </h3>

            {/* ... (keep all detailed view content same) */}

            {/* Daily Averages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-orange-100 p-2 rounded-xl">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">
                      Daily Avg Spending
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      ₹{insights.insights.daily_avg_spend.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 p-2 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">
                      Daily Avg Income
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      ₹{insights.insights.daily_avg_income.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-purple-200 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Percent className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  Transaction Type Distribution
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col justify-center space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-semibold text-gray-700 text-sm">
                        Expenses
                      </span>
                    </div>
                    <span className="text-xl font-bold text-red-600">
                      {insights.insights.transaction_type_distribution.debit_percentage.toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-semibold text-gray-700 text-sm">
                        Income
                      </span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      {insights.insights.transaction_type_distribution.credit_percentage.toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">
                      Expense to Income Ratio
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {insights.insights.expense_to_income_ratio.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Spending Trend */}
            {weeklySpendData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-blue-200 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">
                    Weekly Spending Trend
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklySpendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* All Categories Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-red-600" />
                All Categories Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allCategoriesData.map((category, index) => (
                  <div
                    key={category.name}
                    className="bg-white rounded-xl p-4 shadow-md border-l-4 hover:scale-105 transition-transform"
                    style={{ borderColor: COLORS[index % COLORS.length] }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-xs font-bold uppercase">
                        {category.name}
                      </p>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `${COLORS[index % COLORS.length]}20`,
                        }}
                      >
                        <ShoppingBag
                          className="w-4 h-4"
                          style={{ color: COLORS[index % COLORS.length] }}
                        />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-1">
                      ₹{category.value.toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {(
                          (category.value / insights.insights.monthly_spend) *
                          100
                        ).toFixed(1)}
                        % of total
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${
                            (category.value / insights.insights.monthly_spend) *
                            100
                          }%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Min/Max Transactions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-300 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <ArrowDownCircle className="w-7 h-7 text-green-600" />
                  <h3 className="text-base font-bold text-gray-800">
                    Minimum Transaction
                  </h3>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  ₹{insights.insights.min_transaction_amount}
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-5 border-2 border-red-300 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <ArrowUpCircle className="w-7 h-7 text-red-600" />
                  <h3 className="text-base font-bold text-gray-800">
                    Maximum Transaction
                  </h3>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  ₹{insights.insights.max_transaction_amount}
                </p>
              </div>
            </div>
          </div>

          {/* Show Less Button - At the bottom of detailed view */}
          <div className="flex justify-center pt-6">
            <button
              onClick={() => {
                setShowDetailed(false);
                // Scroll to the button position smoothly
                window.scrollTo({
                  top:
                    document.querySelector("[data-insights-top]")?.offsetTop -
                    100,
                  behavior: "smooth",
                });
              }}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              <ChevronUp className="w-5 h-5 group-hover:animate-bounce" />
              <span>Show Less</span>
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsDashboard;
