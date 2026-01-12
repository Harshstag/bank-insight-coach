import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Info,
  Shield,
  X,
  Maximize2,
} from "lucide-react";
import {
  fetchAINotifications,
  selectAINotifications,
  selectAINotificationsLoading,
} from "../features/transactions/aiNotificationSlice";

const AINotificationsCarousel = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectAINotifications);
  const isLoading = useSelector(selectAINotificationsLoading);
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    dispatch(fetchAINotifications());
  }, [dispatch]);

  // Mouse drag scroll handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = "grab";
      }
    }
  };

  const handleCardClick = (notification) => {
    if (!isDragging) {
      setSelectedNotification(notification);
    }
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  // Get color scheme based on severity and confidence
  const getNotificationStyle = (severity, confidence) => {
    const styles = {
      WARNING: {
        HIGH: {
          bg: "from-red-500 to-orange-600",
          border: "border-red-300",
          icon: AlertTriangle,
          badgeBg: "bg-red-100",
          badgeText: "text-red-700",
        },
        MEDIUM: {
          bg: "from-orange-500 to-yellow-600",
          border: "border-orange-300",
          icon: AlertTriangle,
          badgeBg: "bg-orange-100",
          badgeText: "text-orange-700",
        },
        LOW: {
          bg: "from-yellow-500 to-amber-600",
          border: "border-yellow-300",
          icon: Info,
          badgeBg: "bg-yellow-100",
          badgeText: "text-yellow-700",
        },
      },
      INFO: {
        HIGH: {
          bg: "from-blue-500 to-indigo-600",
          border: "border-blue-300",
          icon: Info,
          badgeBg: "bg-blue-100",
          badgeText: "text-blue-700",
        },
        MEDIUM: {
          bg: "from-cyan-500 to-blue-600",
          border: "border-cyan-300",
          icon: Info,
          badgeBg: "bg-cyan-100",
          badgeText: "text-cyan-700",
        },
        LOW: {
          bg: "from-sky-500 to-cyan-600",
          border: "border-sky-300",
          icon: Info,
          badgeBg: "bg-sky-100",
          badgeText: "text-sky-700",
        },
      },
      ALERT: {
        HIGH: {
          bg: "from-purple-500 to-pink-600",
          border: "border-purple-300",
          icon: Shield,
          badgeBg: "bg-purple-100",
          badgeText: "text-purple-700",
        },
        MEDIUM: {
          bg: "from-violet-500 to-purple-600",
          border: "border-violet-300",
          icon: Shield,
          badgeBg: "bg-violet-100",
          badgeText: "text-violet-700",
        },
        LOW: {
          bg: "from-indigo-500 to-violet-600",
          border: "border-indigo-300",
          icon: Shield,
          badgeBg: "bg-indigo-100",
          badgeText: "text-indigo-700",
        },
      },
    };

    return styles[severity]?.[confidence] || styles.INFO.MEDIUM;
  };

  if (isLoading) {
    return (
      <div className="w-full p-4">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return null;
  }

  const reversedNotifications = [...notifications].reverse();

  return (
    <>
      <div className="w-full mb-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="w-7 h-7 text-purple-600" />
              <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                AI Insights
              </h2>
              <p className="text-xs text-gray-600">
                Tap to expand • Latest first
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Carousel */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-3 hide-scrollbar cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ userSelect: "none" }}
          >
            <div className="flex gap-3 px-2 pt-3">
              {reversedNotifications.map((notification, index) => {
                const style = getNotificationStyle(
                  notification.severity,
                  notification.confidence
                );
                const Icon = style.icon;
                const displayNumber = reversedNotifications.length - index;

                return (
                  <div
                    key={index}
                    className="flex-shrink-0 w-72 sm:w-80 relative cursor-pointer"
                    onClick={() => handleCardClick(notification)}
                  >
                    {/* Expand Icon
                    <div className="absolute top-1 right-10 z-30 bg-white rounded-full p-1 shadow-md">
                      <Maximize2 className="w-3 h-3 text-gray-600" />
                    </div> */}

                    {/* Card Number */}
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-20">
                      {displayNumber}
                    </div>

                    {/* Card */}
                    <div
                      className={`relative bg-white rounded-xl border-2 ${style.border} shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden mt-1`}
                    >
                      {/* Gradient Header */}
                      <div
                        className={`bg-gradient-to-r ${style.bg} p-4 text-white relative`}
                      >
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-white/20 rounded-lg">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold line-clamp-1">
                                {notification.title}
                              </span>
                            </div>
                            <div
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${style.badgeBg} ${style.badgeText}`}
                            >
                              {notification.confidence}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Message Body */}
                      <div className="p-4">
                        <p className="text-gray-700 text-sm leading-snug line-clamp-3">
                          {notification.message}
                        </p>

                        {/* Footer */}
                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${style.badgeText}`}
                          >
                            {notification.severity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {notification.mode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll Hint */}
          <div className="text-center mt-2">
            <p className="text-xs text-gray-500 italic">
              💡 Drag to scroll • Tap card to view full details
            </p>
          </div>
        </div>
      </div>

      {/* MODAL - Full Notification View */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const style = getNotificationStyle(
                selectedNotification.severity,
                selectedNotification.confidence
              );
              const Icon = style.icon;

              return (
                <>
                  {/* Modal Header */}
                  <div
                    className={`bg-gradient-to-r ${style.bg} p-6 text-white relative`}
                  >
                    <button
                      onClick={closeModal}
                      className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">
                          {selectedNotification.title}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${style.badgeBg} ${style.badgeText}`}
                          >
                            {selectedNotification.confidence}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20">
                            {selectedNotification.mode}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20">
                            {selectedNotification.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    <h3 className="text-sm font-bold text-gray-600 uppercase mb-3">
                      Full Message
                    </h3>
                    <p className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                      {selectedNotification.message}
                    </p>

                    {/* Additional Info */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <h4 className="text-sm font-bold text-gray-700 mb-3">
                        Notification Details
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 text-xs">
                            Severity Level
                          </p>
                          <p className={`font-bold ${style.badgeText}`}>
                            {selectedNotification.severity}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">Confidence</p>
                          <p className="font-bold text-gray-800">
                            {selectedNotification.confidence}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600 text-xs">Analysis Mode</p>
                          <p className="font-bold text-gray-800">
                            {selectedNotification.mode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={closeModal}
                      className="w-full mt-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default AINotificationsCarousel;
