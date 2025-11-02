
import React from 'react';

interface StockProgressBarProps {
  stock: number;
  maxStock?: number;
}

const StockProgressBar: React.FC<StockProgressBarProps> = ({ stock, maxStock = 100 }) => {
  const percentage = Math.min((stock / maxStock) * 100, 100);

  let barColorClass = 'bg-green-500';
  if (stock <= 10 && stock > 0) {
    barColorClass = 'bg-orange-500';
  } else if (stock === 0) {
    barColorClass = 'bg-red-500';
  }

  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${barColorClass}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default StockProgressBar;
