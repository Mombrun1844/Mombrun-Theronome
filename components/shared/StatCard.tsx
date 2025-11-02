
import React from 'react';
import Card from './Card';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, colorClass }) => {
  return (
    <Card className="flex items-center space-x-4">
      <div className={`p-3 rounded-full ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </Card>
  );
};

export default StatCard;
