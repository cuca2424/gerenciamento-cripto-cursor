import { Link } from "react-router-dom";

function Cancelado() {
    return (
        <div className="cancelado">
            <div class="d-flex flex-center content-min-h">
                <div class="text-center py-9">
                    <h1 class="text-body-secondary fw-normal mb-5">Houve um erro durante o pagamento.</h1>
                    <Link to={"/cadastro"} class="btn btn-lg btn-primary">
                        Tentar Novamente
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Cancelado;