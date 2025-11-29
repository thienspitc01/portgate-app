import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightElement?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, rightElement, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          className={`block w-full px-4 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 transition-colors text-lg uppercase tracking-wide ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};