import React, { useState } from 'react';
import { Download, FileSpreadsheet, Upload, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path if needed

const ImageToExcel = () => {
  const { isAuthenticated } = useAuth() || {};
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversionResult, setConversionResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getAuthToken = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Authentication token not found');
    return token;
  };

  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please select a valid image file (JPEG, JPG, or PNG)');
    }
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      validateImageFile(file);
      setSelectedImage(file);
      setError(null);
      setConversionResult(null);

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setConversionResult(null);
    setError(null);
    setUploadProgress(0);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('http://localhost:8000/api/conversions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {}
      throw new Error(errorData.message || `Upload failed: ${response.status}`);
    }

    return await response.json();
  };

  const checkConversionStatus = async (conversionId) => {
    const response = await fetch(`http://localhost:8000/api/conversions/${conversionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check status: ${response.status}`);
    }

    return await response.json();
  };

  const pollForCompletion = async (conversionId) => {
    const maxAttempts = 30;
    const pollInterval = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await checkConversionStatus(conversionId);

        if (result.status === 'completed') return result;
        if (result.status === 'failed') throw new Error(result.error_message || 'Conversion failed');

        await new Promise((res) => setTimeout(res, pollInterval));
      } catch (err) {
        if (attempt === maxAttempts - 1) throw err;
      }
    }

    throw new Error('Conversion timeout - please try again');
  };

  const handleConvert = async () => {
    if (!selectedImage) return;
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      setUploadProgress(25);
      const uploadResult = await uploadImage(selectedImage);

      setUploadProgress(50);
      const completedResult = await pollForCompletion(uploadResult.id);

      setUploadProgress(100);
      setConversionResult(completedResult);
    } catch (err) {
      setError(err.message || 'Failed to convert image to Excel');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async () => {
    if (!conversionResult?.excel_url) return;

    const downloadFilename = conversionResult.original_filename
      ? conversionResult.original_filename.replace(/\.[^/.]+$/, '.xlsx')
      : 'converted.xlsx';

    try {
      const response = await fetch(
        `http://localhost:8000/api/conversions/${conversionResult.id}/download`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      }

      const directResponse = await fetch(`${conversionResult.excel_url}?token=${getAuthToken()}`);
      if (directResponse.ok) {
        const blob = await directResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      }

      const newWindow = window.open(`${conversionResult.excel_url}?token=${getAuthToken()}`, '_blank');
      if (!newWindow) throw new Error('Please allow popups for this site to download files');
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download Excel file. Please try again or contact support.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!isAuthenticated ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to use the Image to Excel converter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FileSpreadsheet className="h-8 w-8 mr-3 text-blue-600" />
            Image to Excel Converter
          </h2>

          <div className="space-y-6">
            {/* Upload Box */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              {!selectedImage ? (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-lg font-medium text-gray-700">Click to upload an image</span>
                    <p className="text-sm text-gray-500 mt-2">Supports JPEG, JPG, PNG files up to 10MB</p>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img src={imagePreview} alt="Selected" className="max-h-64 mx-auto rounded-lg shadow-md" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-sm text-gray-600">{selectedImage.name}</p>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Convert Button */}
            {selectedImage && !isLoading && !conversionResult && (
              <button
                onClick={handleConvert}
                disabled={isLoading}
                className={`w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium flex items-center justify-center ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                Convert to Excel
              </button>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 mb-2">Converting image to Excel...</p>
                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}

            {/* Success */}
            {conversionResult && (
              <div className="bg-green-50 border border-green-200 rounded-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-green-800">Conversion Successful!</h3>
                      <p className="text-sm text-green-700">
                        {conversionResult.original_filename} has been converted to Excel
                      </p>
                      {conversionResult.debug_info && (
                        <p className="text-xs text-green-600 mt-1">
                          Extracted {conversionResult.debug_info.extracted_data_length} data points
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageToExcel;
