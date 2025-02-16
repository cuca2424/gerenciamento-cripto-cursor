import { Link } from "react-router-dom";

function Sucesso() {
    return(
        <div className="sucesso">
            <div class="d-flex flex-center content-min-h">
                <div class="text-center py-9">
                    <h1 class="text-body-secondary fw-normal mb-5">Seja bem-vindo ao Projeto!</h1>
                    <Link to={"/login"} class="btn btn-lg btn-phoenix-primary">
                        Fazer Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Sucesso;