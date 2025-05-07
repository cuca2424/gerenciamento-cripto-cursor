import React from 'react';
import { Link } from 'react-router-dom';

function Sucesso() {
  return (
    <div className="container">
      <div className="row flex-center min-vh-100">
        <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
          <div className="card">
            <div className="card-body p-4 p-sm-5 text-center">
              <div className="text-success mb-4">
                <i className="fas fa-check-circle fa-5x"></i>
              </div>
              <h3 className="mb-3">Assinatura Realizada com Sucesso!</h3>
              <p className="mb-4">
                Sua conta foi criada e sua assinatura está ativa. Você já pode começar a usar a plataforma.
              </p>
              <Link to="/login" className="btn btn-primary w-100">
                Fazer Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sucesso; 