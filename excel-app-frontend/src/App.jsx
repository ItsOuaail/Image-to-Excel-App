import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import ImageToExcel from './components/ImageToExcel';
import ExcelMerger from './components/ExcelMerger';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('image-to-excel');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'image-to-excel':
        return <ImageToExcel />;
      case 'merge-excel':
        return <ExcelMerger />;
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