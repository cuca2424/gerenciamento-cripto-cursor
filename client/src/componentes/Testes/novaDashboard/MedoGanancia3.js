function MedoGanancia3() {
    return(
        <div className="card h-100">

        <h4 class="text-body m-3">
            Índice de Medo e Ganância
        </h4>

        <hr className="m-0 mt-1"/>

        <div className="flex-grow-1">
            <div class="echart-gauge-grade-chart-example" style={{height:  "100%"}}></div>                  
        </div>

        <hr className="mt-0"/>

        <div style={{height: "120px"}}>

            <div className="px-2 pb-3 d-flex h-80">
            <div className="text-warning fs-8">
                    <i class="fab fa-ethereum fa-2x" style={{height: "32px", width: "32px"}}></i>
            </div>
                <p className="text-body-tertiary lh-sm mb-0 d-flex align-items-center px-3 flex-grow-1 fs-8" style={{maxWidth: "180px"}}>Altcoin Season</p>
                <span class="badge badge-phoenix badge-phoenix-primary fs-9 d-flex align-items-center justify-content-center">
                <span class="fa-solid fa-plus me-1">
                </span>
                23.35%
                </span>
            </div>
            <hr className="m-0" />
            <div className="p-2 pt-3 d-flex">
                <div className="text-primary fs-8">
                    <i class="fa-brands fa-bitcoin text-primary fa-2x" style={{height: "32px", width: "32px"}}></i>
                </div>

                <p className="text-body-tertiary lh-sm mb-0 d-flex align-items-center px-3 flex-grow-1 fs-8" style={{maxWidth: "180px"}}>Dominância BTC</p>

                <span class="badge badge-phoenix badge-phoenix-primary fs-9 d-flex align-items-center justify-content-center">
                <span class="fa-solid fa-plus me-1">
                </span>
                23.35%
                
                </span>
            </div>
        </div>

        </div>
    )
}

export default MedoGanancia3