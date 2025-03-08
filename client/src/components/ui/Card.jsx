import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  className = '',
  padding = true,
  hover = false,
  onClick
}) => {
  const baseClasses = 'bg-white rounded-lg shadow';
  const hoverClasses = hover ? 'transition-transform duration-200 hover:scale-105 cursor-pointer' : '';
  const paddingClasses = padding ? 'p-6' : '';

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className={`${paddingClasses} border-b`}>
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      <div className={paddingClasses}>
        {children}
      </div>

      {footer && (
        <div className={`${paddingClasses} border-t bg-gray-50 rounded-b-lg`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 