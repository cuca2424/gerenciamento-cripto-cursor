function AporteSaldo2() {
    return(
        <div className="aporte-saldo h-100 d-flex flex-column">

        <div className="flex-grow-1">
            <div className="h-100">
                <div class="echart-line-chart-example" style={{height: "100%", boxSizing: "border-box", }}></div>
            </div>
        </div>
        <hr className="m-0" />
        <div className="row px-3 py-1" style={{height: "100px"}}>

            <div className="col-4 h-100 border-end">
                <p class="text-body-tertiary mb-4 pt-2 d-flex fs-8">
                        Aportes
                    <div className="text-primary">
                        <span class="fas fa-coins ms-2"></span>
                    </div>                            
                </p>
                <h5 class="text-body-highlight mb-2">
                    $1,821.00
                </h5>
            </div>
            <div className="col-4 h-100 border-end">
                <p class="text-body-tertiary mb-4 pt-2 d-flex fs-8">
                    Saldo
                    <div className="text-success">
                        <span class="fas fa-dollar-sign ms-2"></span>
                    </div>
                </p>
                <h5 class="text-body-highlight mb-2">
                    $2,345.00
                </h5>
            </div>
            <div className="col-4 h-100">
                <div class="d-flex align-items-center mb-2 gap-2 pt-2">
                    <p class="text-body-tertiary d-flex fs-8">
                    Lucro/Prejuízo
                    <div className="text-danger ms-2">
                        <span class="fw-bold" data-feather="trending-down" style={{width: "24px", height: "24px"}}></span>
                    </div>
                    </p>
                </div>
                <h5 class="text-body-highlight mb-2">
                    $541.00 (28%)
                </h5>
            </div>

        </div>
        </div>
    )
}

export default AporteSaldo2;