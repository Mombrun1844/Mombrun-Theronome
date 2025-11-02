
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
