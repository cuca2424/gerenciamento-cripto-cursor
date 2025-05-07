import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className="nav-link" to="/imposto">
            <i className="fas fa-file-invoice-dollar"></i>
            <span>Imposto de Renda</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar; 