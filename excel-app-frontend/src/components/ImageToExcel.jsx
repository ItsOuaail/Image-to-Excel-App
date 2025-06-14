import React, { useState } from 'react';
import FileUploader from './FileUploader';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { excelService } from '../services/excelService';
import { validateImageFile, downloadFile } from '../utils/fileUtils';
import { Download, FileSpreadsheet } from 'lucide-react';

const ImageToExcel = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleImageSelect = (files) => {
    const file = files[0];
    try {
      validateImageFile(file);
      setSelectedImage(file);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await excelService.convertImageToExcel(selectedImage);
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to convert image to Excel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.file_id) return;

    try {
      const blob = await excelService.downloadExcel(result.file_id);
      downloadFile(blob, `converted_${Date.now()}.xlsx`);
    } catch (err) {
      setError('Failed to download Excel file');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Image to Excel Converter</h2>
        
        <div className="space-y-6">
          <FileUploader
            onFileSelect={handleImageSelect}
            acceptedFileTypes={{
              'image/*': ['.jpeg', '.jpg', '.png']
            }}
            title="Upload Image"
            description="Drag and drop an image file here, or click to select"
            selectedFiles={selectedImage ? [selectedImage] : []}
            onRemoveFile={handleRemoveImage}
          />

          {error && <ErrorMessage error={error} onRetry={() => setError(null)} />}

          {selectedImage && !isLoading && !result && (
            <button
              onClick={handleConvert}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium"
            >
              Convert to Excel
            </button>
          )}

          {isLoading && <LoadingSpinner message="Converting image to Excel..." />}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-green-800">Conversion Successful!</h3>
                    <p className="text-sm text-green-700">Your Excel file is ready for download</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Excel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageToExcel;