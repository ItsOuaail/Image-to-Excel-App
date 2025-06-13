import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileSpreadsheet className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Excel Processor</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;