import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tag, X } from "lucide-react";
import {
  selectAllCategories,
  selectSelectedCategories,
  toggleCategory,
  clearCategoryFilters,
} from "../features/transactions/transactionsSlice";

const CategoryFilter = () => {
  const dispatch = useDispatch();
  const allCategories = useSelector(selectAllCategories);
  const selectedCategories = useSelector(selectSelectedCategories);

  const categoryColors = {
    Food: "bg-orange-500",
    Shopping: "bg-pink-500",
    Travel: "bg-blue-500",
    Entertainment: "bg-purple-500",
    Utilities: "bg-yellow-500",
    Healthcare: "bg-red-500",
    Education: "bg-indigo-500",
    default: "bg-gray-500",
  };

  const getCategoryColor = (category) => {
    return categoryColors[category] || categoryColors.default;
  };

  if (allCategories.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-4 shadow-md border-2 border-yellow-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-yellow-600" />
          <h3 className="font-bold text-gray-800">Filter by Category</h3>
        </div>
        {selectedCategories.length > 0 && (
          <button
            onClick={() => dispatch(clearCategoryFilters())}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {allCategories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const colorClass = getCategoryColor(category);

          return (
            <button
              key={category}
              onClick={() => dispatch(toggleCategory(category))}
              className={`
                px-4 py-2 rounded-full font-medium transition-all duration-200 transform
                ${
                  isSelected
                    ? `${colorClass} text-white shadow-lg scale-105`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {category}
            </button>
          );
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="mt-3 text-sm text-gray-600">
          {selectedCategories.length} categor
          {selectedCategories.length === 1 ? "y" : "ies"} selected
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
