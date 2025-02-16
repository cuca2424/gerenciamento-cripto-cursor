import GraficoAporteSaldo from "./GraficoAporteSaldo";

function AporteSaldo() {
    return(
        <div className="AporteSaldo h-100">
            <div class="card h-100">
                <div class="card-body">
                <div class="d-flex">
                    <div>
                    <h5 class="mb-1">Saldo / Aporte<span class="badge badge-phoenix badge-phoenix-warning rounded-pill fs-9 ms-2"> <span class="badge-label">+61.0%</span></span></h5>
                    <h6 class="text-body-tertiary">últimos 7 dias</h6>
                    </div>
                </div>
                <div class="d-flex flex-column justify-content-center align-items-center" style={{height: "150px"}}>
                    <GraficoAporteSaldo />
                </div>
                </div>
            </div>
        </div>
    )
}

export default AporteSaldo;