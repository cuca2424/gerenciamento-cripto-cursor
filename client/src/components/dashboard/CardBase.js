import React from 'react';

const CardBase = ({ title, children, height }) => {
  return (
    <div className="card" style={{ height }}>
      <div className="card-body p-3">
        <h5 className="card-title mb-3 fw-bold">{title}</h5>
        <div className="border-bottom mb-2" style={{ 
          marginLeft: '-1rem', 
          marginRight: '-1rem', 
          width: 'calc(100% + 2rem)',
          paddingTop: '0px' 
        }}></div>
        {children}
      </div>
    </div>
  );
};

export default CardBase; 