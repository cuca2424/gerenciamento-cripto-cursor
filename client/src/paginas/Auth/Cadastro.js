import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css"; // Estilo do input de telefone
import "./custom.css"
import { useNavigate } from "react-router-dom";

function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [termosECondicoes, setTermosECondicoes] = useState(false);
  const [telefone, setTelefone] = useState(""); // Estado para armazenar o telefone

  const [mensagemErro, setMensagemErro] = useState("");
  const [gerandoCheckout, setGerandoCheckout] = useState(false);

  const phoneInputRef = useRef(null);  // Cria a referência para o input
  const navigate = useNavigate();

  useEffect(() => {
      console.log("mudou o telefone...");
      console.log(telefone);
      if (phoneInputRef.current && telefone) {
        const inputElement = phoneInputRef.current.numberInputRef;
      if (inputElement) {
        inputElement.focus(); // Foca no input quando o telefone muda
      }
    }
    
  }, [telefone]);

  const handleRegistro = async () => {
    if (!nome || !email || !senha || !confirmarSenha || telefone.length < 5) {
      setMensagemErro("Preencha todos os campos para continuar!");
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
      setGerandoCheckout(true);

      const resposta = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
        }),
      });

      const data = await resposta.json();

      if (resposta.ok) {
        // Salvar token e dados do usuário
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirecionar para dashboard
        navigate("/dashboard");
      } else {
        setMensagemErro(data.error || "Erro ao criar conta");
      }
    } catch (err) {
      setMensagemErro("Houve um erro ao tentar criar sua conta. Tente novamente mais tarde.");
    } finally {
      setGerandoCheckout(false);
    }
  };

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

              <form onSubmit={(e) => {
                e.preventDefault();
                handleRegistro();
              }}>
                <div className="mb-3 text-start">
                  <label className="form-label" htmlFor="inputNome">Nome</label>
                  <input className="form-control" value={nome} id="inputNome" type="text" placeholder="Nome" onChange={e => setNome(e.target.value)} />
                </div>
                <div className="mb-3 text-start">
                  <label className="form-label" htmlFor="inputEmail">Endereço de Email</label>
                  <input className="form-control" value={email} id="inputEmail" type="email" placeholder="nome@exemplo.com" onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="inputSenha">Senha</label>
                    <div className="position-relative">
                      <input className="form-control form-icon-input" value={senha} id="inputSenha" type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="confirmPassword">Confirmar Senha</label>
                    <div className="position-relative">
                      <input className="form-control" value={confirmarSenha} id="confirmPassword" type="password" placeholder="Confirmar Senha" onChange={e => setConfirmarSenha(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* CAMPO DE TELEFONE */}
                <div className="mb-3 text-start">
                  <label className="form-label" htmlFor="telefone">Número</label>
                  <PhoneInput
                    ref={phoneInputRef}  // Referência ao componente PhoneInput
                    country="br" // Define o Brasil como padrão
                    value={telefone}
                    onChange={setTelefone} // Atualiza o estado ao selecionar a bandeira
                    inputClass="form-control custom-input w-100"
                    dropdownClass="custom-dropdown"
                    placeholder="+55 (11) 9 11111111"
                  />
                </div>


              <div className="form-check mb-3">
                  <input className="form-check-input" checked={termosECondicoes} id="termsService" type="checkbox" onChange={e => setTermosECondicoes(e.target.checked)} />
                  <label className="form-label fs-9 text-transform-none" htmlFor="termsService">Eu aceito os <a href="#!">termos</a> e a <a href="#!">política de privacidade</a></label>
                </div>

                <div className="mb-3 text-center">
                  <h6 className="text-danger">{mensagemErro}</h6>
                </div>
                <button className="btn btn-primary w-100 mb-3" disabled={gerandoCheckout}>Registrar-se</button>
                <div className="text-center"><Link to={"/login"} className="fs-9 fw-bold">Entrar em uma conta existente</Link></div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Cadastro;
