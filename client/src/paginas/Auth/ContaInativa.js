import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function ContaInativa() {
  const [searchParams] = useSearchParams();
  const [gerandoCheckout, setGerandoCheckout] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    // Tentar pegar o email da URL primeiro
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      return;
    }

    // Se não tiver na URL, tentar pegar do localStorage
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser.email) {
      setEmail(savedUser.email);
    }
  }, [searchParams]);

  const handleReativarConta = async () => {
    try {
      if (!email) {
        setMensagemErro('Por favor, informe seu email.');
        return;
      }

      setGerandoCheckout(true);
      setMensagemErro('');

      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/checkout/reativar-conta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao gerar checkout');
      }

      // Redirecionar para o checkout do Stripe
      window.location.href = data.url;

    } catch (error) {
      setMensagemErro(error.message || 'Houve um erro ao tentar reativar sua conta.');
    } finally {
      setGerandoCheckout(false);
    }
  };

  return (
    <div className="container">
      <div className="row flex-center min-vh-100">
        <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
          <div className="card">
            <div className="card-body p-4 p-sm-5 text-center">
              <div className="text-warning mb-4">
                <i className="fas fa-exclamation-triangle fa-5x"></i>
              </div>
              <h3 className="mb-3">Conta Inativa</h3>
              <p className="mb-4">
                Sua conta está atualmente inativa devido à falta de pagamento. Para voltar a ter acesso completo à plataforma, 
                você precisa reativar sua assinatura.
              </p>
              
              <div className="mb-3 text-start">
                <label className="form-label" htmlFor="email">Email da sua conta</label>
                <div className="form-icon-container">
                  <input 
                    className="form-control form-icon-input" 
                    id="email" 
                    type="email" 
                    placeholder="nome@exemplo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <span className="fas fa-user text-body fs-9 form-icon"></span>
                </div>
              </div>
              
              <button 
                className="btn btn-primary w-100 mb-2"
                onClick={handleReativarConta}
                disabled={gerandoCheckout}
              >
                {gerandoCheckout ? 'Gerando checkout...' : 'Reativar Conta'}
              </button>

              {mensagemErro && (
                <div className="small text-danger mb-3">
                  {mensagemErro}
                </div>
              )}

              <div className="mt-4">
                <p className="text-muted mb-2">Precisa de ajuda?</p>
                <a 
                  href="https://wa.me/5562992871869?text=Olá!%20Preciso%20de%20ajuda%20com%20a%20aplicação.%20Como%20posso%20resolver%20o%20meu%20problema%3F"
                  className="text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Entre em contato com nosso suporte
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContaInativa;