import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Database,
  ArrowRight,
  ShieldCheck,
  Download,
  X,
  FileCheck,
} from "lucide-react";

interface UploadedRecord {
  id: string;
  filename: string;
  rows: number;
  size: string;
  status: "ready" | "processing" | "failed";
  uploadedAt: string;
}

export default function DataUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [recentUploads, setRecentUploads] = useState<UploadedRecord[]>([
    {
      id: "1",
      filename: "superstore_cleaned.csv",
      rows: 5903,
      size: "1.35 MB",
      status: "ready",
      uploadedAt: "2 hours ago",
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
  };

  const removeFile = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Add to recent uploads
          const newRecord: UploadedRecord = {
            id: Date.now().toString(),
            filename: selectedFile.name,
            rows: Math.floor(Math.random() * 4000) + 1200,
            size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
            status: "ready",
            uploadedAt: "Just now",
          };
          setRecentUploads((rec) => [newRecord, ...rec]);
          setSelectedFile(null);
          return 0;
        }
        return prev + 25;
      });
    }, 250);
  };

  const loadSampleDataset = (name: string, rows: number, size: string) => {
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
      {/* Page Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Database className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-gray-900">
              Data Management & Table Ingestion
            </h2>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upload CSV or Excel spreadsheets to ingest into local DuckDB analytical tables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            DuckDB In-Memory Secured
          </span>
        </div>
      </div>

      {/* Main Drag & Drop Card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-xs">
        {!selectedFile ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
              dragActive
                ? "border-blue-500 bg-blue-50/70"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50/50"
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs mb-4">
              <UploadCloud className="h-8 w-8" />
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1">
              Drag & Drop your dataset here
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mb-6">
              Supports CSV, XLS, and XLSX files. Automatically detects schema for sales, profit, orders, and regions.
            </p>

            <label className="relative cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700">
              <span>Browse Files</span>
              <input
                type="file"
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleChange}
              />
            </label>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 p-6 bg-gray-50/40">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-900">
                Selected File for Ingestion
              </h4>
              <button
                onClick={removeFile}
                disabled={isUploading}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white p-4 border border-gray-200/80 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to ingest
                  </p>
                </div>
              </div>

              {!isUploading ? (
                <button
                  onClick={handleUpload}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
                >
                  Upload & Index
                </button>
              ) : (
                <span className="text-xs font-semibold text-blue-600 animate-pulse">
                  Processing...
                </span>
              )}
            </div>

            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Parsing rows into DuckDB...</span>
                  <span className="font-semibold">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Sample Dataset Cards */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Quick Ingestion Pre-sets
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 transition-all hover:bg-white hover:border-blue-200">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    SuperStore Sales Dataset
                  </p>
                  <p className="text-[11px] text-gray-500">
                    5,903 rows • Cleaned & Standardized
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  loadSampleDataset("superstore_cleaned.csv", 5903, "1.35 MB")
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <span>Active</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 transition-all hover:bg-white hover:border-blue-200">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    Retail Sales Benchmarks
                  </p>
                  <p className="text-[11px] text-gray-500">
                    1,780 rows • Category & Margin stats
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  loadSampleDataset("business.retailsales.csv", 1780, "47.2 KB")
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <span>Ingest</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ingested Tables */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-4">
          Ingested Datasets & Schema Status
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="pb-3 px-3">Dataset Name</th>
                <th className="pb-3 px-3">Rows</th>
                <th className="pb-3 px-3">Size</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Last Synchronized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentUploads.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-3 font-semibold text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{rec.filename}</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {rec.rows.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-gray-500">{rec.size}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      DuckDB Ready
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-400">
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
    </div>
  );
}
