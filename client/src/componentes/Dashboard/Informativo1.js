function Informativo1({aportes, saldo, lucro, lucroPorcentil}) {
    return(
        <div className="informativo1 h-100 d-flex flex-column" style={{height: "100%", boxSizing: "border-box"}}>       
            <div className="p-4 h-100">
            <div className="row h-100">
                    {/* Primeiro Elemento */}
                    <div className="col-6 border-bottom border-end pb-4 pt-4 pt-xl-0 pt-xxl-4 pe-4 pe-sm-5 pe-xl-0 pe-xxl-5">
                    <h4 class="text-body mb-4 pt-2">
                            Aportes
                            <span class="fas fa-coins ms-2"></span>
                    </h4>
                        <div class="d-md-flex flex-between-center">
                            <div class="mt-4 mt-md-0">
                                <h4 class="text-body-highlight mb-2">{aportes.toLocaleString('en',{style: 'currency', currency: 'USD'})}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Segundo Elemento */}
                    <div className="col-6 border-bottom pb-4 pt-4 pt-xl-0 pt-xxl-4 pe-4 pe-sm-5 pe-xl-0 pe-xxl-5">
                    <h4 class="text-body mb-4 pt-2">
                        Saldo
                        <span class="fas fa-dollar-sign ms-2"></span>
                    </h4>
                        <div class="d-md-flex flex-between-center">
                            <div class="mt-4 mt-md-0">
                                <h4 class="text-body-highlight mb-2">{saldo.toLocaleString('en',{style: 'currency', currency: 'USD'})}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Terceiro Elemento */}
                    <div className="col-6 border-end pb-4 pt-4 pt-xl-0 pt-xxl-4 pe-4 pe-sm-5 pe-xl-0 pe-xxl-5">
                    <h4 class="text-body mb-4 pt-2">
                        Lucro
                        <span class="fas fa-chart-line ms-2"></span>
                    </h4>
                        <div class="d-md-flex flex-between-center">
                            <div class="mt-4 mt-md-0">
                                <h4 class="text-body-highlight mb-2">{lucro.toLocaleString('en',{style: 'currency', currency: 'USD'})}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Quarto Elemento */}
                    <div className="col-6  pt-4 pt-xl-0 pt-xxl-4 pe-4 pe-sm-5 pe-xl-0 pe-xxl-5">
                    <h4 class="text-body mb-4 pt-2">
                        Lucro
                        <span class="fas fa-percent ms-2"></span>
                    </h4>
                        <div class="d-md-flex flex-between-center">
                            <div class="mt-4 mt-md-0">
                                <h4 class="text-body-highlight mb-2">{lucroPorcentil}%</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Informativo1;