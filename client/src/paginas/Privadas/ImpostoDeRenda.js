import Carteiras from "../../componentes/Dashboard/Carteiras"
import MaioresPerdas from "../../componentes/Testes/novaDashboard/MaioresPerdas"
import MaioresGanhos from "../../componentes/Testes/novaDashboard/MaioresGanhos"
import Informativo1 from "../../componentes/Dashboard/Informativo1"
import MedoGanancia from "../../componentes/Testes/novaDashboard/MedoGanancia"
import AporteSaldo from "../../componentes/Testes/novaDashboard/AporteSaldo"

function ImpostoDeRenda() {
    return(
      <div class="col-12">
        <div class="row altura">
          <div className="col-12 col-lg-6 col-xxl-4 h-50 p-2">
            <h2>Informativo1</h2>
            </div>
          <div className="col-12 col-lg-6 col-xxl-4 h-50 p-2 border-end border-start">
            <h2>MedoGanancia</h2>
          </div>
          <div className="col-12 col-lg-6 col-xxl-4 h-50 p-2">
            <h2>AporteSaldo</h2>
          </div>
          <div className="col-12 col-lg-6 col-xxl-4 h-50 p-2">
            <h2>MaioresGanhos</h2>
          </div>
          <div className="col-12 col-lg-6 col-xxl-4 h-50 p-2">
            <h2>MaioresPerdas</h2>
          </div>
          <div className="col-12 col-lg-6 col-xxl-4 h-50 p-2">
            <h2>Carteiras</h2>
          </div>
        </div>
      </div>
    )
}

export default ImpostoDeRenda