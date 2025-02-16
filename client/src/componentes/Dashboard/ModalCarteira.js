function ModalCarteira({carteiraSelecionada}) {
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
                      <div className="card-body">
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
                                  <th className="sort align-middle" data-sort="status">LUCRO/PREJUÍZO</th>
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

                              <div className="d-flex align-items-center justify-content-center mt-3">
                              <a class="btn btn-phoenix-primary" data-bs-toggle="modal"
                                  data-bs-target="#modalAdicionarAporte" href="#!">
                                  <span class="fa-solid fa-plus me-2"></span>
                                  <span className="d-none d-xl-inline">
                                    Aporte
                                  </span>
                                  <span class="fas fa-coins ms-2"></span>
                                </a>
                              </div>

                            </div>
                          )}
                        
                        <div className="mt-3 text-end">
                          <button
                            type="button"
                            className="btn btn-secondary mx-2"
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
}

export default ModalCarteira;