import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  QrCode,
  ChevronUp,
  ChevronDown,
  Upload as UploadIcon,
} from "lucide-react";
import UploadCsv from "./components/UploadCsv";
import TransactionsTable from "./components/TransactionsTable";
import InsightsDashboard from "./components/InsightsDashboard";
import QRScanner from "./components/QRScanner";
import {
  selectTransactions,
  selectError,
} from "./features/transactions/transactionsSlice";
import { selectInsights } from "./features/transactions/insightsSlice";

function App() {
  const transactions = useSelector(selectTransactions);
  const insights = useSelector(selectInsights);
  const transactionError = useSelector(selectError);
  const [activeTab, setActiveTab] = useState("transactions");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const hasData =
    insights !== null &&
    insights.transactions &&
    insights.transactions.length > 0;
  const error = transactionError;

  // Handle scroll to show/hide content
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      setShowContent(position > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const handleViewInsights = () => {
    setActiveTab("insights");
    scrollToContent();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
      {/* QR Scanner Overlay */}
      {showQRScanner && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          onViewInsights={handleViewInsights}
        />
      )}

      {/* Hero Section - Full Screen */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-600 via-yellow-600 to-red-600 bg-clip-text text-transparent mb-6 animate-gradient">
            Bank Insight Coach
          </h1>
          <p className="text-gray-600 text-xl md:text-2xl mb-12">
            Scan, Pay & Analyze your finances intelligently
          </p>

          {/* QR Scan Button - Primary CTA */}
          <button
            onClick={() => setShowQRScanner(true)}
            className="group relative inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <QrCode className="w-8 h-8 relative z-10" />
            <span className="relative z-10">Scan QR to Pay</span>
          </button>

          {/* Secondary Action */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-500 text-sm">or</p>
            <button
              onClick={scrollToContent}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <UploadIcon className="w-5 h-5" />
              Upload CSV & View Insights
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="min-h-screen py-12 relative">
        {/* Back to Top Button */}
        {showContent && (
          <div className="fixed top-6 right-6 z-40">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="p-3 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Upload Your Statement
            </h2>
            <p className="text-gray-600">
              Get detailed insights from your transaction history
            </p>
          </div>
          <UploadCsv />
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto px-6 mb-8">
            <div className="bg-red-100 border-2 border-red-400 rounded-xl p-4 text-red-700">
              <p className="font-bold">⚠️ Error: {error}</p>
            </div>
          </div>
        )}

        {/* Tabs and Content */}
        {hasData && (
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 ${
                  activeTab === "transactions"
                    ? "bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-xl scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                }`}
              >
                📊 Transactions
              </button>
              <button
                onClick={() => setActiveTab("insights")}
                className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 ${
                  activeTab === "insights"
                    ? "bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-xl scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                }`}
              >
                💡 Insights
              </button>
            </div>

            <div key={activeTab} className="animate-fadeIn">
              {activeTab === "transactions" && <TransactionsTable />}
              {activeTab === "insights" && <InsightsDashboard />}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasData && !error && (
          <div className="max-w-4xl mx-auto text-center px-6">
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

      {/* Floating QR Button - Always Visible */}
      <button
        onClick={() => setShowQRScanner(true)}
        className="fixed bottom-8 right-8 p-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all z-40"
      >
        <QrCode className="w-8 h-8" />
      </button>

      {/* Custom Styles */}
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
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
export default App;
