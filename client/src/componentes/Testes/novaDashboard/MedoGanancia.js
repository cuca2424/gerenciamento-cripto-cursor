function MedoGanancia() {
    return (
        <div className="medo-ganancia h-100 d-flex flex-column">
            <h4 className="text-body m-2">Índice de medo e ganância</h4>
            <hr className="mt-2"/>
              <div className="flex-grow-1">
                <div class="echart-basic-gauge-chart-example" style={{height: "100%"}}></div>
              </div>
              <hr className="m-0" />

              <div style={{height: "100px"}}>

                <div className="p-2 pt-3 d-flex h-80">
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
                <div className="p-2 d-flex">
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

export default MedoGanancia;