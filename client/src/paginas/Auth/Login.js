import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrarDeMim, setLembrarDeMim] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {

    if (!email || !senha) {
      setMensagemErro("Preencha todos os campos para continuar!");
      return;
    }

    try {
      const resposta = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: senha,
        }),
      });

      if (resposta.ok) {
        const data = await resposta.json();
        localStorage.setItem("token", data.token);
        setEmail("");
        setSenha("");
        setLembrarDeMim(false);
        navigate("/");
        window.location.reload();

      } else {
        const errorMessage = await resposta.text();
        setMensagemErro(errorMessage);
      }

    } catch (err) {
      setMensagemErro("Houve um erro interno.");
    }
  }

    return (
        <div className="login">
            <main class="main" id="top">
              <div class="container">
                <div class="row flex-center min-vh-100 py-5">
                  <div class="col-sm-10 col-md-8 col-lg-5 col-xl-5 col-xxl-3"><a class="d-flex flex-center text-decoration-none mb-4" href="">
                  <div class="d-flex align-items-center fw-bolder fs-3 d-inline-block"><img src="../../../assets/img/icons/logo.png" alt="phoenix" width="58" />
                  </div>
                </a>
                <div class="text-center mb-7">
                  <h3 class="text-body-highlight">Entrar</h3>
                  <p class="text-body-tertiary">Tenha acesso à sua conta</p>
                </div>

                <div class="mb-3 text-start">
                  <label class="form-label" for="email">Endereço de Email</label>
                  <div class="form-icon-container">
                    <input class="form-control form-icon-input" id="email" type="email" placeholder="nome@exemplo.com" onChange={e => setEmail(e.target.value)} /><span class="fas fa-user text-body fs-9 form-icon"></span>
                  </div>
                </div>
                <div class="mb-3 text-start">
                  <label class="form-label" for="password">Senha</label>
                  <div class="form-icon-container">
                    <input class="form-control form-icon-input pe-6" id="password" type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} /><span class="fas fa-key text-body fs-9 form-icon"></span>
                  </div>
                </div>
                <div class="row flex-between-center mb-3">
                  <div class="col-auto">
                    <div class="form-check mb-0">
                      <input class="form-check-input" id="lembrarDeMim" type="checkbox" onChange={e => setLembrarDeMim(e.target.checked)}/>
                      <label class="form-check-label mb-0" for="basic-checkbox">Lembrar de mim</label>
                    </div>
                  </div>
                  <div class="col-auto"><Link to={"/esqueceu_senha"} class="fs-9 fw-semibold" >Esqueceu a senha?</Link></div>
                </div>
                <div className="mb-3 text-center">
                    <h6 className="text-danger">{mensagemErro}</h6>
                </div>
                <button class="btn btn-primary w-100 mb-3" onClick={(e) => {
                    e.preventDefault();
                    handleLogin();
                }}>Entrar</button>
                <div class="text-center"><Link to={"/cadastro"} class="fs-9 fw-bold">Criar uma conta</Link></div>
            </div>
          </div>
        </div>
      </main>
    </div>
    )
}

export default Login;