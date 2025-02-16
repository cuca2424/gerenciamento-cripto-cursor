import { useState, useEffect } from "react";
import Informativo1 from "../../componentes/Dashboard/Informativo1";
import Carteiras from "../../componentes/Dashboard/Carteiras";
import AdicionarAporte from "../../componentes/Dashboard/AdicionarAporte";
import CriarCarteira from "../../componentes/Dashboard/CriarCarteira";
import { useUser } from "../../contexts/UserContext";
import TestMaioresVariacoes from "../../componentes/Testes/TestMaioresVariacoes";
import "./Uteis/Altura.css";

function SentimentoDeMercado() {

  console.log(".env => ", process.env.REACT_APP_ENDPOINT_API);

  useEffect(() => {
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      if (args[0]?.includes("ResizeObserver loop completed with undelivered notifications")) {
        // Ignora o erro específico do ResizeObserver
        return;
      }
      originalConsoleError.apply(console, args); // Deixa outros erros passarem
    };
  }, []);

  {/* informações do usuário */}
  const { user } = useUser();
  const id_usuario = user?.id || null;
  console.log(id_usuario);

  {/* informações gerais */}
  const [dadosGerais, setDadosGerais] = useState({aportes: 0, saldo: 0, lucro: {nominal: 0, porcentual: 0}});
  const [reabrir, setReabrir] = useState(false);

  {/* criar carteira */}
  const [mensagemErroCriarCarteira, setMensagemErroCriarCarteira] = useState("");
  const [carteiras, setCarteiras] = useState(null);

  const pegarDados = async () => {
    try {
      const resposta = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteiras-detalhadas/${id_usuario}`);

      if (resposta.ok) {
        const dados = await resposta.json();
        setCarteiras(dados.carteirasComDetalhes);
        setDadosGerais(dados.dadosTotais);
      }
      
    } catch (err) {
      console.log("Erro ao buscar carteiras: ", err);
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
        pegarDados();
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
    pegarDados();
  }, [])

    return(
        <div className="setimentoDeMercado">
            <div class="col-12">
              <div class="row altura">

                <div class="col-12 col-md-6 h-50">
                  <Informativo1 
                  aportes={dadosGerais.aportes} 
                  saldo={dadosGerais.saldo} 
                  lucro={dadosGerais.lucro.nominal} 
                  lucroPorcentil={dadosGerais.lucro.porcentual}/>
                </div>

                <div class="col-12 col-md-6 p-2 h-50">
                  <div className="card h-100">
                    <div className="card-body">
                      <h4 className="text-center">Gráfico</h4>          
                    </div>
                  </div>                 
                </div>

                <div class="col-12 col-md-6 p-2 h-50">                 
                  <TestMaioresVariacoes />
                </div>

                <div class="col-12 col-md-6  p-2 h-50">
                    <Carteiras carteiras={carteiras} funcaoRecarregar={pegarDados}/>
                </div>

                <AdicionarAporte carteiras={carteiras} botaoCarteira={() => setReabrir(true)} funcaoRecarregar={pegarDados}/>
                
                <CriarCarteira botaoEnviar={funcaoCriarCarteira} mensagemErro={mensagemErroCriarCarteira}/>
              </div>
            </div>
        </div>
    )
}

export default SentimentoDeMercado;