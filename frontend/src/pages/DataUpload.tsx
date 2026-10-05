import { useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

const DataUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    // Check if it's a valid file type (csv, xlsx, etc. for mockup just accept any)
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    alert(`Uploading ${selectedFile.name}...`);
    // Mock API call
    setTimeout(() => {
      setSelectedFile(null);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Business Data</h1>
        <p className="text-gray-500 mt-2">Upload your CSV or Excel files to let the AI analyze them.</p>
      </header>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {!selectedFile ? (
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Drag & Drop your file here</h3>
              <p className="text-gray-500 mb-6">Supports .csv, .xls, .xlsx</p>
              
              <label className="relative cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <span>Browse Files</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleChange} 
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="border rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Selected File</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200 text-blue-600">
                  <File size={24} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleUpload}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Upload & Process
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-blue-900 mb-2">Data Privacy & Security</h4>
        <p className="text-blue-800 text-sm">
          Your data is processed securely and is never used to train public models. Datasets are only accessible within your organization's secure environment.
        </p>
      </div>
    </div>
  );
};

export default DataUpload;
