import React from 'react';
import './WidgetCard.css';

const WidgetCard = ({ title, value, icon, color }) => {
  return (
    <div className="widget-card" style={{ borderLeftColor: color }}>
      <div className="widget-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="widget-content">
        <h3>{title}</h3>
        <p className="widget-value">{value}</p>
      </div>
    </div>
  );
};

export default WidgetCard;
