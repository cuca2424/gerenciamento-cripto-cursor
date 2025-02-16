import { useState } from "react";

function EsqueceuSenha() {
    const [email, setEmail] = useState("");
    const [mensagemErro, setMensagemErro] = useState("");

    const testeTrocar = () => {
      if (email) {
        setMensagemErro("");
        alert("Senha trocada com sucesso.")
      } else {
        setMensagemErro("Preencha o campo do email para prosseguir.")
      }
    }

    return (
        <main class="main" id="top">
          <div class="container">
            <div class="row flex-center min-vh-100 py-5">
              <div class="col-sm-10 col-md-8 col-lg-5 col-xxl-4"><a class="d-flex flex-center text-decoration-none mb-4" href="">
                <div class="d-flex align-items-center fw-bolder fs-3 d-inline-block"><img src="../../../assets/img/icons/logo.png" alt="phoenix" width="58" />
                </div>
              </a>
              <div class="px-xxl-5">
                <div class="text-center mb-6">
                  <h4 class="text-body-highlight">Esqueceu sua senha?</h4>
                  <p class="text-body-tertiary mb-5">Coloque seu email abaixo e vamos te enviar <br class="d-sm-none" />um link de troca.</p>
                  <form class="d-flex align-items-center mb-5" onSubmit={(e) => {
                    e.preventDefault();
                    testeTrocar();
                  }}>
                    <input class="form-control flex-1" id="email" type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
                    <button class="btn btn-primary ms-2">Enviar<span class="fas fa-chevron-right ms-2"></span></button>
                  </form>
                  <div className="mb-3 text-center">
                      <h6 className="text-danger">{mensagemErro}</h6>
                  </div>
                    <a class="fs-9 fw-bold" href="#!">Continua tendo problemas?</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    )
}

export default EsqueceuSenha;