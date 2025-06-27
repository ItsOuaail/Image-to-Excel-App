// src/App.jsx
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import ImageToExcel from './components/ImageToExcel';
import ExcelMerger from './components/ExcelMerger';
import MyFichiersExcel from './components/MyFichiersExcel';
import { getCsrfToken } from './config/api';

import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('image-to-excel');

  // Initialize CSRF token when app mounts
  useEffect(() => {
    getCsrfToken().catch(error => {
      console.warn('Could not initialize CSRF token:', error);
    });
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'image-to-excel':
        return <ImageToExcel />;
      case 'merge-excel':
        return <ExcelMerger />;
      case 'my-fichiers-excel':
        return <MyFichiersExcel />;
      default:
        return <ImageToExcel />;
    }
  };

  return (
    <AuthProvider>
      <ProtectedRoute>
        <Layout>
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          {renderActiveComponent()}
        </Layout>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
