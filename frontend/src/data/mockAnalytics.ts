import {
  Summary,
  RegionSales,
  CategoryProfit,
  ProductSales,
  MonthlySales,
} from "../types/analytics";

export const mockSummary: Summary = {
  total_sales: 2297200.86,
  total_profit: 286397.02,
  total_quantity: 37873,
  total_orders: 5009,
  total_customers: 793,
  total_returns: 800,
};

export const mockRegionSales: RegionSales[] = [
  { region: "West", total_sales: 725457.82 },
  { region: "East", total_sales: 678781.24 },
  { region: "Central", total_sales: 501239.89 },
  { region: "South", total_sales: 391721.91 },
];

export const mockCategoryProfit: CategoryProfit[] = [
  { category: "Technology", total_profit: 145454.95 },
  { category: "Office Supplies", total_profit: 122490.8 },
  { category: "Furniture", total_profit: 18451.27 },
];

export const mockTopProducts: ProductSales[] = [
  { product_name: "Canon imageCLASS 2200 Advanced Copier", total_sales: 61599.82 },
  { product_name: "Fellowes PB500 Electric Punch Comb Binding Machine", total_sales: 27453.38 },
  { product_name: "Cisco TelePresence System EX90 Videoconferencing Unit", total_sales: 22638.48 },
  { product_name: "HON 5400 Series Task Chairs for Big and Tall", total_sales: 21870.58 },
  { product_name: "GBC DocuBind TL300 Electric Binding System", total_sales: 19823.48 },
  { product_name: "GBC Ibico EP97 9\" Electric Comb Binding System", total_sales: 19024.5 },
  { product_name: "Hewlett Packard LaserJet 3310 Copier", total_sales: 18839.69 },
  { product_name: "HP Designjet T520 36-in ePrinter Large Format Printer", total_sales: 18374.9 },
  { product_name: "GBC DocuBind P400 Electric Binding System", total_sales: 17965.07 },
  { product_name: "High Speed Automatic Electric Letter Opener", total_sales: 17030.47 },
];

export const mockMonthlySales: MonthlySales[] = [
  { month: "Jan", total_sales: 94924.83, total_profit: 11048.91 },
  { month: "Feb", total_sales: 59751.25, total_profit: 8904.32 },
  { month: "Mar", total_sales: 147545.9, total_profit: 19842.14 },
  { month: "Apr", total_sales: 137762.12, total_profit: 14321.8 },
  { month: "May", total_sales: 155028.81, total_profit: 18230.45 },
  { month: "Jun", total_sales: 152718.67, total_profit: 17892.1 },
  { month: "Jul", total_sales: 147238.09, total_profit: 16750.3 },
  { month: "Aug", total_sales: 159042.43, total_profit: 21450.8 },
  { month: "Sep", total_sales: 245032.18, total_profit: 32180.5 },
  { month: "Oct", total_sales: 200258.4, total_profit: 26890.12 },
  { month: "Nov", total_sales: 352461.07, total_profit: 46210.4 },
  { month: "Dec", total_sales: 453337.12, total_profit: 52666.08 },
];
