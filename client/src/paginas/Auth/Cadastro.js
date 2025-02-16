import { Link } from "react-router-dom";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";


function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [termosECondicoes, setTermosECondicoes] = useState(false);

  const [mensagemErro, setMensagemErro] = useState("");

  const [gerandoCheckout, setGerandoCheckout] = useState(false);

  const handleRegistro = async () => {

    const stripePromise = loadStripe(process.env.REACT_APP_PUBLIC_KEY);

    if (!nome || !email || !senha || !confirmarSenha) {
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
      const resposta = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/criar-sessao-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome,
          email: email,
          senha: senha,
        }),
      });

      const { sessionId } = await resposta.json();

      const stripe = await stripePromise;

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        setMensagemErro("Erro ao redirecionar para o checkout.")
      }

    } catch (err) {
      setMensagemErro("Houve um erro ao gerar o checkout.");

    } finally {
      setGerandoCheckout(false);
    } 
  }

    return (
        <div className="cadastro">
            <main class="main" id="top">
              <div class="container">
                <div class="row flex-center min-vh-100 py-5">
                  <div class="col-sm-10 col-md-8 col-lg-5 col-xl-5 col-xxl-3"><a class="d-flex flex-center text-decoration-none mb-4" href="">
                      <div class="d-flex align-items-center fw-bolder fs-3 d-inline-block"><img src="../../../assets/img/icons/logo.png" alt="phoenix" width="58" />
                      </div>
                    </a>
                    <div class="text-center mb-7">
                      <h3 class="text-body-highlight">Registrar-se</h3>
                      <p class="text-body-tertiary">Crie sua conta hoje</p>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleRegistro();
                        }
                        }>
                      <div class="mb-3 text-start">
                        <label class="form-label" for="name">Nome</label>
                        <input class="form-control" value={nome} id="inputNome" type="text" placeholder="Nome" onChange={e => setNome(e.target.value)} />
                      </div>
                      <div class="mb-3 text-start">
                        <label class="form-label" for="email">Endereço de Email</label>
                        <input class="form-control" value={email} id="inputEmail" type="email" placeholder="nome@exemplo.com" onChange={e => setEmail(e.target.value)} />
                      </div>
                      <div class="row g-3 mb-3">
                        <div class="col-sm-6">
                          <label class="form-label" for="password">Senha</label>
                          <div class="position-relative">
                            <input class="form-control form-icon-input" value={senha} id="inputSenha" type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)}/>
                          </div>
                        </div>
                        <div class="col-sm-6">
                          <label class="form-label" for="confirmPassword">Confirmar Senha</label>
                          <div class="position-relative" data-password="data-password">
                            <input class="form-control form-icon-input" value={confirmarSenha} id="confirmPassword" type="password" placeholder="Confirmar Senha" data-password-input="data-password-input" onChange={e => setConfirmarSenha(e.target.value)}/>
                          </div>
                        </div>
                      </div>
                      <div class="form-check mb-3">
                        <input class="form-check-input" value={termosECondicoes} id="termsService" type="checkbox" onChange={e => setTermosECondicoes(e.target.checked)} />
                        <label class="form-label fs-9 text-transform-none" for="termsService">Eu aceito os <a href="#!">termos </a>e a <a href="#!">politica de privacidade</a></label>
                      </div>
                      <div className="mb-3 text-center">
                        <h6 className="text-danger">{mensagemErro}</h6>
                      </div>
                      <button class="btn btn-primary w-100 mb-3" disabled={gerandoCheckout}>Registrar-se</button>
                      <div class="text-center"><Link to={"/login"} class="fs-9 fw-bold">Entrar em uma conta existente</Link></div>
                  </form>
                </div>
              </div>
            </div>
        </main>
    </div>
    )
}

export default Cadastro;