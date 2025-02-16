import { useState } from "react";

function TestMaioresVariacoes() {
    const [showLucros, setShowLucros] = useState(true);

    const toggleVariacoes = () => {
        setShowLucros(!showLucros);
    };

    const lucroData = [
        { name: "Dogecoin", price: "$0.33", variation: "+17%" },
        { name: "Bitcoin", price: "$25,000", variation: "+12%" },
        { name: "Ethereum", price: "$1,800", variation: "+10%" },
        { name: "BNB", price: "$300", variation: "+5%" },
    ];

    const prejuizoData = [
        { name: "Shiba Inu", price: "$0.00001", variation: "-8%" },
        { name: "Litecoin", price: "$60", variation: "-15%" },
        { name: "Ripple", price: "$0.50", variation: "-10%" },
        { name: "Solana", price: "$20", variation: "-20%" },
    ];

    const dataToShow = showLucros ? lucroData : prejuizoData;

    console.log(showLucros);

    return (
        <div className="card h-100">
            <div className="mb-0 border-0 d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center m-2">
                    <h3 className="text-body-highlight m-1">Maiores Variações</h3>
                    <div
                        className="btn btn-link text-decoration-none d-flex align-items-center"
                        onClick={toggleVariacoes}
                    >
                        <span className="fa fa-exchange fa-2x"></span>
                    </div>
                        
                </div>
            </div>

            
            


            <div className="row">
                <div className="col-12 px-5">
                    <table className="table fs-10 px-4 table-responsive scrollbar">
                        <thead>
                            <tr>
                                <th>Criptomoeda</th>
                                <th>Preço</th>
                                <th>Variação</th>
                            </tr>
                        </thead>
                        <tbody className="list">
                            {dataToShow.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-2 white-space-nowrap ps-0 country">
                                        <a
                                            className="d-flex align-items-center text-primary py-md-1 py-xxl-0"
                                            href="#!"
                                        >
                                            <img
                                                src="https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png"
                                                alt=""
                                                width="15"
                                            />
                                            <h6 className="mb-0 ps-3 fw-bold fs-9">
                                                {item.name}
                                            </h6>
                                        </a>
                                    </td>
                                    <td className="py-2 align-middle users">
                                        <h6>{item.price}</h6>
                                    </td>
                                    <td className="py-2 align-middle text-end">
                                        <h6
                                            className={
                                                showLucros
                                                    ? "text-success"
                                                    : "text-danger"
                                            }
                                        >
                                            {item.variation}
                                        </h6>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TestMaioresVariacoes;
