import React from 'react';
import { Link } from 'react-router-dom';

function Cancelado() {
  return (
    <div className="container">
      <div className="row flex-center min-vh-100">
        <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
          <div className="card">
            <div className="card-body p-4 p-sm-5 text-center">
              <div className="text-danger mb-4">
                <i className="fas fa-times-circle fa-5x"></i>
              </div>
              <h3 className="mb-3">Assinatura Cancelada</h3>
              <p className="mb-4">
                O processo de assinatura foi cancelado. Se você encontrou algum problema, entre em contato com nosso suporte.
              </p>
              <Link to="/cadastro" className="btn btn-primary w-100 mb-3">
                Tentar Novamente
              </Link>
              <Link to="/" className="btn btn-outline-secondary w-100">
                Voltar para Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cancelado; 