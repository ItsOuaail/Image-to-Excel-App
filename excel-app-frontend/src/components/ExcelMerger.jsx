import React, { useState } from 'react';
import FileUploader from './FileUploader';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { excelService } from '../services/excelService';
import { validateExcelFile, downloadFile } from '../utils/fileUtils';
import { Download, FileSpreadsheet, Merge } from 'lucide-react';

const ExcelMerger = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFilesSelect = (files) => {
    try {
      const validFiles = files.filter(file => {
        validateExcelFile(file);
        return true;
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 2));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setResult(null);
    setError(null);
  };

  const handleMerge = async () => {
    if (selectedFiles.length !== 2) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await excelService.mergeExcelFiles(selectedFiles[0], selectedFiles[1]);
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to merge Excel files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.file_id) return;

    try {
      const blob = await excelService.downloadExcel(result.file_id);
      downloadFile(blob, `merged_${Date.now()}.xlsx`);
    } catch (err) {
      setError('Failed to download merged Excel file');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Excel File Merger</h2>
        
        <div className="space-y-6">
          <FileUploader
            onFileSelect={handleFilesSelect}
            acceptedFileTypes={{
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
              'application/vnd.ms-excel': ['.xls']
            }}
            maxFiles={2}
            title="Upload Excel Files"
            description={`Upload 2 Excel files to merge (${selectedFiles.length}/2 selected)`}
            selectedFiles={selectedFiles}
            onRemoveFile={handleRemoveFile}
          />

          {error && <ErrorMessage error={error} onRetry={() => setError(null)} />}

          {selectedFiles.length === 2 && !isLoading && !result && (
            <button
              onClick={handleMerge}
              className="w-full bg-purple-500 text-white py-3 px-4 rounded-md hover:bg-purple-600 transition-colors font-medium flex items-center justify-center"
            >
              <Merge className="h-5 w-5 mr-2" />
              Merge Excel Files
            </button>
          )}

          {isLoading && <LoadingSpinner message="Merging Excel files..." />}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-green-800">Merge Successful!</h3>
                    <p className="text-sm text-green-700">Your merged Excel file is ready for download</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Merged File
                </button>
              </div>
            </div>
          )}

          {selectedFiles.length < 2 && (
            <div className="text-center text-gray-500">
              <p>Please select 2 Excel files to merge</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelMerger;