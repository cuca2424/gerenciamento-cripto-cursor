import { useState } from "react";

function CriarCarteira( {botaoEnviar, mensagemErro} ) {
  const [nomeCarteira, setNomeCarteira] = useState("")
    return (
    <div
        className="modal fade"
        id="modalCriarCarteira"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-sm">
                
                {/* ---------------------------- */}
                  <div class="col-12 col-xl-12">
                      <div class="card">
                          <div className="modal-content">
                              <div className="modal-body">
                                  <div class="card-body">
                                    <h4 className="text-center">Criar Carteira</h4>
                                    <form id="criarCarteira" onSubmit={(e) => { 
                                      e.preventDefault();
                                      botaoEnviar(nomeCarteira);
                                    }
                                    }>
                                    <div class="col-auto m-3">
                                      <div className="form-floating">
                                        <input name="nomeCarteira" id="nomeCarteira" type="text" class="form-control" placeholder="Período" value={nomeCarteira} onChange={e => {
                                          setNomeCarteira(e.target.value)
                                          }}/>
                                        <label for="periodo">nome da carteira</label>
                                      </div>
                                    </div>
                                    <div className="mt-3 text-center align-items-center">

                                    <h6 className="text-danger mb-3">{mensagemErro}</h6>

                                    <button
                                        type="button"
                                        className="btn btn-phoenix-secondary mx-2"
                                        data-bs-dismiss="modal"
                                    >
                                        Fechar
                                    </button>
                                    <button type="submit" className="btn btn-phoenix-primary">
                                        Criar
                                    </button>
                                    </div>
                                    </form>
                              </div>
                          </div>
                      </div>
                {/* ---------------------------- */}
                  </div>
           </div>
          </div>
      </div>
    )
}

export default CriarCarteira;