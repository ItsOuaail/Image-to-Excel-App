const API_BASE_URL = 'http://localhost:8000/api';

class ExcelService {
  getAuthToken() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }
    return token;
  }

  async convertImageToExcel(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/conversions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to start conversion');
    }

    const result = await response.json();
    const conversionId = result.id || result.data?.id;

    if (!conversionId) {
      throw new Error('Conversion ID not received from server');
    }

    return await this.pollForCompletion(conversionId);
  }

  async pollForCompletion(conversionId) {
    const maxAttempts = 30;
    const pollInterval = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(`${API_BASE_URL}/conversions/${conversionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check conversion status');
      }

      const result = await response.json();
      
      if (result.success && result.data?.status === 'completed') {
        return result.data;
      } else if (result.data?.status === 'failed') {
        throw new Error('Conversion failed on server');
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Conversion timeout - please try again');
  }

  async downloadExcel(conversionData) {
    if (!conversionData?.api_download_url) {
      throw new Error('Download URL not available');
    }

    const response = await fetch(conversionData.api_download_url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download Excel file');
    }

    const blob = await response.blob();
    
    // Create download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = conversionData.download_filename || `converted_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const excelService = new ExcelService();