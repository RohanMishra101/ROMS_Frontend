import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// const API_BASE = process.env.REACT_APP_API_BASE_URL;
const API_BASE = import.meta.env.VITE_API_REACT_APP_API_BASE_URL || "http://localhost:3000/api";

export function useAnalyticsData() {
  const [data, setData] = useState({
    revenue: 0,
    mostOrdered: [],
    leastOrdered: [],
    peakHours: [],
    tableUtilization: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [revRes, mostRes, leastRes, peakRes, tableRes] = await Promise.all([
        axios.get(`${API_BASE}/dashboard/revenue`, { headers, signal }),
        axios.get(`${API_BASE}/dashboard/most-ordered`, { headers, signal }),
        axios.get(`${API_BASE}/dashboard/least-ordered`, { headers, signal }),
        axios.get(`${API_BASE}/dashboard/peak-hours`, { headers, signal }),
        axios.get(`${API_BASE}/dashboard/table-utilization`, { headers, signal }),
      ]);

      setData({
        "30days": {
          totalRevenue: revRes.data["30days"].totalRevenue,
          avgDailyRevenue: revRes.data["30days"].avgDailyRevenue,
          peakHour: revRes.data["30days"].peakHour,
          peakHourRevenue: revRes.data["30days"].peakHourRevenue,
          revenueByCategory: revRes.data["30days"].revenueByCategory,
          revenuePerDay: revRes.data["30days"].revenuePerDay,
          trend: revRes.data["30days"].trend,
          change: revRes.data["30days"].change,
        },
        "6months": {
          totalRevenue: revRes.data["6months"].totalRevenue,
          avgDailyRevenue: revRes.data["6months"].avgDailyRevenue,
          peakHour: revRes.data["6months"].peakHour,
          peakHourRevenue: revRes.data["6months"].peakHourRevenue,
          revenueByCategory: revRes.data["6months"].revenueByCategory,
          revenuePerDay: revRes.data["6months"].revenuePerDay,
          trend: revRes.data["6months"].trend,
          change: revRes.data["6months"].change,
        },
        "1year": {
          totalRevenue: revRes.data["1year"].totalRevenue,
          avgDailyRevenue: revRes.data["1year"].avgDailyRevenue,
          peakHour: revRes.data["1year"].peakHour,
          peakHourRevenue: revRes.data["1year"].peakHourRevenue,
          revenueByCategory: revRes.data["1year"].revenueByCategory,
          revenuePerDay: revRes.data["1year"].revenuePerDay,
          trend: revRes.data["1year"].trend,
          change: revRes.data["1year"].change,
        },
        mostOrdered: mostRes.data,
        leastOrdered: leastRes.data,
        tableUtilization: tableRes.data,
      });

    } catch (err) {
      if (!signal?.aborted) {
        setError(err);
        console.error("Analytics fetch error:", err);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const refreshData = () => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  };

  return { data, loading, error, refreshData };
}