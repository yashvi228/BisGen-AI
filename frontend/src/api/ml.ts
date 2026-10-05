import api from "./client";

export const getSalesForecast = async (months: number = 6) => {
  const response = await api.get("/api/ml/forecast", {
    params: {
      months,
    },
  });

  return response.data.data;
};