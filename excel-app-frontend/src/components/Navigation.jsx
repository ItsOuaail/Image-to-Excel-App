import React from 'react';
import { Image, FileSpreadsheet } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'image-to-excel', label: 'Image to Excel', icon: Image },
    { id: 'merge-excel', label: 'Merge Excel', icon: FileSpreadsheet },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-1">
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Navigation;