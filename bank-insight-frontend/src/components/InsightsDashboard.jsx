import React from "react";
import { useSelector } from "react-redux";
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
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Award,
  Calendar,
  CreditCard,
  Target,
  PiggyBank,
  Percent,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  Zap,
  ShoppingCart,
  Users,
  BarChart3,
  Crown,
} from "lucide-react";
import {
  selectInsights,
  selectInsightsLoading,
} from "../features/transactions/insightsSlice";

const InsightsDashboard = () => {
  const insights = useSelector(selectInsights);
  const isLoading = useSelector(selectInsightsLoading);

  if (!insights && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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

  // Prepare data for charts
  const categoryData = Object.entries(insights.insights.category_totals).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const merchantData = Object.entries(insights.insights.top_merchants)
    .map(([name, value]) => ({ name, value }))
    .slice(0, 5);

  const weeklySpendData = Object.entries(
    insights.insights.weekly_spend || {}
  ).map(([week, amount]) => ({
    week: week.split("/")[1],
    amount,
  }));

  const dailyCategoryData = Object.entries(
    insights.insights.daily_category_breakdown || {}
  ).map(([date, categories]) => ({
    date,
    ...categories,
  }));

  const pieChartData = [
    {
      name: "Debit",
      value: insights.insights.transaction_type_distribution.debit_percentage,
    },
    {
      name: "Credit",
      value: insights.insights.transaction_type_distribution.credit_percentage,
    },
  ];

  // Format date from timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 rounded-3xl p-6 md:p-10 text-white shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-10 h-10" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Financial Insights
            </h2>
          </div>
          <p className="text-white/90 text-lg">
            {insights.insights.date_range.start_date} to{" "}
            {insights.insights.date_range.end_date}
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <ArrowUpCircle className="w-10 h-10 opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              Income
            </span>
          </div>
          <p className="text-4xl font-bold mb-1">
            ₹{insights.insights.total_income.toLocaleString()}
          </p>
          <p className="text-green-100 text-sm">
            {insights.insights.total_income_transactions} transactions
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <ArrowDownCircle className="w-10 h-10 opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              Expenses
            </span>
          </div>
          <p className="text-4xl font-bold mb-1">
            ₹{insights.insights.monthly_spend.toLocaleString()}
          </p>
          <p className="text-red-100 text-sm">
            {insights.insights.total_expense_transactions} transactions
          </p>
        </div>

        {/* Savings */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <PiggyBank className="w-10 h-10 opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              Saved
            </span>
          </div>
          <p className="text-4xl font-bold mb-1">
            ₹{insights.insights.total_savings.toLocaleString()}
          </p>
          <p className="text-blue-100 text-sm">
            {insights.insights.savings_rate.toFixed(2)}% savings rate
          </p>
        </div>

        {/* Avg Transaction */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <Activity className="w-10 h-10 opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              Average
            </span>
          </div>
          <p className="text-4xl font-bold mb-1">
            ₹{insights.insights.avg_transaction_value.toFixed(0)}
          </p>
          <p className="text-purple-100 text-sm">
            {insights.insights.total_transactions} total transactions
          </p>
        </div>
      </div>

      {/* Daily Averages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-xl">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Daily Average Spending
              </p>
              <p className="text-3xl font-bold text-gray-800">
                ₹{insights.insights.daily_avg_spend.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              style={{ width: "65%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Daily Average Income
              </p>
              <p className="text-3xl font-bold text-gray-800">
                ₹{insights.insights.daily_avg_income.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              style={{ width: "85%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Category Details Cards */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-7 h-7 text-red-600" />
          Category Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(insights.insights.category_totals).map(
            ([category, amount], index) => (
              <div
                key={category}
                className="bg-white rounded-xl p-5 shadow-lg border-l-4 hover:scale-105 transition-transform cursor-pointer"
                style={{ borderColor: COLORS[index % COLORS.length] }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">
                    {category}
                  </p>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${COLORS[index % COLORS.length]}20`,
                    }}
                  >
                    <ShoppingBag
                      className="w-5 h-5"
                      style={{ color: COLORS[index % COLORS.length] }}
                    />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800 mb-2">
                  ₹{amount.toLocaleString()}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {((amount / insights.insights.monthly_spend) * 100).toFixed(
                      1
                    )}
                    % of expenses
                  </span>
                </div>
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${
                        (amount / insights.insights.monthly_spend) * 100
                      }%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  ></div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-7 h-7 text-red-600" />
            <h3 className="text-xl font-bold text-gray-800">
              Spending by Category
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Merchants */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-7 h-7 text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-800">Top Merchants</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={merchantData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Crown className="w-8 h-8 text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-800">
              Top Spending Category
            </h3>
          </div>
          <p className="text-4xl font-bold text-orange-600 mb-2">
            {insights.insights.highest_spending_category}
          </p>
          <p className="text-gray-600">
            Your biggest expense category this period
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl p-6 border-2 border-pink-300 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingCart className="w-8 h-8 text-pink-600" />
            <h3 className="text-xl font-bold text-gray-800">Top Merchant</h3>
          </div>
          <p className="text-4xl font-bold text-red-600 mb-2">
            {insights.insights.highest_spending_merchant}
          </p>
          <p className="text-gray-600">Where you spent the most</p>
        </div>
      </div>

      {/* Min/Max Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-300 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <ArrowDownCircle className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-bold text-gray-800">
              Minimum Transaction
            </h3>
          </div>
          <p className="text-4xl font-bold text-green-600">
            ₹{insights.insights.min_transaction_amount}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-300 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <ArrowUpCircle className="w-8 h-8 text-red-600" />
            <h3 className="text-lg font-bold text-gray-800">
              Maximum Transaction
            </h3>
          </div>
          <p className="text-4xl font-bold text-red-600">
            ₹{insights.insights.max_transaction_amount}
          </p>
        </div>
      </div>

      {/* Daily Category Breakdown */}
      {dailyCategoryData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-7 h-7 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">
              Daily Spending Breakdown
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyCategoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(insights.insights.category_totals).map(
                (category, index) => (
                  <Area
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                  />
                )
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction Type Distribution */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-7 h-7 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-800">
            Transaction Distribution
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border-2 border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="font-semibold text-gray-700">Debit</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {insights.insights.transaction_type_distribution.debit_percentage.toFixed(
                  1
                )}
                %
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-gray-700">Credit</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {insights.insights.transaction_type_distribution.credit_percentage.toFixed(
                  1
                )}
                %
              </span>
            </div>
            <div className="p-4 bg-gray-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">
                Expense to Income Ratio
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {insights.insights.expense_to_income_ratio.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;
