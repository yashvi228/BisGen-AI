import { useState, useMemo } from "react";
import { Search, Trophy, Package, ArrowUpDown } from "lucide-react";
import { ProductSales } from "../types/analytics";

interface ProductsTableProps {
  data?: ProductSales[];
  isLoading?: boolean;
}

export default function ProductsTable({ data = [], isLoading = false }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Determine max sales for relative progress bar calculation
  const maxSales = useMemo(() => {
    if (!data.length) return 1;
    return Math.max(...data.map((d) => d.total_sales));
  }, [data]);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchTerm.trim()) {
      result = result.filter((p) =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    result.sort((a, b) =>
      sortOrder === "desc"
        ? b.total_sales - a.total_sales
        : a.total_sales - b.total_sales
    );
    return result;
  }, [data, searchTerm, sortOrder]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-40 bg-gray-200 rounded"></div>
          <div className="h-8 w-48 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-gray-50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-xs ring-1 ring-amber-300">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-xs ring-1 ring-slate-300">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-800 font-bold text-xs ring-1 ring-amber-200">
          3
        </span>
      );
    }
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-medium text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Trophy className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-gray-900">Top Revenue Generators</h3>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Highest performing inventory items ranked by gross revenue
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product..."
              className="h-9 w-48 rounded-lg border border-gray-200 bg-gray-50/60 pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-60"
            />
          </div>

          <button
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            title={`Sort ${sortOrder === "desc" ? "Ascending" : "Descending"}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              <th className="pb-3 pl-2 w-12 text-center">Rank</th>
              <th className="pb-3 px-4">Product Name</th>
              <th className="pb-3 px-4 w-48">Volume Share</th>
              <th className="pb-3 pr-4 text-right w-32">Gross Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-xs text-gray-400">
                  <Package className="mx-auto h-8 w-8 text-gray-300 mb-2 stroke-1" />
                  No products found matching your search.
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => {
                const percentage = maxSales > 0 ? (item.total_sales / maxSales) * 100 : 0;
                return (
                  <tr
                    key={item.product_name}
                    className="group transition-colors hover:bg-blue-50/30"
                  >
                    <td className="py-3 pl-2 text-center">
                      <div className="flex justify-center">
                        {getRankBadge(idx + 1)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {item.product_name}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400 w-9 text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="font-semibold text-gray-900 text-xs sm:text-sm tabular-nums">
                        ${item.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
