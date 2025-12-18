import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload } from "lucide-react";
import {
  uploadTransactions,
  selectIsLoading,
} from "../features/transactions/transactionsSlice";
import { fetchInsights } from "../features/transactions/insightsSlice";

const UploadCsv = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      handleUpload(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (file) => {
    try {
      console.log("=== UPLOAD STARTED ===");
      console.log("File:", file.name);

      // First upload the file
      console.log("Step 1: Uploading file...");
      const uploadResult = await dispatch(uploadTransactions(file)).unwrap();
      console.log("Step 1 Complete - Upload result:", uploadResult);

      setUploadSuccess(true);

      // Wait for backend to process, then fetch insights
      console.log("Step 2: Waiting 1 second for backend processing...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(
        "Step 3: Fetching insights from http://localhost:8000/insights"
      );
      const insightsResult = await dispatch(fetchInsights()).unwrap();
      console.log("Step 3 Complete - Insights result:", insightsResult);
      console.log(
        "Transactions in insights:",
        insightsResult.transactions?.length
      );

      console.log("=== UPLOAD COMPLETE ===");
    } catch (error) {
      console.error("=== UPLOAD FAILED ===");
      console.error("Error:", error);
      setUploadSuccess(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div
        className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
          isDragging
            ? "border-red-500 bg-red-50"
            : "border-yellow-400 bg-white hover:bg-yellow-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center">
            <Upload className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            Upload Your Bank Statement
          </h3>
          <p className="text-gray-600 max-w-md">
            Drag and drop your CSV file here, or click to browse
          </p>
          {file && (
            <div className="bg-yellow-100 border border-yellow-400 rounded-lg px-4 py-2">
              <p className="text-sm font-medium text-gray-800">
                Selected: {file.name}
              </p>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">Uploading and processing...</span>
            </div>
          )}
          {uploadSuccess && !isLoading && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <span className="font-medium">
                ✓ Upload successful! Loading insights...
              </span>
            </div>
          )}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              disabled={isLoading}
            />
            <div
              className={`bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-red-600 hover:to-red-700"
              }`}
            >
              {isLoading ? "Uploading..." : "Select CSV File"}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default UploadCsv;
