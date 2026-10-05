import { useState, useMemo } from "react";
import { Search, Trophy, Package, ArrowUpDown, Download, Copy, Check } from "lucide-react";
import { ProductSales } from "../types/analytics";

interface ProductsTableProps {
  data?: ProductSales[];
  isLoading?: boolean;
  onShowToast?: (message: string) => void;
}

export default function ProductsTable({
  data = [],
  isLoading = false,
  onShowToast,
}: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"sales" | "name">("sales");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [copiedName, setCopiedName] = useState<string | null>(null);

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
    result.sort((a, b) => {
      if (sortField === "sales") {
        return sortOrder === "desc"
          ? b.total_sales - a.total_sales
          : a.total_sales - b.total_sales;
      } else {
        return sortOrder === "desc"
          ? b.product_name.localeCompare(a.product_name)
          : a.product_name.localeCompare(b.product_name);
      }
    });
    return result;
  }, [data, searchTerm, sortField, sortOrder]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(0, pageSize);
  }, [filteredData, pageSize]);

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedName(name);
    onShowToast?.(`Copied "${name.slice(0, 30)}..." to clipboard`);
    setTimeout(() => setCopiedName(null), 1500);
  };

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = ["Rank,Product Name,Gross Sales (USD)"];
    const rows = filteredData.map(
      (item, idx) => `${idx + 1},"${item.product_name.replace(/"/g, '""')}",${item.total_sales.toFixed(2)}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `top_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.("Exported top products table to CSV");
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-44 bg-slate-200 rounded"></div>
          <div className="h-8 w-48 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-slate-50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-extrabold text-xs ring-2 ring-amber-300 shadow-2xs">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs ring-2 ring-slate-300 shadow-2xs">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-800 font-extrabold text-xs ring-2 ring-amber-200 shadow-2xs">
          3
        </span>
      );
    }
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Trophy className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Top Revenue Generators</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Highest performing catalog inventory ranked by gross sales
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter products..."
              className="h-9 w-44 rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-56"
            />
          </div>

          {/* Rows Limit Selector */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={25}>Top 25</option>
          </select>

          {/* Export to CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 shadow-2xs"
            title="Download CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-3 pl-2 w-12 text-center">Rank</th>
              <th
                onClick={() => {
                  setSortField("name");
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                }}
                className="pb-3 px-4 cursor-pointer hover:text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Product Name</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="pb-3 px-4 w-48">Volume Share</th>
              <th
                onClick={() => {
                  setSortField("sales");
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                }}
                className="pb-3 pr-4 text-right w-36 cursor-pointer hover:text-slate-700 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Gross Revenue</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                  <Package className="mx-auto h-8 w-8 text-slate-300 mb-2 stroke-1" />
                  No products found matching "{searchTerm}".
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const percentage = maxSales > 0 ? (item.total_sales / maxSales) * 100 : 0;
                return (
                  <tr
                    key={item.product_name}
                    className="group transition-colors hover:bg-blue-50/40"
                  >
                    <td className="py-3 pl-2 text-center">
                      <div className="flex justify-center">
                        {getRankBadge(idx + 1)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {item.product_name}
                        </span>
                        <button
                          onClick={() => handleCopy(item.product_name)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
                          title="Copy product name"
                        >
                          {copiedName === item.product_name ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 w-9 text-right tabular-nums">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm tabular-nums">
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
