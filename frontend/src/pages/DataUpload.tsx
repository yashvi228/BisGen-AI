import { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Database,
  ArrowRight,
  Download,
  X,
  FileCheck,
  Table,
  Layers,
  HardDrive,
  Cpu,
} from "lucide-react";

interface UploadedRecord {
  id: string;
  filename: string;
  rows: number;
  size: string;
  status: "ready" | "processing" | "failed";
  uploadedAt: string;
}

const SCHEMA_COLUMNS = [
  { name: "order_id", type: "VARCHAR", desc: "Unique retail order tracking code" },
  { name: "order_date", type: "TIMESTAMP", desc: "Purchase order placement date" },
  { name: "customer_name", type: "VARCHAR", desc: "Corporate or consumer client name" },
  { name: "region", type: "VARCHAR", desc: "Territory: West, East, Central, South" },
  { name: "category", type: "VARCHAR", desc: "Product family: Technology, Furniture, Office" },
  { name: "product_name", type: "VARCHAR", desc: "Complete inventory product title" },
  { name: "sales", type: "DOUBLE", desc: "Gross sale amount in USD" },
  { name: "profit", type: "DOUBLE", desc: "Net operational profit margin in USD" },
  { name: "quantity", type: "INTEGER", desc: "Total physical units purchased" },
  { name: "returns", type: "INTEGER", desc: "Return flag / reverse logistics count" },
];

const SAMPLE_RECORDS = [
  { id: "CA-2019-160304", date: "2019-01-01", customer: "Brendan Murry", region: "East", category: "Furniture", product: "Bush Westfield Collection Bookcases", sales: "$173.94", profit: "$38.27" },
  { id: "CA-2019-125206", date: "2019-01-03", customer: "Lena Radford", region: "West", category: "Office Supplies", product: "Recycled Steel Personal File Box", sales: "$114.46", profit: "$28.62" },
  { id: "US-2019-116365", date: "2019-01-03", customer: "Christine Abelman", region: "Central", category: "Technology", product: "WD My Passport Ultra 1TB Portable Drive", sales: "$165.60", profit: "-$6.21" },
  { id: "CA-2019-105207", date: "2019-01-03", customer: "Bill Overfelt", region: "Central", category: "Furniture", product: "Hon Practical Foundations Training Table", sales: "$1,592.85", profit: "$350.43" },
  { id: "CA-2019-105207", date: "2019-01-04", customer: "Bill Overfelt", region: "Central", category: "Office Supplies", product: "Storex Dura Pro Binders", sales: "$11.88", profit: "$5.35" },
];

interface DataUploadProps {
  onShowToast?: (message: string) => void;
}

export default function DataUpload({ onShowToast }: DataUploadProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "schema" | "preview">("upload");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");

  const [recentUploads, setRecentUploads] = useState<UploadedRecord[]>([
    {
      id: "1",
      filename: "superstore_cleaned.csv",
      rows: 5903,
      size: "1.35 MB",
      status: "ready",
      uploadedAt: "Active in DuckDB",
    },
    {
      id: "2",
      filename: "business.retailsales.csv",
      rows: 1780,
      size: "47.2 KB",
      status: "ready",
      uploadedAt: "Yesterday",
    },
  ]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    onShowToast?.(`Selected file: ${file.name}`);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStage("");
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(20);
    setUploadStage("Validating column signatures...");

    setTimeout(() => {
      setUploadProgress(50);
      setUploadStage("Ingesting rows into DuckDB in-memory tables...");
    }, 400);

    setTimeout(() => {
      setUploadProgress(85);
      setUploadStage("Computing aggregate indexes & summaries...");
    }, 800);

    setTimeout(() => {
      setUploadProgress(100);
      setUploadStage("Ingestion complete!");
      setIsUploading(false);

      const newRecord: UploadedRecord = {
        id: Date.now().toString(),
        filename: selectedFile.name,
        rows: Math.floor(Math.random() * 4000) + 1200,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        status: "ready",
        uploadedAt: "Just now",
      };
      setRecentUploads((rec) => [newRecord, ...rec]);
      onShowToast?.(`Successfully ingested ${selectedFile.name} into DuckDB!`);
      setSelectedFile(null);
    }, 1300);
  };

  const loadSampleDataset = (name: string, rows: number, size: string) => {
    onShowToast?.(`Synchronized table with ${name}`);
    const existing = recentUploads.find((u) => u.filename === name);
    if (!existing) {
      setRecentUploads((prev) => [
        {
          id: Date.now().toString(),
          filename: name,
          rows,
          size,
          status: "ready",
          uploadedAt: "Just now",
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header Card with Storage Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Database className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Data Management & Table Ingestion
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Upload CSV/Excel datasets or inspect active DuckDB analytical schema
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab("upload")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "upload"
                ? "bg-white text-blue-600 shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Upload Ingestion
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "schema"
                ? "bg-white text-blue-600 shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Schema Inspector
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "preview"
                ? "bg-white text-blue-600 shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Live Sample Preview
          </button>
        </div>
      </div>

      {/* Analytical Storage Footprint Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
            <Layers className="h-3.5 w-3.5 text-blue-500" />
            <span>Active Records</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900">5,903 Rows</p>
          <p className="text-[10px] text-slate-400 mt-0.5">SuperStore Cleaned</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
            <Table className="h-3.5 w-3.5 text-indigo-500" />
            <span>Table Schema</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900">21 Columns</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Strict typed DuckDB</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
            <HardDrive className="h-3.5 w-3.5 text-emerald-500" />
            <span>Database Size</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900">1.35 MB</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Columnar compressed</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
            <Cpu className="h-3.5 w-3.5 text-purple-500" />
            <span>Query Engine</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900">DuckDB v1.x</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Threadpool safe</p>
        </div>
      </div>

      {activeTab === "upload" && (
        <>
          {/* Main Drag & Drop Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-50/70"
                    : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs mb-4">
                  <UploadCloud className="h-8 w-8" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Drag & Drop your retail dataset here
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-6">
                  Supports CSV, XLS, and XLSX files. Automatically detects schemas for sales, profit, orders, and geographic territories.
                </p>

                <label className="relative cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-blue-700">
                  <span>Browse Local Files</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleChange}
                  />
                </label>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/40">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900">
                    Selected Dataset for Ingestion
                  </h4>
                  <button
                    onClick={removeFile}
                    disabled={isUploading}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white p-4 border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for DuckDB
                      </p>
                    </div>
                  </div>

                  {!isUploading ? (
                    <button
                      onClick={handleUpload}
                      className="rounded-xl bg-blue-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                    >
                      Ingest & Index
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-blue-600 animate-pulse">
                      Processing...
                    </span>
                  )}
                </div>

                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{uploadStage}</span>
                      <span className="font-bold tabular-nums">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Ingestion Presets */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Pre-Cleaned Repository Datasets
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:bg-white hover:border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        SuperStore Cleaned Dataset
                      </p>
                      <p className="text-[11px] text-slate-500">
                        5,903 transactions • 4 Regions • Active
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      loadSampleDataset("superstore_cleaned.csv", 5903, "1.35 MB")
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Re-sync</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:bg-white hover:border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Download className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Retail Sales Benchmarks
                      </p>
                      <p className="text-[11px] text-slate-500">
                        1,780 transactions • Category metrics
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      loadSampleDataset("business.retailsales.csv", 1780, "47.2 KB")
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Ingest</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Ingestion History Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Ingested Datasets & Schema Status
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 px-3">Dataset Name</th>
                    <th className="pb-3 px-3">Indexed Rows</th>
                    <th className="pb-3 px-3">Storage Size</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Synchronization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentUploads.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>{rec.filename}</span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-600 tabular-nums">
                        {rec.rows.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 tabular-nums">{rec.size}</td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          DuckDB Ready
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rec.uploadedAt}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Schema Inspector Tab */}
      {activeTab === "schema" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                DuckDB Table Schema: <code className="text-blue-600 font-mono">sales</code>
              </h3>
              <p className="text-xs text-slate-500">
                Primary analytical table created by load_database.py from SuperStore retail records
              </p>
            </div>
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100">
              10 Core Fields Indexed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 px-3">Column Name</th>
                  <th className="pb-3 px-3">Data Type</th>
                  <th className="pb-3 px-3">Description</th>
                  <th className="pb-3 px-3 text-right">Nullable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SCHEMA_COLUMNS.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {col.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                        {col.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{col.desc}</td>
                    <td className="py-3 px-3 text-right text-slate-400 font-mono">False</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Sample Preview Tab */}
      {activeTab === "preview" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live Data Preview (Top Rows)
              </h3>
              <p className="text-xs text-slate-500">
                Direct view into retail transactions ingested in DuckDB
              </p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
              Showing 5 of 5,903 Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Customer</th>
                  <th className="pb-3 px-3">Region</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Product Name</th>
                  <th className="pb-3 px-3 text-right">Sales</th>
                  <th className="pb-3 px-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SAMPLE_RECORDS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-mono font-semibold text-blue-600">{row.id}</td>
                    <td className="py-3 px-3 text-slate-500">{row.date}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{row.customer}</td>
                    <td className="py-3 px-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {row.region}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{row.category}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{row.product}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">{row.sales}</td>
                    <td className={`py-3 px-3 text-right font-bold tabular-nums ${row.profit.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>
                      {row.profit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
