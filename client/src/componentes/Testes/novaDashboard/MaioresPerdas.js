const dados = [
    { url: "https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png",
    nome: "Dogecoin",
    preco: "$0.33",
    variacao: "+17%" },
    { url: "https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png",
    nome: "Bitcoin",
    preco: "$103,812",
    variacao: "+12%" },
    { url: "https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png",
    nome: "Ethereum",
    preco: "$2,871",
    variacao: "+11%" },
    { url: "https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png",
    nome: "Solana",
    preco: "$201.34",
    variacao: "+7%" },
];

function MaioresPerdas({dados}) {
    return (
    <div className="card h-100">

        <h4 class="text-body m-3">
                Maiores Perdas
            </h4>

            <hr className="m-0 mt-1"/>

            {
                dados.length > 0 ? (
<table className="table fs-10 px-4">
                <thead>
                <tr >
                    <th className="text-start">Criptomoeda</th>
                    <th className="text-center">Preço</th>
                    <th className="text-end">Variação</th>
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
                            <td className="py-2 text-end">
                                <h6 className="text-danger">{dado.variacao24h.toFixed(2)}%</h6>
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

export default MaioresPerdas;