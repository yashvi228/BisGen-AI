import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { MapPin } from "lucide-react";
import { RegionSales } from "../types/analytics";

interface RegionChartProps {
  data?: RegionSales[];
  isLoading?: boolean;
}

const REGION_COLORS: Record<string, string> = {
  West: "#3b82f6",     // Blue
  East: "#8b5cf6",     // Violet
  Central: "#06b6d4",  // Cyan
  South: "#10b981",    // Emerald
};

const DEFAULT_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export default function RegionChart({ data = [], isLoading = false }: RegionChartProps) {
  const { totalSales, processedData } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.total_sales, 0);
    const processed = data.map((item, index) => ({
      ...item,
      percentage: total > 0 ? ((item.total_sales / total) * 100).toFixed(1) : "0",
      color: REGION_COLORS[item.region] || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));
    return { totalSales: total, processedData: processed };
  }, [data]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-100 rounded"></div>
        </div>
        <div className="h-64 w-full bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-gray-900">Regional Performance</h3>
            <p className="text-xs text-gray-500">Sales volume distributed across geographic territories</p>
          </div>
        </div>
        {totalSales > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
            {data.length} Regions
          </span>
        )}
      </div>

      <div className="h-52 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <XAxis
              dataKey="region"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as RegionSales & {
                    percentage: string;
                    color: string;
                  };
                  return (
                    <div className="rounded-xl border border-gray-100 bg-white/95 p-3 shadow-lg backdrop-blur-xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="font-bold text-gray-900 text-xs">{item.region} Region</p>
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="text-gray-600">
                          Sales:{" "}
                          <span className="font-semibold text-gray-900">
                            ${item.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </p>
                        <p className="text-gray-500">
                          Share of Total:{" "}
                          <span className="font-medium text-indigo-600">{item.percentage}%</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="total_sales" radius={[6, 6, 0, 0]}>
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mini legend badges */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 pt-3 border-t border-gray-100">
        {processedData.map((item) => (
          <div key={item.region} className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
              {item.region}
            </span>
            <span className="font-semibold text-gray-900">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
