

function MaioresGanhos({dados}) {
    console.log("Nos maiores ganhos => ", dados)
    return (
    <div className="card h-100">

            <h4 class="text-body m-3">
                Maiores Ganhos
            </h4>

            <hr className="m-0 mt-1"/>

            {
                dados.length > 0 ? (
                    <table className="table fs-10 px-4">
                <thead>
                <tr >
                    <th className="text-start text-body-tertiary">Criptomoeda</th>
                    <th className="text-center text-body-tertiary">Preço</th>
                    <th className="text-end text-body-tertiary">Variação</th>
                </tr>
                </thead>
                <tbody className="list">
                {dados?.map(dado => {
                    return (
                        <tr className="text-start px-5">
                            <td className="py-2 white-space-nowrap ps-2 country">
                                <div
                                    className="d-flex align-items-center text-primary py-md-1 py-xxl-0"
                                    href="#!"
                                >
                                    <img
                                        src={dado.imagem}
                                        alt=""
                                        width="15"
                                    />
                                    <h6 className="mb-0 ps-3 fw-bold fs-9">
                                        {dado.nome}
                                    </h6>
                                </div>
                            </td>
                            <td className="py-2 text-center">
                                <h6>${dado.precoAtual.toFixed(8)}</h6>
                            </td>
                            <td className="py-2 text-end text-success">
                                <h6 className="text-success">{dado.variacao24h.toFixed(2)}%</h6>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
                ) : (
                    <div className="table-placeholder">
                    <table className="table fs-10 px-4">
                        <thead>
                            <tr>
                                <th className="text-start">
                                    <span className="placeholder-glow d-flex">
                                        <span className="placeholder col-6 justify-content-center"></span>
                                    </span>
                                </th>
                                <th className="text-center">
                                    <span className="placeholder-glow d-flex ">
                                        <span className="placeholder col-6 justify-content-center"></span>
                                    </span>
                                </th>
                                <th className="text-end">
                                    <span className="placeholder-glow d-flex">
                                        <span className="placeholder col-12 justify-content-center"></span>
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, index) => (
                                <tr key={index}>
                                    <td className="py-2">
                                        <div className="d-flex align-items-center">
                                            <span className="placeholder col-2 me-2"></span>
                                            <span className="placeholder col-6"></span>
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        <span className="placeholder col-4"></span>
                                    </td>
                                    <td className="py-2 text-end">
                                        <span className="placeholder col-5"></span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )
            }

            
        </div>
    )
}

export default MaioresGanhos;