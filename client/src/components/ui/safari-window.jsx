import React from 'react';

export const SafariWindow = ({ children, className = '' }) => {
  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl ${className}`}>
      <div className="flex h-12 items-center justify-start gap-2 border-b border-gray-200 bg-gray-50 px-4">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <div className="ml-4 flex-1">
          <div className="h-6 w-full max-w-md rounded-md bg-white shadow-sm" />
        </div>
      </div>
      <div className="bg-white">
        {children}
      </div>
    </div>
  );
}; 