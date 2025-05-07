import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css"; // Estilo do input de telefone
import "./custom.css"
import { useNavigate } from "react-router-dom";

// Inicializar Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [termosECondicoes, setTermosECondicoes] = useState(false);
  const [telefone, setTelefone] = useState(""); // Estado para armazenar o telefone
  const [emailVerificado, setEmailVerificado] = useState(false);
  const [registroIniciado, setRegistroIniciado] = useState(false);

  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [gerandoCheckout, setGerandoCheckout] = useState(false);

  const phoneInputRef = useRef(null);  // Cria a referência para o input
  const navigate = useNavigate();

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (field) {
        case 'nome':
          document.getElementById('inputEmail').focus();
          break;
        case 'email':
          document.getElementById('inputSenha').focus();
          break;
        case 'senha':
          document.getElementById('confirmPassword').focus();
          break;
        case 'confirmarSenha':
          if (phoneInputRef.current) {
            phoneInputRef.current.numberInputRef.focus();
          }
          break;
        case 'telefone':
          document.getElementById('termsService').focus();
          break;
        case 'termos':
          handleRegistro(e);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    if (phoneInputRef.current && telefone) {
      const inputElement = phoneInputRef.current.numberInputRef;
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [telefone]);

  const handleRegistro = async (e) => {
    e.preventDefault();
    
    if (!nome || !email || !senha || !confirmarSenha || telefone.length < 5) {
      setMensagemErro("Preencha todos os campos para continuar!");
      return;
    }

    if (senha.length < 6) {
      setMensagemErro("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagemErro("As senhas devem ser iguais.");
      return;
    }

    if (!termosECondicoes) {
      setMensagemErro("Por favor, aceite os termos e condições.");
      return;
    }

    try {
      if (!registroIniciado) {
        // Primeiro, registrar o usuário
        const registerResponse = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            email,
            senha,
            telefone,
          }),
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
          throw new Error(registerData.error || registerData.message || 'Erro ao registrar usuário');
        }

        setRegistroIniciado(true);
        setMensagemErro("Por favor, verifique seu email para continuar com o registro.");
        return;
      }

      // Se o registro já foi iniciado e o email foi verificado, prosseguir com o checkout
      if (emailVerificado) {
        setGerandoCheckout(true);
        const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/checkout/criar-sessao-checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            email,
            senha,
            telefone,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Erro ao criar sessão de checkout');
        }

        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagemErro(error.message || "Houve um erro ao processar o registro.");
      setRegistroIniciado(false); // Resetar o estado para permitir nova tentativa
    } finally {
      setGerandoCheckout(false);
    }
  };

  // Verificar status do email quando o componente montar e quando registroIniciado mudar
  useEffect(() => {
    const verificarStatusEmail = async () => {
      if (registroIniciado && email) {
        try {
          const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/auth/check-email-verification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();
          if (data.verified && !emailVerificado) {
            setEmailVerificado(true);
            setMensagemErro("");
            setMensagemSucesso("Email verificado com sucesso! Você já pode prosseguir com o registro.");
          }
        } catch (error) {
          console.error("Erro ao verificar status do email:", error);
        }
      }
    };

    const interval = setInterval(verificarStatusEmail, 5000);
    return () => clearInterval(interval);
  }, [registroIniciado, email, emailVerificado]);

  useEffect(() => {
    const savedTermosECondicoes = localStorage.getItem("termosECondicoes");
    if (savedTermosECondicoes !== null) {
      setTermosECondicoes(JSON.parse(savedTermosECondicoes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("termosECondicoes", JSON.stringify(termosECondicoes));
  }, [termosECondicoes]);

  return (
    <div className="cadastro">
      <main className="main" id="top">
        <div className="container">
          <div className="row flex-center min-vh-100 py-5">
            <div className="col-sm-10 col-md-8 col-lg-5 col-xl-5 col-xxl-3">
              <a className="d-flex flex-center text-decoration-none mb-4" href="">
                <div className="d-flex align-items-center fw-bolder fs-3 d-inline-block">
                  <img src="../../../assets/img/icons/logo.png" alt="phoenix" width="58" />
                </div>
              </a>
              <div className="text-center mb-7">
                <h3 className="text-body-highlight">Registrar-se</h3>
                <p className="text-body-tertiary">Crie sua conta hoje</p>
              </div>

              <form onSubmit={handleRegistro}>
                <div className="mb-3 text-start">
                  <label className="form-label" htmlFor="inputNome">Nome</label>
                  <input 
                    className="form-control" 
                    value={nome} 
                    id="inputNome" 
                    type="text" 
                    placeholder="Nome" 
                    onChange={e => setNome(e.target.value)}
                    onKeyPress={e => handleKeyPress(e, 'nome')}
                  />
                </div>
                <div className="mb-3 text-start">
                  <label className="form-label" htmlFor="inputEmail">Endereço de Email</label>
                  <input 
                    className="form-control" 
                    value={email} 
                    id="inputEmail" 
                    type="email" 
                    placeholder="nome@exemplo.com" 
                    onChange={e => setEmail(e.target.value)}
                    onKeyPress={e => handleKeyPress(e, 'email')}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="inputSenha">Senha</label>
                    <div className="position-relative">
                      <input 
                        className="form-control form-icon-input" 
                        value={senha} 
                        id="inputSenha" 
                        type="password" 
                        placeholder="Senha" 
                        onChange={e => setSenha(e.target.value)}
                        onKeyPress={e => handleKeyPress(e, 'senha')}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="confirmPassword">Confirmar Senha</label>
                    <div className="position-relative">
                      <input 
                        className="form-control" 
                        value={confirmarSenha} 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="Confirmar Senha" 
                        onChange={e => setConfirmarSenha(e.target.value)}
                        onKeyPress={e => handleKeyPress(e, 'confirmarSenha')}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label" htmlFor="telefone">Número</label>
                  <PhoneInput
                    ref={phoneInputRef}
                    country="br"
                    value={telefone}
                    onChange={setTelefone}
                    inputClass="form-control custom-input w-100"
                    dropdownClass="custom-dropdown"
                    placeholder="+55 (11) 9 11111111"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('termsService').focus();
                      }
                    }}
                  />
                </div>

                <div className="form-check mb-3">
                  <input 
                    className="form-check-input" 
                    checked={termosECondicoes} 
                    id="termsService" 
                    type="checkbox" 
                    onChange={e => setTermosECondicoes(e.target.checked)}
                    onKeyPress={e => handleKeyPress(e, 'termos')}
                  />
                  <label className="form-label fs-9 text-transform-none" htmlFor="termsService">
                    Eu aceito os <a href="#!">termos</a> e a <a href="#!">política de privacidade</a>
                  </label>
                </div>

                <div className="mb-3 text-center">
                  {mensagemErro && <h6 className="text-danger">{mensagemErro}</h6>}
                  {mensagemSucesso && <h6 className="text-success">{mensagemSucesso}</h6>}
                </div>
                <button 
                  className="btn btn-primary w-100 mb-3" 
                  type="submit" 
                  disabled={gerandoCheckout || (registroIniciado && !emailVerificado)}
                >
                  {gerandoCheckout ? 'Gerando checkout...' : 
                   (registroIniciado && !emailVerificado) ? 'Confirme o seu email para continuar' : 'Registrar-se'}
                </button>
                <div className="text-center">
                  <Link to={"/login"} className="fs-9 fw-bold">
                    Entrar em uma conta existente
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Cadastro;
