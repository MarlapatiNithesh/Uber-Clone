import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Global cache for frontend session persistence
const dashboardCache = {
  token: null,
  isCaptain: null,
  stats: null,
  rides: [],
  page: 0,
  hasMore: true
};

const RideHistoryDashboard = ({ isCaptain, onClose }) => {
  const token = localStorage.getItem("token");
  const isCacheValid = dashboardCache.token === token && dashboardCache.isCaptain === isCaptain;

  const [rides, setRides] = useState(isCacheValid ? dashboardCache.rides : []);
  const [stats, setStats] = useState(isCacheValid && dashboardCache.stats ? dashboardCache.stats : { completedRides: 0, totalSpend: 0 });
  const [activeTab, setActiveTab] = useState("daily"); // daily, weekly, monthly, yearly
  
  const [page, setPage] = useState(isCacheValid ? dashboardCache.page : 0);
  const [hasMore, setHasMore] = useState(isCacheValid ? dashboardCache.hasMore : true);
  
  const [loadingStats, setLoadingStats] = useState(isCaptain && !isCacheValid);
  const [loadingRides, setLoadingRides] = useState(false);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);

  // Fetch stats (Only for Captains)
  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view analytics");
      setLoadingStats(false);
      return;
    }

    setLoadingStats(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
      
      // Update cache
      dashboardCache.token = token;
      dashboardCache.isCaptain = isCaptain;
      dashboardCache.stats = response.data;
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch analytics statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch specific page of rides (Only for Customer)
  const fetchRidesPage = async (pageNumber) => {
    if (loadingRides || isCaptain) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingRides(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/history`,
        {
          params: { page: pageNumber, size: 5 },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newRides = Array.isArray(response.data) ? response.data : [];
      
      setRides((prev) => {
        const existingIds = new Set(prev.map(r => r.id || r._id));
        const filteredNew = newRides.filter(r => !existingIds.has(r.id || r._id));
        const combined = [...prev, ...filteredNew];
        
        // Update cache
        dashboardCache.token = token;
        dashboardCache.isCaptain = isCaptain;
        dashboardCache.rides = combined;
        return combined;
      });

      const nextHasMore = newRides.length === 5;
      setHasMore(nextHasMore);
      
      dashboardCache.hasMore = nextHasMore;
      dashboardCache.page = pageNumber;
    } catch (err) {
      console.error("Error fetching paginated rides:", err);
    } finally {
      setLoadingRides(false);
    }
  };

  // Initial fetch on mount if cache is not valid
  useEffect(() => {
    if (isCaptain && !isCacheValid) {
      fetchStats();
    } else if (!isCaptain && !isCacheValid) {
      fetchRidesPage(0);
    }
  }, [isCaptain]);

  // Handle Refresh Button
  const handleRefresh = () => {
    // Clear cache
    dashboardCache.token = null;
    dashboardCache.stats = null;
    dashboardCache.rides = [];
    dashboardCache.page = 0;
    dashboardCache.hasMore = true;

    // Reset state
    setRides([]);
    setStats({ completedRides: 0, totalSpend: 0 });
    setPage(0);
    setHasMore(true);
    setError(null);

    if (isCaptain) {
      fetchStats();
    } else {
      fetchRidesPage(0);
    }
  };

  // Listen to scrolling in container
  const handleScroll = () => {
    if (!containerRef.current || isCaptain) return;

    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    
    // If scrolled close to bottom (within 15px)
    if (scrollHeight - scrollTop <= clientHeight + 15) {
      if (hasMore && !loadingRides) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchRidesPage(nextPage);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "N/A";
    }
  };

  // Render SVG Custom Bar Chart
  const RenderChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map((d) => d.earnings || 1), 100);

    return (
      <div className="bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm mt-3">
        <div className="flex justify-between items-end h-36 px-2">
          {data.map((item, idx) => {
            const pct = ((item.earnings || 0) / maxVal) * 100;
            // Cap minimum height at 4% for visibility of small bars
            const barHeight = pct > 0 ? `${Math.max(pct, 4)}%` : "4px";

            return (
              <div key={idx} className="flex flex-col items-center flex-1 group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 transition-all duration-200">
                  <span className="bg-gray-800 text-white text-xs px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
                    ₹{Math.floor(item.earnings)} ({Math.floor(item.rides)} rides)
                  </span>
                  <span className="w-1.5 h-1.5 bg-gray-800 rotate-45 -mt-1"></span>
                </div>
                
                {/* Bar */}
                <div 
                  className="w-7 sm:w-9 bg-black hover:bg-gray-800 rounded-t-lg transition-all duration-300 relative overflow-hidden flex items-end justify-center cursor-pointer shadow-sm"
                  style={{ height: barHeight }}
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-400"></div>
                </div>
                
                {/* Label */}
                <span className="text-xs font-semibold text-gray-500 mt-2 truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] border border-white/40">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isCaptain ? "Captain Performance Portal" : "Your Ride History"}
            </h2>
            <p className="text-gray-500 text-sm">
              {isCaptain ? "Earnings analytics & metrics" : "Your past bookings & status"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-150 hover:bg-gray-200 transition-colors text-gray-700 active:scale-95 shadow-sm"
              title="Refresh Data"
            >
              <i className="ri-refresh-line text-xl"></i>
            </button>
            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-150 hover:bg-gray-200 transition-colors text-gray-700 active:scale-95 shadow-sm"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        {isCaptain && loadingStats ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="h-10 w-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4 font-medium">Fetching analytics statistics...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <i className="ri-error-warning-fill text-4xl text-red-500 mb-2"></i>
            <p className="text-gray-700 font-semibold">{error}</p>
          </div>
        ) : (
          <>
            {/* Stats Cards (Only for Captains) */}
            {isCaptain && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/60 p-4 rounded-2xl border border-gray-100/50 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Completed Trips
                  </p>
                  <p className="text-3xl font-extrabold text-gray-800 mt-1">{stats.completedRides || 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Total trips completed</p>
                </div>
                <div className="bg-white/60 p-4 rounded-2xl border border-gray-100/50 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Earnings
                  </p>
                  <p className="text-3xl font-extrabold text-gray-800 mt-1">₹{Math.floor(stats.totalSpend || 0)}</p>
                  <p className="text-xs text-gray-400 mt-1">Lifetime total</p>
                </div>
              </div>
            )}

            {/* Graphs for Captain (Daily, Weekly, Monthly, Yearly graphs) */}
            {isCaptain && (
              <div className="mb-2">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                  {["daily", "weekly", "monthly", "yearly"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                        activeTab === tab
                          ? "bg-white text-gray-800 shadow-sm"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <RenderChart data={stats[activeTab]} />
              </div>
            )}

            {/* Trip List (Only for Customer with Scroll Pagination and Infinite Scroll) */}
            {!isCaptain && (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-3 px-1">
                  Recent Bookings
                </h3>
                
                <div 
                  ref={containerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[55vh]"
                >
                  {rides.length === 0 && !loadingRides ? (
                    <div className="text-center py-12 text-gray-400 font-medium">
                      <i className="ri-roadster-line text-4xl block mb-2 opacity-50"></i>
                      No rides recorded yet
                    </div>
                  ) : (
                    <>
                      {rides.map((ride) => (
                        <div
                          key={ride.id || ride._id}
                          className="bg-white/85 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                ride.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : ride.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : ride.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}>
                                {ride.status}
                              </span>
                              <span className="text-xs text-gray-400 font-medium">
                                {formatDate(ride.createdAt)}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-700">
                              <div className="flex items-start gap-2">
                                <i className="ri-map-pin-user-fill text-green-600 mt-0.5"></i>
                                <p className="line-clamp-1"><strong className="text-gray-800">From:</strong> {ride.pickup}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <i className="ri-map-pin-2-fill text-red-500 mt-0.5"></i>
                                <p className="line-clamp-1"><strong className="text-gray-800">To:</strong> {ride.destination}</p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-2 md:pt-0 border-gray-100">
                            <span className="text-gray-400 text-xs font-medium md:mb-0.5">
                              Cost
                            </span>
                            <span className="text-lg font-bold text-gray-900">₹{Math.floor(ride.fare || 0)}</span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Bottom Loader */}
                      {loadingRides && (
                        <div className="py-4 text-center flex items-center justify-center gap-2 text-gray-500 font-medium text-sm">
                          <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          Loading more rides...
                        </div>
                      )}

                      {!hasMore && rides.length > 0 && (
                        <p className="text-center text-xs text-gray-400 font-medium py-3">
                          You've reached the end of your ride history
                        </p>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RideHistoryDashboard;
