import React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  iconBgClass?: string;
}

const Card: React.FC<CardProps> = ({ icon, title, value, iconBgClass = "bg-primary-100" }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className={`${iconBgClass} p-3 rounded-full`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-secondary">{value}</p>
      </div>
    </div>
  );
};

export default Card;