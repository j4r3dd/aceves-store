'use client';
import { useState } from 'react';

export default function ExpandableSection({ 
  title, 
  children, 
  isOpenByDefault = false,
  className = "" 
}) {
  const [isExpanded, setIsExpanded] = useState(isOpenByDefault);

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Button to toggle expansion */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <h2 className="text-xl font-semibold text-black">{title}</h2>
        <span className="text-2xl text-primary transform transition-transform duration-200">
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      
      {/* Expandable content */}
      {isExpanded && (
        <div className="px-6 pb-6 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}