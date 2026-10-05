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