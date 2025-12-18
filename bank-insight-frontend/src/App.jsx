import React, { useState } from "react";
import { useSelector } from "react-redux";
import UploadCsv from "./components/UploadCsv";
import TransactionsTable from "./components/TransactionsTable";
import InsightsDashboard from "./components/InsightsDashboard";
import {
  selectTransactions,
  selectError,
} from "./features/transactions/transactionsSlice";
import {
  selectInsights,
  selectInsightsError,
} from "./features/transactions/insightsSlice";

function App() {
  const transactions = useSelector(selectTransactions);
  const insights = useSelector(selectInsights);
  const transactionError = useSelector(selectError);
  const insightsError = useSelector(selectInsightsError);
  const [activeTab, setActiveTab] = useState("transactions");

  // Show content only if we have insights data
  const hasData =
    insights !== null &&
    insights.transactions &&
    insights.transactions.length > 0;

  // Combine errors
  const error = transactionError || insightsError;

  // Log state for debugging
  console.log("=== APP STATE ===");
  console.log("Transactions:", transactions);
  console.log("Insights:", insights);
  console.log("Has Data:", hasData);
  console.log("Error:", error);
  console.log("================");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
      <div className="py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 via-yellow-600 to-red-600 bg-clip-text text-transparent mb-4">
            Bank Insight Coach
          </h1>
          <p className="text-gray-600 text-xl">
            Analyze your spending patterns and take control of your finances
          </p>
        </div>

        {/* Upload Section - Always visible */}
        <UploadCsv />

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mt-6 p-4 bg-red-100 border-2 border-red-400 rounded-xl text-red-700 shadow-lg">
            <p className="font-bold">⚠️ Error: {error}</p>
          </div>
        )}

        {/* Tabs Navigation - Only show when we have data */}
        {hasData ? (
          <div className="max-w-6xl mx-auto mt-12 px-6">
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`
                  px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform
                  ${
                    activeTab === "transactions"
                      ? "bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-xl scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:scale-102"
                  }
                `}
              >
                📊 Transactions ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTab("insights")}
                className={`
                  px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform
                  ${
                    activeTab === "insights"
                      ? "bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-xl scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:scale-102"
                  }
                `}
              >
                💡 Insights
              </button>
            </div>

            {/* Tab Content with Animation */}
            <div key={activeTab} className="animate-fadeIn">
              {activeTab === "transactions" && <TransactionsTable />}
              {activeTab === "insights" && <InsightsDashboard />}
            </div>
          </div>
        ) : (
          /* Empty State - Show when no data */
          <div className="max-w-4xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-2xl p-12 shadow-lg border-2 border-yellow-300">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Data Yet
              </h3>
              <p className="text-gray-600">
                Upload your bank statement CSV to start analyzing your financial
                insights
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .hover:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

export default App;
