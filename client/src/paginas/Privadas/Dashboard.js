import { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useEffect } from "react";

// componentes
import Carteiras from "../../componentes/Dashboard/Carteiras";
import AdicionarAporte from "../../componentes/Dashboard/AdicionarAporte";
import CriarCarteira from "../../componentes/Dashboard/CriarCarteira"
import AporteSaldo3 from "../../componentes/Testes/novaDashboard/AporteSaldo3";
import GraficoPizza from "../../componentes/Testes/novaDashboard/GraficoPizza";
import MaioresGanhos from "../../componentes/Testes/novaDashboard/MaioresGanhos";
import MaioresPerdas from "../../componentes/Testes/novaDashboard/MaioresPerdas";
import MedoGanancia3 from "../../componentes/Testes/novaDashboard/MedoGanancia3";



function Dashboard() {
  const { user } = useUser();
  const id_usuario = user?.id || null;

  const [carteiras, setCarteiras] = useState();
  const [dadosGerais, setDadosGerais] = useState(null);
  const [resultadoGeral, setResultadoGeral] = useState(null);

  const [dadosDashboard, setDadosDashboard] = useState();
  const [dadosGraficoPizza, setDadosGraficoPizza] = useState();
  const [dadosGraficoLinha, setDadosGraficoLinha] = useState();

  const [carteiraSelecionada, setCarteiraSelecionada] = useState();
  const [dadosAporteSaldo, setDadosAporteSaldo] = useState([]);

  const [maioresGanhos, setMaioresGanhos] = useState([]);
  const [maioresPerdas, setMaioresPerdas] = useState([]);

  const [mensagemErroCriarCarteira, setMensagemErroCriarCarteira] = useState("");
  const [reabrir, setReabrir] = useState(false);

  const atualizarDados = async () => {
    try {
      const resposta = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteiras-detalhadas/${id_usuario}`);

      if (resposta.ok) {
        const dados = await resposta.json();
        setCarteiras(dados.carteirasComDetalhes);
        setDadosGerais(dados.dadosTotais);
        setResultadoGeral(dados.resultadoGeral);
        console.log("carteiras: ", carteiras);
        console.log(dadosGerais)
        console.log(dados);
      }
      
    } catch (err) {
      console.log("Erro ao buscar carteiras: ", err);
    }
  }

  const dadosAdicionais = async () => {
    try {
      const resposta = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/maiores_variacoes`);

      if (resposta.ok) {
        const dados = await resposta.json();
        setMaioresGanhos(dados.maioresGanhos);
        setMaioresPerdas(dados.maioresPerdas);
      }
    } catch (err) {
      console.log("Erro ao buscar dados adicionais: ", err);
    }
  }

  // atualizarDados();
  console.log("Carteira Selecionada: ", carteiraSelecionada?.resultado);
  console.log("dados gráfico pizza: ", dadosDashboard);

  function selecionarCarteira() {
    const id_carteira = document.getElementById("option-carteiras").value;

    if (id_carteira === "todas_carteiras") {
      setDadosDashboard(dadosGerais);
      setDadosGraficoPizza(resultadoGeral);
      setDadosGraficoLinha({
        "aportes": dadosGerais.aportes,
        "saldo": dadosGerais.saldo
      })
    }

    const carteiraEscolhida = carteiras?.find(carteira => carteira._id === id_carteira);

    if (carteiraEscolhida) {
      setDadosDashboard({
        "aportes": carteiraEscolhida.totalAportesCarteira,
        "saldo": carteiraEscolhida.valorTotalCarteira,
        "lucro": carteiraEscolhida.lucroOuPrejuizo
      });
      setDadosGraficoPizza(carteiraEscolhida.resultado);
      setDadosGraficoLinha({
        "aportes": carteiraEscolhida.totalAportesCarteira,
        "saldo": carteiraEscolhida.valorTotalCarteira
      })
      setCarteiraSelecionada(carteiraEscolhida);
    }
  }

  const funcaoCriarCarteira = async (nomeCarteira) => {
    const req = {
      "id_usuario": id_usuario,
      "nome": nomeCarteira
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
    });

      if (response.ok) {
        atualizarDados();
        setMensagemErroCriarCarteira("");
        fecharModal("modalCriarCarteira");

        if (reabrir) {
          abrirModal('modalAdicionarAporte');
        }

      } else {
        const errorMessage = await response.text();
        setMensagemErroCriarCarteira(errorMessage);
        console.log(errorMessage)
      }

    } catch (err) {
      setMensagemErroCriarCarteira("Houve um erro interno.");
    }
  }

  // helpers
  const abrirModal = (id) => {
    const modal = new window.bootstrap.Modal(document.getElementById(id));
    modal.show(); 
  };

  const fecharModal = (id) => {
    const modalElement = document.getElementById(id);
    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
  }

  useEffect(() => {
    const modal = document.getElementById('modalCriarCarteira');
    modal.addEventListener("hidden.bs.modal", () => {
      setReabrir(false);
    })
    atualizarDados();
    dadosAdicionais();
    setDadosAporteSaldo([{ mes: "Julho", saldo: 900, aporte: 700 }]);
    console.log("___________________________________________________________________________")
    console.log("aportesaldo: ", dadosAporteSaldo);
  }, [])

  useEffect(() => {
    if (dadosGerais) {
      selecionarCarteira();
    }
  }, [dadosGerais]);


  return(
    <div className="col-12">
      <div className="row altura">
        <div className="p-2 h-100 col-12 h-sm-50 col-xxl-8">
        <div className="h-100 d-flex flex-column" style={{ padding: "1px" }}>


            <div className="d-flex">
              <h4 class="text-body m-3">
                  Visão Geral
              </h4>
              <select class="form-select form-select-sm ms-auto align-items-center mt-2 me-2" id="option-carteiras" style={{width: "200px", height: "40px"}} defaultValue="todas_carteiras" onChange={selecionarCarteira}>
                <option value="todas_carteiras" selected>Todas Carteiras</option>
                {
                  carteiras?.map(carteira => {
                    return (
                      <option value={carteira._id}>{carteira.nome}</option>
                    )
                  })
                }
              </select>
            </div>

            <hr className="m-0 mt-1"/>

            <div className="mx-0 row col-12 flex-grow-1">

              <div className="col-4 col-sm-2 border-end d-flex flex-column justify-content-between">
                  <div className="py-3 border-bottom">
                    <p class="text-body-tertiary mb-4 pt-2 d-flex fs-8">
                          Aportes
                      <div className="text-primary">
                          <span class="fas fa-coins ms-2"></span>
                      </div>                            
                    </p>
                    
                    <h5 class="text-body-highlight mb-2">
                      {dadosDashboard ? (
                        dadosDashboard?.aportes.toLocaleString('en',{style: 'currency', currency: 'USD'})
                      ) : (
                        <span className="placeholder-glow d-flex">
                            <span className="placeholder col-6 justify-content-center"></span>
                        </span>
                      )}
                    </h5>

                    
                  </div>
                  <div className=" py-3 border-bottom">
                    <p className="text-body-tertiary mb-4 pt-2 d-flex fs-8">
                      Saldo
                      <div className="text-success">
                        <span className="fas fa-dollar-sign ms-2"></span>
                      </div>
                    </p>

                    <h5 className="text-body-highlight mb-2">
                      {dadosDashboard ? (
                        dadosDashboard?.saldo.toLocaleString('en', {style: 'currency', currency: 'USD'})
                      ) : (
                        <span className="placeholder-glow d-flex">
                            <span className="placeholder col-6 justify-content-center"></span>
                        </span>
                      )}
                    </h5>
                  </div>

                  <div className="py-3">
                    <div class="d-flex align-items-center mb-2 gap-2 pt-2">
                      {dadosDashboard?.lucro.nominal < 0 ? (
                      <div className="d-flex align-items-center mb-3">
                        <p class="text-body-tertiary d-flex fs-8 mb-0">
                          Prejuízo
                        </p>
                          <div className="text-danger ms-2">
                            <span id="1" class="fw-bold" data-feather="trending-down" style={{width: "24px", height: "24px"}}></span>
                        </div>
                      </div>
                      ) : (
                        <div className="d-flex align-items-center mb-3">
                        <p class="text-body-tertiary d-flex fs-8 mb-0">
                          Lucro
                        </p>
                        <div className="text-success ms-2">
                          <span id="2" class="fw-bold" data-feather="trending-up" style={{width: "24px", height: "24px"}}></span>
                        </div>
                      </div>
                      )}

                      </div>
                      <h5 class="text-body-highlight mb-2">
                        {dadosDashboard ? (
                          `${dadosDashboard.lucro.nominal.toLocaleString('en',{style: 'currency', currency: 'USD'})} (${(dadosDashboard.lucro.porcentual ?? 0).toFixed(2)}%)`
                        ) : (
                          <span className="placeholder-glow d-flex">
                            <span className="placeholder col-6 justify-content-center"></span>
                          </span>
                        )}
                      </h5>
                  </div>
              </div>

              <div className="col-8 h-50 col-sm-5 h-sm-100 border-end-xl">
                <AporteSaldo3 dados={{aportes: [0, 0, 0, 0, 0, dadosGraficoLinha?.aportes], saldos: [0, 0, 0, 0, 0, dadosGraficoLinha?.saldo]}} />
              </div>


              <div className="col-12 h-50 col-sm-5 h-sm-100">
                <GraficoPizza dados={dadosGraficoPizza} />
              </div>

            </div>      
          </div>
        </div>
        <div className="p-2 h-50 col-12 col-sm-6 col-xxl-4">
            <MedoGanancia3 />
        </div>
        <div className="p-2 h-50 col-12 col-sm-6 col-xxl-4">
          <MaioresGanhos dados={maioresGanhos} />
        </div>
        <div className="p-2 h-50 col-12 col-sm-6 col-xxl-4">
          <MaioresPerdas dados={maioresPerdas} />
        </div>
        <div className="p-2 h-50 col-12 col-sm-6 col-xxl-4">
          <Carteiras carteiras={carteiras} funcaoRecarregar={atualizarDados}/>
        </div>
        <AdicionarAporte carteiras={carteiras} funcaoRecarregar={atualizarDados}/>
        <CriarCarteira botaoEnviar={funcaoCriarCarteira} mensagemErro={mensagemErroCriarCarteira}/>
      </div>
    </div>
  )
}

export default Dashboard;