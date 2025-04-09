import React from 'react';

function MetricCard({ title, value, centered = false }) {
  return (
    <div className="card h-100">
      <div className={`card-body ${centered ? 'text-center' : ''}`}>
        <h6 className="text-muted">{title}</h6>
        <h3 className="mb-0">{value}</h3>
      </div>
    </div>
  );
}

export default MetricCard; 