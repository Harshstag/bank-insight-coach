import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import {
  setFilterType,
  selectFilterType,
} from "../features/transactions/transactionsSlice";

const ToggleFilter = () => {
  const dispatch = useDispatch();
  const filterType = useSelector(selectFilterType);

  const filters = [
    { id: "all", label: "All", icon: Activity, color: "purple" },
    { id: "credit", label: "Income", icon: TrendingUp, color: "green" },
    { id: "debit", label: "Expenses", icon: TrendingDown, color: "red" },
  ];

  return (
    <div className="inline-flex bg-gray-100 rounded-xl p-1 shadow-inner">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = filterType === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => dispatch(setFilterType(filter.id))}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200
              ${
                isActive
                  ? `bg-${filter.color}-500 text-white shadow-lg scale-105`
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }
            `}
            style={
              isActive
                ? {
                    backgroundColor:
                      filter.color === "purple"
                        ? "#8b5cf6"
                        : filter.color === "green"
                        ? "#10b981"
                        : "#ef4444",
                    color: "white",
                  }
                : {}
            }
          >
            <Icon className="w-4 h-4" />
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ToggleFilter;
