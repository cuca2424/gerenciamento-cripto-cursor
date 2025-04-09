import React from 'react';

const MetricCard = ({ title, value }) => {
  return (
    <div className={`card text-white h-100`}>
      <div className="card-body p-4">
        <h5 className="card-title mb-3">{title}</h5>
        <h2 className="card-text">{value}</h2>
      </div>
    </div>
  );
};

export default MetricCard; 