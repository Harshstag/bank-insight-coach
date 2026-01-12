import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  Camera,
  X,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader,
  Bell,
  ArrowLeft,
  Shield,
  Scan,
  Edit3,
  FileText,
  TrendingUp,
} from "lucide-react";
import { fetchInsights } from "../features/transactions/insightsSlice";
import jsQR from "jsqr";
import { fetchAINotifications } from "../features/transactions/aiNotificationSlice";

const QRScanner = ({ onClose, onViewInsights }) => {
  const dispatch = useDispatch();
  const [scanning, setScanning] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [editableAmount, setEditableAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [qrImagePreview, setQrImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Parse UPI QR Code Data
  const parseUPIData = (qrText) => {
    try {
      // UPI format: upi://pay?pa=merchant@bank&pn=MerchantName&am=amount&cu=INR&tn=purpose
      const url = new URL(qrText);

      if (!url.protocol.includes("upi")) {
        throw new Error("Not a valid UPI QR code");
      }

      const params = new URLSearchParams(url.search);

      const paymentInfo = {
        merchant: params.get("pn") || "Unknown Merchant",
        upiId: params.get("pa") || "",
        amount: parseFloat(params.get("am")) || 0,
        purpose: params.get("tn") || "Payment",
      };

      // Validate required fields
      if (!paymentInfo.upiId) {
        throw new Error("Invalid UPI ID in QR code");
      }

      return paymentInfo;
    } catch (err) {
      console.error("Error parsing UPI data:", err);
      throw new Error(
        "Could not parse QR code data. Please ensure it's a valid UPI QR code."
      );
    }
  };

  // Read QR Code from Image
  const readQRFromImage = (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas and draw image
          const canvas = canvasRef.current || document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Decode QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            resolve(code.data);
          } else {
            reject(new Error("No QR code found in image"));
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target.result;
        setQrImagePreview(e.target.result);
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(imageFile);
    });
  };

  // Handle Manual QR Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }

    setScanning(true);
    setError(null);

    try {
      // Read QR code from image
      const qrData = await readQRFromImage(file);
      console.log("QR Code Data:", qrData);

      // Parse UPI data
      const paymentInfo = parseUPIData(qrData);
      console.log("Parsed Payment Info:", paymentInfo);

      setPaymentData(paymentInfo);
      setEditableAmount(
        paymentInfo.amount > 0 ? paymentInfo.amount.toString() : ""
      );
      setNotes(paymentInfo.purpose || "");
      setScanning(false);
    } catch (err) {
      console.error("QR Reading Error:", err);
      setError(err.message);
      setScanning(false);
      setQrImagePreview(null);
    }
  };

  // Simulate Camera Scan (for demo purposes - in production, use actual camera)
  const handleCameraScan = () => {
    setScanning(true);
    setError(null);

    // Simulate scanning delay
    setTimeout(() => {
      // Mock UPI QR data
      const mockQRText =
        "upi://pay?pa=zomato@icici&pn=Zomato&am=320&cu=INR&tn=Food Order";

      try {
        const paymentInfo = parseUPIData(mockQRText);
        setPaymentData(paymentInfo);
        setEditableAmount(
          paymentInfo.amount > 0 ? paymentInfo.amount.toString() : ""
        );
        setNotes(paymentInfo.purpose || "");
        setScanning(false);
      } catch (err) {
        setError(err.message);
        setScanning(false);
      }
    }, 2000);
  };

  // Process payment
  const handlePayment = async () => {
    if (!paymentData) return;

    // Validate amount
    const finalAmount = parseFloat(editableAmount);
    if (!finalAmount || finalAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Validate notes
    if (!notes.trim()) {
      setError("Please add a note for this transaction");
      return;
    }

    setProcessing(true);
    setError(null);

    // Prepare payment data with edited values
    const finalPaymentData = {
      ...paymentData,
      amount: finalAmount,
      purpose: notes.trim(),
    };

    try {
      const response = await fetch("http://localhost:8081/api/payments/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPaymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment failed");
      }

      const result = await response.json();
      console.log("Payment successful:", result);

      setTransactionResult(result);
      setSuccess(true);
      setProcessing(false);

      // Show AI notification after 1 second and keep it for longer
      setTimeout(() => {
        if (result.aiNotification) {
          setNotification(result.aiNotification);
          setShowNotification(true);
        }
      }, 1000);

      // Refresh insights after payment
      setTimeout(() => {
        dispatch(fetchInsights());
        dispatch(fetchAINotifications());
      }, 2000);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    setPaymentData(null);
    setSuccess(false);
    setError(null);
    setQrImagePreview(null);
    setEditableAmount("");
    setNotes("");
    setTransactionResult(null);
  };

  const handleViewInsights = () => {
    if (onViewInsights) {
      onViewInsights();
    }
    onClose();
  };

  const handleNotificationClick = () => {
    setShowNotification(false);
    handleViewInsights();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
      {/* Hidden canvas for QR processing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/30 backdrop-blur-md">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-lg font-semibold">Scan & Pay</h1>
          <div className="w-10"></div>
        </div>
      </div>
      {/* Main Content */}
      <div className="h-full flex flex-col items-center justify-center p-6 pt-20 pb-24 overflow-y-auto">
        {/* QR Scanner Frame */}
        {!paymentData && !success && (
          <div className="relative w-full max-w-sm">
            {/* Scanner Animation */}
            <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border-2 border-purple-400/50">
              <div className="aspect-square bg-black/50 rounded-2xl relative overflow-hidden">
                {/* QR Preview if uploaded */}
                {qrImagePreview && (
                  <img
                    src={qrImagePreview}
                    alt="QR Code"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                )}

                {/* Corner Brackets */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>

                {/* Scanning Line Animation */}
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan"></div>
                  </div>
                )}

                {/* Camera Icon */}
                {!scanning && !qrImagePreview && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scan className="w-16 h-16 text-white/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-500/20 border-2 border-red-400 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-300" />
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-white text-lg mb-6">
                {scanning
                  ? "Reading QR Code..."
                  : "Scan or upload QR code to pay"}
              </p>

              {!scanning && (
                <div className="space-y-3">
                  {/* Camera Scan Button */}
                  <button
                    onClick={handleCameraScan}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    <Camera className="w-6 h-6" />
                    Start Camera Scan
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/20"></div>
                    <span className="text-white/60 text-sm">or</span>
                    <div className="flex-1 h-px bg-white/20"></div>
                  </div>

                  {/* Upload QR Button */}
                  <button
                    onClick={triggerFileInput}
                    className="w-full px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-purple-400/50 text-white font-bold rounded-full hover:bg-white/20 hover:border-purple-400 transition-all flex items-center justify-center gap-3"
                  >
                    <ImageIcon className="w-6 h-6" />
                    Upload QR Image
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Confirmation with Editable Fields */}
        {paymentData && !success && !processing && (
          <div className="w-full max-w-md animate-slideUp">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
                <Shield className="w-12 h-12 mx-auto mb-2" />
                <h2 className="text-2xl font-bold">Confirm Payment</h2>
              </div>

              {/* Payment Details */}
              <div className="p-6 space-y-6">
                {/* Merchant Info */}
                <div className="text-center py-2">
                  <p className="text-gray-600 text-sm mb-2">Paying to</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {paymentData.merchant}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {paymentData.upiId}
                  </p>
                </div>

                {/* Editable Amount */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Edit3 className="w-4 h-4" />
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={editableAmount}
                      onChange={(e) => setEditableAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-4 text-3xl font-bold text-blue-600 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Notes/Description */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="w-4 h-4" />
                    Add Note
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What's this payment for?"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                    rows="3"
                  />
                  <p className="text-xs text-gray-500">
                    This note will be saved with your transaction
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Transaction Time */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Transaction Time</span>
                  <span className="font-semibold text-gray-800">
                    {new Date().toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={!editableAmount || !notes.trim()}
                    className={`flex-1 py-4 font-bold rounded-xl transition-all ${
                      !editableAmount || !notes.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing */}
        {processing && (
          <div className="w-full max-w-md animate-slideUp">
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
              <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Processing Payment
              </h3>
              <p className="text-gray-600">Please wait...</p>
            </div>
          </div>
        )}

        {/* Success - Stays Visible */}
        {success && transactionResult && (
          <div className="w-full max-w-md space-y-4">
            {/* Success Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Success Header */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Payment Successful!
                </h2>
                <p className="text-green-100 text-lg">
                  ₹{editableAmount} paid to {paymentData?.merchant}
                </p>
                <p className="text-green-200 text-sm mt-2">{notes}</p>
              </div>

              {/* Transaction Details */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Transaction ID</span>
                  <span className="text-gray-800 font-mono text-sm">
                    {transactionResult.transactionId?.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Status</span>
                  <span className="text-green-600 font-semibold">
                    {transactionResult.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Date</span>
                  <span className="text-gray-800 font-medium">
                    {transactionResult.transaction?.txnDate}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 text-sm">Balance</span>
                  <span className="text-gray-800 font-bold text-lg">
                    ₹
                    {transactionResult.transaction?.balance?.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* View Insights Button */}
            <button
              onClick={handleViewInsights}
              className="w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              <TrendingUp className="w-6 h-6" />
              View Updated Insights
            </button>
          </div>
        )}
      </div>
      // ... (keep all existing code, just update the notification display part)
      {/* AI Notification - Reduced Height */}
      {showNotification && notification && (
        <div
          onClick={handleNotificationClick}
          className="fixed top-20 left-4 right-4 z-50 animate-slideDown max-w-lg mx-auto cursor-pointer"
        >
          <div
            className={`bg-white rounded-xl shadow-2xl border-2 overflow-hidden ${
              notification.severity === "WARNING"
                ? "border-orange-400"
                : notification.severity === "ALERT"
                ? "border-red-400"
                : "border-blue-400"
            }`}
          >
            <div
              className={`p-3 flex items-start gap-3 ${
                notification.severity === "WARNING"
                  ? "bg-orange-50"
                  : notification.severity === "ALERT"
                  ? "bg-red-50"
                  : "bg-blue-50"
              }`}
            >
              <div
                className={`p-2 rounded-full flex-shrink-0 ${
                  notification.severity === "WARNING"
                    ? "bg-orange-100"
                    : notification.severity === "ALERT"
                    ? "bg-red-100"
                    : "bg-blue-100"
                }`}
              >
                <Bell
                  className={`w-5 h-5 ${
                    notification.severity === "WARNING"
                      ? "text-orange-600"
                      : notification.severity === "ALERT"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-800 text-sm">
                    {notification.title}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      notification.confidence === "HIGH"
                        ? "bg-green-100 text-green-700"
                        : notification.confidence === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {notification.confidence}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-snug line-clamp-2 mb-1">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded ${
                      notification.mode === "RULE_BASED"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {notification.mode}
                  </span>
                  <span className="text-gray-500">Tap to view →</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotification(false);
                }}
                className="p-1 hover:bg-gray-200 rounded-full transition-all flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Animations */}
      <style jsx>{`
        @keyframes scan {
          0%,
          100% {
            transform: translateY(-100%);
          }
          50% {
            transform: translateY(100%);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
