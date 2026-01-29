
import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend, bgColor, iconColor }) => (
  <div 
    className="relative flex flex-col p-4 rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.06)] tabular-nums h-[140px] sm:h-[152px]" 
    style={{ backgroundColor: bgColor }}
  >
    {Icon && (
        <Icon 
            className="absolute top-3 right-3 w-6 h-6 sm:w-7 sm:h-7" 
            style={{ color: iconColor, strokeWidth: '2px' }} 
        />
    )}
    <h3 className="text-sm sm:text-base font-semibold leading-tight text-[#0B0F15] mr-8">
      {title}
    </h3>
    <p className="mt-auto text-2xl sm:text-3xl font-bold leading-none text-[#0B0F15]">
      {value}
    </p>
    {trend && (
      <p className="mt-2 text-xs sm:text-sm font-medium leading-tight text-[#6A7686] truncate">
        {trend}
      </p>
    )}
  </div>
);

export default StatsCard;
