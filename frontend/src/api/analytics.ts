import api from "./client";

export const getSummary = async () => {
  const response = await api.get("/api/analytics/summary");
  return response.data.data;
};

export const getSalesByRegion = async () => {
  const response = await api.get("/api/analytics/sales-by-region");
  return response.data.data;
};

export const getProfitByCategory = async () => {
  const response = await api.get("/api/analytics/profit-by-category");
  return response.data.data;
};

export const getTopProducts = async (limit: number = 10) => {
  const response = await api.get(`/api/analytics/top-products?limit=${limit}`);
  return response.data.data;
};

export const getSalesByMonth = async () => {
  const response = await api.get("/api/analytics/sales-by-month");
  return response.data.data;
};

export const getAnomalies = async (contamination: number = 0.01, limit: number = 50) => {
  const response = await api.get(`/api/analytics/anomalies?contamination=${contamination}&limit=${limit}`);
  return response.data.data;
};

export const getCustomerSegmentation = async (clusters: number = 4) => {
  const response = await api.get(`/api/analytics/segmentation?clusters=${clusters}`);
  return response.data.data;
};