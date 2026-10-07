import api from "./client";
import { CustomerSegmentationResponse } from "../types/analytics";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export const getSalesForecast = async (months: number = 6) => {
  const response = await api.get("/api/ml/forecast", {
    params: {
      months,
    },
  });

  return response.data.data;
};

export const getAnomalies = async (contamination: number = 0.01, limit: number = 50) => {
  const response = await api.get("/api/ml/anomalies", {
    params: {
      contamination,
      limit,
    },
  });

  return response.data.data;
};

export const getCustomerSegmentation = async (
  clusters: number = 4
): Promise<CustomerSegmentationResponse> => {
  const response = await api.get("/api/ml/segmentation", {
    params: {
      clusters,
    },
  });

  return response.data.data;
};

export const useCustomerSegmentation = (
  clusters: number = 4,
  options?: Omit<UseQueryOptions<CustomerSegmentationResponse>, "queryKey" | "queryFn">
) => {
  return useQuery<CustomerSegmentationResponse>({
    queryKey: ["customer-segmentation", clusters],
    queryFn: () => getCustomerSegmentation(clusters),
    retry: 1,
    ...options,
  });
};