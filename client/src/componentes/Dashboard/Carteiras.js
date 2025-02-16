import { useState } from "react";
import moment from "moment";


function Carteiras({carteiras = null, funcaoRecarregar = () => console.log("test")}) {
    const [carteiraSelecionada, setCarteiraSelecionada] = useState(null);
    console.log("carteira: ", carteiraSelecionada);

    const abrirModal = (carteira) => {
        setCarteiraSelecionada(carteira);
    }

    const funcaoAbrirModal = (id) => {
      const modal = new window.bootstrap.Modal(document.getElementById(id));
      modal.show(); 
    };
  
    const funcaoFecharModal = (id) => {
      const modalElement = document.getElementById(id);
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }

    const formatarData = (data) => {
      return moment(data).format("HH:mm - DD/MM/YYYY");
    }

    const atualizarCarteiraSelecionada = (id_carteira) => {
      const novaCarteiraSelecionada = carteiras.find(carteira => carteira._id === id_carteira);

      if (novaCarteiraSelecionada) {
        setCarteiraSelecionada(novaCarteiraSelecionada);
      }
    }

    const deletarCarteira = async (id_carteira) => {
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/excluir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id_carteira: id_carteira })
      });

      if (response.ok) {
        console.log("alerta de sucesso.");
        funcaoRecarregar();
        funcaoFecharModal("modalCarteira");
      } else {
        console.log("alerta de falha.");
      }
    }

    const deletarAporte = async (id_aporte) => {
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/aporte/excluir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id_aporte: id_aporte })
      });

      if (response.ok) {
        console.log("alerta de sucesso.");
        funcaoRecarregar();
        const novaCarteira = {
          ...carteiraSelecionada,
          aportes: carteiraSelecionada.aportes.filter(aporte => aporte._id !== id_aporte)
        }
        setCarteiraSelecionada(novaCarteira);
        console.log("aportes: ",carteiraSelecionada.aportes);
      } else {
        console.log("alerta de falha.")
      }
    }

    return(
        <div class="card h-100 bg-dark">
          <div className="carteiras h-100 d-flex flex-column">
            <div class="mb-0 border-0 d-flex justify-content-between align-items-center">
                <div className="m-3">
                  <h4 class="text-body">Carteiras</h4>
                </div>

                <div class="d-flex gap-3 ms-auto align-items-center my-0 py-0">
                  <a class="btn btn-phoenix-primary" data-bs-toggle="modal"
                    data-bs-target="#modalCriarCarteira" href="#!">
                    <span class="fa-solid fa-plus me-2"></span>
                    <span className="d-none d-xl-inline">
                      Carteira
                    </span>
                    <span class="fas fa-wallet ms-2"></span>
                  </a>
                  
                  <a class="btn btn-phoenix-primary mx-2" data-bs-toggle="modal"
                    data-bs-target="#modalAdicionarAporte" href="#!">
                    <span class="fa-solid fa-plus me-2"></span>
                    <span className="d-none d-xl-inline">
                      Aporte
                    </span>
                    <span class="fas fa-coins ms-2"></span>
                  </a>
                </div>
          </div>

            <hr className="m-0"/>

                 
            <div key={carteiras ? "loaded" : "loading"} class="py-0 m-0 o-0 d-flex flex-grow-1 w-100">
                
                {
            !carteiras ? (
              <div className="d-flex flex-column justify-content-center align-items-center h-100 w-100">
                <i className="fa-solid fa-spinner fa-spin fa-3x"></i>
              </div>
          ) : 
          carteiras.length === 0 ? (
                <h5 className="d-flex justify-content-center align-items-center mt-5 w-100">Você não possui nenhuma carteira.</h5>
            ) : (
              <div class="table-responsive scrollbar mt-0 w-100">
                <table className="table fs-10 mb-0">
                <thead>
                    <tr>
                    <th className="text-start" style={{ minWidth: "100px" }}>
                        NOME DA CARTEIRA
                    </th>
                    <th className="text-end">VALOR TOTAL</th>
                    </tr>
                </thead>
                <tbody className="list" id="table-country-wise-visitors">
                    {
                    carteiras.map((carteira) => {
                        return (
                        <tr key={carteira._id}>
                            <td className="py-2 white-space-nowrap ps-0 country">
                            <h6
                                className="mb-0 ps-3 fw-bold fs-9 cursor-pointer"
                                data-bs-toggle="modal"
                                data-bs-target="#modalCarteira"
                                onClick={() => abrirModal(carteira)}
                            >
                                {carteira.nome}
                            </h6>
                            </td>
                            <td className="py-2 align-middle text-end">
                            <h6>
                                {carteira.valorTotalCarteira.toLocaleString('en', { style: 'currency', currency: 'USD' })}
                            </h6>
                            </td>
                        </tr>
                        );
                    })
            }
          </tbody>
        </table>
    </div>
      )
    }
                </div>


            <div
        className="modal fade"
        id="modalCarteira"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
                
                {/* ---------------------------- */}
                <div className="col-12 col-xl-12">
                <div className="card mb-3">
                  <div className="modal-content">
                    <div className="modal-body mb-0">
                      <div className="card-body" style={{height: "80vh"}}>
                        <div className="principal" style={{height: "60vh"}}>
                          {carteiraSelecionada && carteiraSelecionada.resultado.length > 0 ? (
                          <div>
                          <h4 className="text-center">Ativos</h4>
                          <div className="table-responsive scrollbar" style={{ overflowX: "auto", height: "60vh" }}>           
                            <table className="table fs-10">
                              <thead>
                                <tr>
                                  <th className="sort ps-0 align-middle" data-sort="country" style={{ minWidth: "100px" }}>CRIPTOMOEDA</th>
                                  <th className="sort align-middle" data-sort="users" style={{ minWidth: "115px" }}>PREÇO ATUAL</th>
                                  <th className="sort align-middle" data-sort="users" style={{ minWidth: "115px" }}>PREÇO MÉDIO</th>
                                  <th className="sort align-middle" data-sort="users" style={{ minWidth: "115px" }}>SALDO TOTAL</th>
                                  <th className="sort align-middle" data-sort="users" style={{ minWidth: "115px" }}>APORTE TOTAL</th>
                                  <th className="sort align-middle" data-sort="status" style={{ minWidth: "115px" }}>LUCRO/PREJUÍZO</th>
                                </tr>
                              </thead>
                              <tbody className="list">
                                {carteiraSelecionada.resultado.map(ativo => (
                                  <tr key={ativo.nome}> {/* Adicionando uma key para cada item mapeado */}
                                    <td className="py-2 white-space-nowrap ps-0 country">
                                      <a className="d-flex align-items-center text-primary py-md-1 py-xxl-0" href="#!">
                                        <img src={ativo.imagem} alt="" width="20" />
                                        <h6 className="mb-0 ps-3 fw-bold fs-9">{ativo.nome}</h6>
                                      </a>
                                    </td>
                                    <td className="py-2 align-middle users">
                                      <h6>{ativo.precoAtual.toLocaleString('en', { style: 'currency', currency: 'USD' })}</h6>
                                    </td>
                                    <td className="py-2 align-middle users">
                                      <h6>{ativo.precoMedio.toLocaleString('en', { style: 'currency', currency: 'USD' })}</h6>
                                    </td>
                                    <td className="py-2 align-middle users">
                                      <h6>{ativo.saldoTotal.toLocaleString('en', { style: 'currency', currency: 'USD' })}</h6>
                                    </td>
                                    <td className="py-2 align-middle users">
                                      <h6>{ativo.aporteTotal.toLocaleString('en', { style: 'currency', currency: 'USD' })}</h6>
                                    </td>
                                    <td className="py-2 align-middle users">
                                      <h6 className={ativo.lucroTotal.nominal < 0 ? "text-danger" : "text-success"}>
                                        {ativo.lucroTotal.nominal.toLocaleString('en', { style: 'currency', currency: 'USD' })} ({(ativo.lucroTotal.porcentual.toFixed(2))}%)
                                      </h6>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          </div>
                          ) : (
                            <div>
                              <h4 className="text-center">Você não possui nenhum ativo.</h4>
                            </div>
                          )}
                        </div>


                        
                        <div className="mt-6 d-flex justify-content-between flex-wrap gap-2">
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-phoenix-danger"
                              onClick={() => deletarCarteira(carteiraSelecionada._id)}
                            >
                              Deletar Carteira
                            </button>
                            <button
                              className="btn btn-phoenix-primary"
                              data-bs-toggle="modal"
                              data-bs-target="#modalAportes"
                            >
                              Visualizar Aportes
                            </button>
                          </div>
                            <button
                              type="button"
                              className="btn btn-phoenix-secondary"
                              data-bs-dismiss="modal"
                              >
                              Fechar
                            </button>
                        </div>

                      </div>
                    </div>
                  </div>


                {/* ---------------------------- */}
                  </div>
           </div>
          </div>
        </div>

        <div
        className="modal fade"
        id="modalAportes"
        tabIndex="-1"
        aria-labelledby="modalAportes"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
                
                {/* ---------------------------- */}
                <div className="col-12 col-xl-12">
                <div className="card mb-3">
                  <div className="modal-content">
                    <div className="modal-body mb-0">
                      <div className="card-body" style={{height: "80vh"}}>
                        <div className="principal" style={{height: "60vh"}}>
                          {
                            carteiraSelecionada && carteiraSelecionada.aportes.length > 0 ? (
                              <div>
                                <h4 className="text-center">Ativos</h4>
                                <div className="table-responsive scrollbar" style={{ overflowX: "auto", height: "60vh" }}>           
                                  <table className="table fs-10">
                                    <thead>
                                      <tr>
                                        <th className="sort ps-0 align-middle" data-sort="country" style={{ minWidth: "100px" }}>CRIPTOMOEDA</th>
                                        <th className="sort align-middle" data-sort="users" style={{ minWidth: "115px" }}>PREÇO DO ATIVO </th>
                                        <th className="sort align-middle" data-sort="users" style={{ minWidth: "115px" }}>QUANTIDADE</th>
                                        <th className="sort align-middle" data-sort="users" style={{ minWidth: "115px" }}>VALOR PAGO</th>
                                        <th className="sort align-middle" data-sort="users" style={{ minWidth: "115px" }}>DATA</th>
                                        <th className="sort align-middle" data-sort="users" style={{ minWidth: "30px" }}></th>
                                      </tr>
                                    </thead>
                                    <tbody className="list">
                                      {carteiraSelecionada.aportes.slice().reverse().map(aporte => (
                                          <tr>
                                            <td className="py-2 white-space-nowrap ps-0 country">
                                              <a className="d-flex align-items-center text-primary py-md-1 py-xxl-0" href="#!">
                                                <img src={carteiraSelecionada.resultado.find(ativo => ativo.id === aporte.criptomoeda).imagem} alt="" width="20" />
                                                <h6 className="mb-0 ps-3 fw-bold fs-9">{carteiraSelecionada.resultado.find(ativo => ativo.id === aporte.criptomoeda).nome}</h6>
                                              </a>
                                            </td>
                                            <td className="py-2 align-middle users">
                                              <h6>
                                                {aporte.preco.toLocaleString('en', { style: 'currency', currency: 'USD' })}
                                              </h6>
                                            </td>
                                            <td className="py-2 align-middle users">
                                              <h6>
                                                {aporte.quantidade}
                                              </h6>
                                            </td>
                                            <td className="py-2 align-middle users">
                                              <h6>
                                                {aporte.precoPago.toLocaleString('en', { style: 'currency', currency: 'USD' })}
                                              </h6>
                                            </td>
                                            <td className="py-2 align-middle users">
                                              <h6>
                                                {formatarData(aporte.data)}
                                              </h6>
                                            </td>
                                            <td className="py-2 align-middle users">
                                              <a onClick={() => deletarAporte(aporte._id)}>
                                                <i class="fa fa-trash" style={{cursor: "pointer"}}aria-hidden="true"></i>
                                              </a>
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <h4 className="text-center">Você não possui nenhum aporte.</h4>
                            )
                          }
                        </div>

                          <div className="mt-6 text-end">
                            <button
                              type="button"
                              className="btn btn-phoenix-secondary"
                              data-bs-dismiss="modal"
                              >
                              Fechar
                            </button>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        </div>
    )
}

export default Carteiras;