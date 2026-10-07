export interface Summary {
    total_sales: number;
    total_profit: number;
    total_quantity: number;
    total_orders: number;
    total_customers: number;
    total_returns: number;
  }
  
  export interface RegionSales {
    region: string;
    total_sales: number;
  }
  
  export interface CategoryProfit {
    category: string;
    total_profit: number;
  }
  
  export interface ProductSales {
    product_name: string;
    total_sales: number;
  }
  
  export interface MonthlySales {
  month: string;
  total_sales: number;
  total_profit: number;
}

export interface AnomalyItem {
  order_id: string;
  product_name: string;
  category?: string;
  sub_category?: string;
  region?: string;
  customer_name?: string;
  sales: number;
  quantity: number;
  profit: number;
  anomaly_score: number;
  is_anomaly: boolean;
}

export interface AnomalyResponse {
  total_transactions: number;
  total_anomalies: number;
  anomaly_rate: number;
  anomalies: AnomalyItem[];
}

export interface CustomerSegment {
  cluster: number;
  segment?: string;
  customers: number;
  avg_recency: number;
  avg_frequency: number;
  avg_monetary: number;
  total_revenue: number;
}

export interface CustomerRFMItem {
  customer_id: string;
  customer_name?: string;
  recency: number;
  frequency: number;
  monetary: number;
  cluster: number;
  segment: string;
}

export interface CustomerSegmentationResponse {
  total_customers: number;
  clusters: number;
  silhouette_score: number;
  summary: CustomerSegment[];
  customers: CustomerRFMItem[];
}