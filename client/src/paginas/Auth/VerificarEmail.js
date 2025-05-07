import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function VerificarEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verificando');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const verificarEmail = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/auth/verify-email/${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao verificar email');
        }

        setStatus('sucesso');
        setMensagem(data.message);
      } catch (error) {
        setStatus('erro');
        setMensagem(error.message || 'Erro ao verificar email');
      }
    };

    verificarEmail();
  }, [token]);

  return (
    <div className="verificar-email">
      <main className="main" id="top">
        <div className="container">
          <div className="row flex-center min-vh-100 py-5">
            <div className="col-sm-10 col-md-8 col-lg-5 col-xl-5 col-xxl-3">
              <a className="d-flex flex-center text-decoration-none mb-4" href="">
                <div className="d-flex align-items-center fw-bolder fs-3 d-inline-block">
                  <img src="../../../assets/img/icons/logo.png" alt="phoenix" width="58" />
                </div>
              </a>
              
              <div className="card">
                <div className="card-body p-4 p-sm-5">
                  <div className="text-center">
                    {status === 'verificando' && (
                      <>
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Carregando...</span>
                        </div>
                        <h5 className="mt-3">Verificando seu email...</h5>
                      </>
                    )}
                    
                    {status === 'sucesso' && (
                      <>
                        <div className="text-success mb-4">
                          <i className="fas fa-check-circle fa-3x"></i>
                        </div>
                        <h3 className="mb-3">Email Verificado com Sucesso!</h3>
                        <p className="mb-3">{mensagem}</p>
                        <p className="text-muted">
                          Você já pode fechar esta página e continuar seu registro na página anterior.
                        </p>
                      </>
                    )}

                    {status === 'erro' && (
                      <>
                        <div className="text-danger mb-4">
                          <i className="fas fa-times-circle fa-3x"></i>
                        </div>
                        <h3 className="mb-3">Erro na Verificação</h3>
                        <p className="text-danger">{mensagem}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VerificarEmail; 