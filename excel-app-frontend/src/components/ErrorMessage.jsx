import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
        <h3 className="text-sm font-medium text-red-800">Error</h3>
      </div>
      <p className="mt-2 text-sm text-red-700">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;