import React from 'react';

const EmptyCard = ({ title, height }) => {
  return (
    <div className="card" style={{ height }}>
      <div className="card-body p-4">
        <h5 className="card-title mb-3">{title}</h5>
      </div>
    </div>
  );
};

export default EmptyCard; 