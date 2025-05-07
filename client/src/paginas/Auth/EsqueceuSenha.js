import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function EsqueceuSenha() {
    const [email, setEmail] = useState("");
    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemSucesso, setMensagemSucesso] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async () => {
      if (!email) {
        setMensagemErro("Preencha o campo do email para prosseguir.");
        return;
      }

      try {
        setLoading(true);
        setMensagemErro("");
        setMensagemSucesso("");
        

        const response = await axios.post(`${process.env.REACT_APP_ENDPOINT_API}/auth/forgot-password`, {
          email
        });

        setMensagemSucesso("Um email com instruções para redefinir sua senha foi enviado.");
        setEmail("");
      } catch (error) {
        console.error('Erro completo:', error);
        
        // Tratamento mais detalhado do erro
        if (error.response && error.response.data) {
          // Verifica se existe a mensagem de erro do backend
          setMensagemErro(error.response.data.message || error.response.data);
        } else if (error.request) {
          // A requisição foi feita mas não houve resposta
          setMensagemErro("Não foi possível conectar ao servidor. Verifique sua conexão.");
        } else {
          // Algo aconteceu na configuração da requisição
          setMensagemErro("Erro ao processar sua solicitação. Por favor, tente novamente.");
        }
      } finally {
        setLoading(false);
      }
    }

    return (
        <main className="main" id="top">
          <div className="container">
            <div className="row flex-center min-vh-100 py-5">
              <div className="col-sm-10 col-md-8 col-lg-5 col-xxl-4">
                <Link to="/" className="d-flex flex-center text-decoration-none mb-4">
                  <div className="d-flex align-items-center fw-bolder fs-3 d-inline-block">
                    <img src="/assets/img/icons/logo.png" alt="phoenix" width="58" />
                  </div>
                </Link>
                <div className="px-xxl-5">
                  <div className="text-center mb-6">
                    <h4 className="text-body-highlight">Esqueceu sua senha?</h4>
                    <p className="text-body-tertiary mb-5">
                      Coloque seu email abaixo e vamos te enviar <br className="d-sm-none" />
                      um link de troca.
                    </p>
                    <form className="d-flex align-items-center mb-5" onSubmit={(e) => {
                      e.preventDefault();
                      handleForgotPassword();
                    }}>
                      <input 
                        className="form-control flex-1" 
                        id="email" 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={loading}
                      />
                      <button 
                        className="btn btn-primary ms-2" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          "Enviar"
                        )}
                      </button>
                    </form>
                    {mensagemErro && (
                      <div className="mb-3 text-center">
                        <h6 className="text-danger">{mensagemErro}</h6>
                      </div>
                    )}
                    {mensagemSucesso && (
                      <div className="mb-3 text-center">
                        <h6 className="text-success">{mensagemSucesso}</h6>
                      </div>
                    )}
                    
                    <hr className="my-4" />
                    <div className="text-center">
                      <p className="text-body-highlight mb-2">Precisa de ajuda?</p>
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
        </main>
    )
}

export default EsqueceuSenha;