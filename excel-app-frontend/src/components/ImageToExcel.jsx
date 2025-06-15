import React, { useState } from 'react';
import FileUploader from './FileUploader';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { validateImageFile } from '../utils/fileUtils';
import { Download, FileSpreadsheet } from 'lucide-react';

const ImageToExcel = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversionData, setConversionData] = useState(null);

  const handleImageSelect = (files) => {
    const file = files[0];
    try {
      validateImageFile(file);
      setSelectedImage(file);
      setError(null);
      setConversionData(null); // Reset previous conversion data
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setConversionData(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Upload image for conversion
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const formData = new FormData();
      formData.append('image', selectedImage);

      const uploadResponse = await fetch('http://localhost:8000/api/conversions/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Failed to start conversion');
      }

      const uploadResult = await uploadResponse.json();
      const conversionId = uploadResult.id || uploadResult.data?.id;

      if (!conversionId) {
        throw new Error('Conversion ID not received from server');
      }

      // Step 2: Poll for conversion completion and get download URL
      await pollForConversionCompletion(conversionId, authToken);

    } catch (err) {
      setError(err.message || 'Failed to convert image to Excel');
    } finally {
      setIsLoading(false);
    }
  };

  const pollForConversionCompletion = async (conversionId, authToken) => {
    const maxAttempts = 30; // Maximum polling attempts
    const pollInterval = 2000; // Poll every 2 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`http://localhost:8000/api/conversions/${conversionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to check conversion status');
        }

        const result = await response.json();
        
        if (result.success && result.data?.status === 'completed') {
          setConversionData(result.data);
          return;
        } else if (result.data?.status === 'failed') {
          throw new Error('Conversion failed on server');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (err) {
        throw new Error(`Polling failed: ${err.message}`);
      }
    }

    throw new Error('Conversion timeout - please try again');
  };

  const handleDownload = async () => {
    if (!conversionData) return;

    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in.');
      }

      console.log('Auth token:', authToken ? 'Present' : 'Missing');
      console.log('Attempting to download from:', conversionData.api_download_url);

      const response = await fetch(`http://localhost:8000/api/debug/download-excel/${conversionData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Type': 'application/json',
        },
      });

      console.log('Download response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('File not found. The conversion may have expired.');
        } else {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error(`Download failed: ${response.status} - ${errorText}`);
        }
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      console.log('Download successful, file size:', blob.size);
      downloadBlob(blob, conversionData.download_filename);

    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to download Excel file');
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `converted_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

          {selectedImage && !isLoading && !conversionData && (
            <button
              onClick={handleConvert}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium"
            >
              Convert to Excel
            </button>
          )}

          {isLoading && <LoadingSpinner message="Converting image to Excel..." />}

          {conversionData && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
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
              
              {/* File details */}
              <div className="text-sm text-green-700">
                <p><strong>Original:</strong> {conversionData.original_filename}</p>
                <p><strong>Size:</strong> {conversionData.file_size_formatted}</p>
                <p><strong>Created:</strong> {new Date(conversionData.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageToExcel;