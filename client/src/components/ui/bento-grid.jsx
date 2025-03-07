import React from 'react';
import { motion } from 'framer-motion';

export const BentoGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  title,
  description,
  icon,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-lg transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
          {icon}
        </div>
        <motion.div
          className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{
            x: ['0%', '100%'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}; 