import api from '../config/api';

export const excelService = {
  // Convert image to Excel
  convertImageToExcel: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/convert-image-to-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Merge two Excel files
  mergeExcelFiles: async (file1, file2) => {
    const formData = new FormData();
    formData.append('excel1', file1);
    formData.append('excel2', file2);
    
    const response = await api.post('/merge-excel-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download Excel file
  downloadExcel: async (fileId) => {
    const response = await api.get(`/download-excel/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};