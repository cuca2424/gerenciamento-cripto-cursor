function TestCarteira() {
    return(
        <div
        className="modal fade"
        id="modalCarteira"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
                
                {/* ---------------------------- */}
                  <div class="col-12 col-xl-12">
                      <div class="card mb-3">
                          <div className="modal-content">
                              <div className="modal-body mb-0">
                                  <div class="card-body">
                                    <h4 className="text-center">Ativos</h4>
                                  <div class="table-responsive scrollbar" style={{overflowX: "auto"}}>
                                  <table class="table fs-10">
                                      <thead>
                                        <tr>
                                          <th class="sort ps-0 align-middle" data-sort="country" style={{minWidth: "100px"}}>CRIPTOMOEDA</th>
                                          <th class="sort align-middle" data-sort="users" style={{minWidth: "115px"}}>PREÇO ATUAL</th>
                                          <th class="sort align-middle" data-sort="users" style={{minWidth: "115px"}}>PREÇO MÉDIO</th>
                                          <th class="sort align-middle" data-sort="users" style={{minWidth: "115px"}}>SALDO TOTAL</th>
                                          <th class="sort align-middle" data-sort="users" style={{minWidth: "115px"}}>APORTE TOTAL</th>
                                          <th class="sort align-middle" data-sort="status">LUCRO TOTAL</th>
                                        </tr>
                                      </thead> 
                                      <tbody class="list">
                                      <tr>
                                          <td class="py-2 white-space-nowrap ps-0 country"><a class="d-flex align-items-center text-primary py-md-1 py-xxl-0" href="#!"><img src="https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png?16…" alt="" width="20" />
                                              <h6 class="mb-0 ps-3 fw-bold fs-9">Dogecoin</h6>
                                          </a></td>
                                          <td class="py-2 align-middle users">
                                            <h6>$0,33</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>$0,24</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$1357,42</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$891,83</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$465,59 (52%)</h6>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td class="py-2 white-space-nowrap ps-0 country"><a class="d-flex align-items-center text-primary py-md-1 py-xxl-0" href="#!"><img src="https://coin-images.coingecko.com/coins/images/11939/large/shiba.png?1…" alt="" width="20" />
                                              <h6 class="mb-0 ps-3 fw-bold fs-9">Shiba Inu</h6>
                                          </a></td>
                                          <td class="py-2 align-middle users">
                                            <h6>$0,0000037</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>$0,0000028</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$678,65</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$459,87</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$218,78 (47%)</h6>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td class="py-2 white-space-nowrap ps-0 country"><a class="d-flex align-items-center text-primary py-md-1 py-xxl-0" href="#!"><img src="https://coin-images.coingecko.com/coins/images/29850/large/pepe-token.jpeg?1696528776" alt="" width="20" />
                                              <h6 class="mb-0 ps-3 fw-bold fs-9">Pepe</h6>
                                          </a></td>
                                          <td class="py-2 align-middle users">
                                            <h6>$0,00001786</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>$0,00001382</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$321,79</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$264,22</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$57,57 (21%)</h6>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td class="py-2 white-space-nowrap ps-0 country"><a class="d-flex align-items-center text-primary py-md-1 py-xxl-0" href="#!"><img src="https://coin-images.coingecko.com/coins/images/33566/large/dogwifhat.jpg?1702499428" alt="" width="20" />
                                              <h6 class="mb-0 ps-3 fw-bold fs-9">Dogwifhat</h6>
                                          </a></td>
                                          <td class="py-2 align-middle users">
                                            <h6>$1.74</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>$1.51</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$123,89</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$103,89</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$20 (19%)</h6>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td class="py-2 white-space-nowrap ps-0 country"><a class="d-flex align-items-center text-primary py-md-1 py-xxl-0" href="#!"><img src="https://coin-images.coingecko.com/coins/images/16746/large/PNG_image.png?1696516318" alt="" width="20" />
                                              <h6 class="mb-0 ps-3 fw-bold fs-9">FLOKI</h6>
                                          </a></td>
                                          <td class="py-2 align-middle users">
                                            <h6>$0,00016716</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>$0,0001367</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$89,45</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$78,92</h6>
                                          </td>
                                          <td class="py-2 align-middle users">
                                            <h6>R$11,57 (14%)</h6>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    </div>
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
    )
}

export default TestCarteira;