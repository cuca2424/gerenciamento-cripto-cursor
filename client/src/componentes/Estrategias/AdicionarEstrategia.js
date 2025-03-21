import { useState, useEffect, useCallback } from "react";
import { useUser } from "../../contexts/UserContext";

function AdicionarEstrategia({funcaoRecarregar}) {

    const { user } = useUser();
    const id_usuario = user?.id || null;

    // useStates
    const [criptomoedas, setCriptomoedas] = useState([]);
    const [criptomoedaNome, setCriptomoedaNome] = useState(""); // Nome visível no input
    const [criptomoedaSimbolo, setCriptomoedaSimbolo] = useState(""); // Símbolo enviado no formulário
    const [filteredList, setFilteredList] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);



    //////////////////////////////////////////////////////////////////
    const [mensagemErroAdicionarAporte, setMensagemErroAdicionarAporte] = useState("");
    const [periodo, setPeriodo] = useState("diario");

    const [criptomoeda, setCriptomoeda] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [preco, setPreco] = useState("");
    const carteiraForm = document.getElementById("formCarteira");

    const handleKeyDown = (e, nextField) => {
        if (e.key === 'Enter') {
          e.preventDefault(); 
          document.getElementById(nextField).focus();
        }
      };
    
    const closeModal = (id) => {
        const modalElement = document.getElementById(id);
        const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      }

      const formatarFormulario = () => {
        setMensagemErroAdicionarAporte("");
        
        // Infos principais
        setNomeEstrategia("");
        setPeriodoFiltros("diario");
        
        // Condições
        setCondicaoRSIrapido("maior");
        setCondicaoRSILento("maior");
        setCondicaoEMA20("maior");
        setCondicaoEMA50("maior");
    
        // Valores
        setValorRSIrapido("");
        setValorRSILento("");
        setValorEMA20("");
        setValorEMA50("");
    };



    // infos principais
    const [nomeEstrategia, setNomeEstrategia] = useState("");
    const [periodoFiltros, setPeriodoFiltros] = useState("diario");

    // condicoes
    const [condicaoRSIrapido, setCondicaoRSIrapido] = useState("maior");
    const [condicaoRSILento, setCondicaoRSILento] = useState("maior");
    const [condicaoEMA20, setCondicaoEMA20] = useState("maior");
    const [condicaoEMA50, setCondicaoEMA50] = useState("maior");

    // valores
    const [valorRSIrapido, setValorRSIrapido] = useState("");
    const [valorRSILento, setValorRSILento] = useState("");
    const [valorEMA20, setValorEMA20] = useState("");
    const [valorEMA50, setValorEMA50] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        console.log("Nome da estratégia => ", nomeEstrategia);
        console.log("Périodo filtros => ", periodoFiltros);
        console.log("RSI Rápido => ", condicaoRSIrapido, valorRSIrapido);
        console.log("RSI Lento => ", condicaoRSILento, valorRSILento);
        console.log("EMA 20d => ", condicaoEMA20, valorEMA20);
        console.log("EMA 50d => ", condicaoEMA50, valorEMA50);

        const indicadores = [
            { id: "condicao_rsi_rapida", nome: "rsi-rapido", periodo: periodoFiltros == "mensal" ? 7 : 14 , valor: valorRSIrapido},
            { id: "condicao_rsi_lenta", nome: "rsi-lento", periodo: periodoFiltros == "mensal" ? 7 : 14, valor: valorRSILento },
            { id: "condicao_ema_20", nome: "ema", periodo: 20, valor: valorEMA20 },
            { id: "condicao_ema_50", nome: "ema", periodo: 50, valor: valorEMA50 },
        ];
    
        let parametros = [];
    
        indicadores.forEach(indicador => {
            const condicao = document.getElementById(indicador.id)?.value;
            const valor = indicador.valor
            if (valor) {
              parametros.push(`${indicador.nome}_${periodoFiltros}_${indicador.periodo}_${condicao}=${indicador.valor}`);
            }
        });
    
        const queryString = parametros.length ? `?${parametros.join("&")}` : "";
    
        console.log("Requisição montada:", queryString); 

        if (nomeEstrategia.length < 1) {
            setMensagemErroAdicionarAporte("Coloque o nome da estratégia para prosseguir.");
            return;
        }

        if (queryString.length < 1) {
            setMensagemErroAdicionarAporte("Selecione os indicadores para prosseguir.");
            return;
        }

        function formatarString(queryString) {
            return queryString
              .substring(1) // Remove o "?"
              .split("&") // Divide cada filtro
              .map(filtro => {
                let [chave, valor] = filtro.split("="); // Separa nome do filtro e valor
                let partes = chave.replace("-", "_").split("_"); // Substitui "-" por "_" e divide
          
                // Ajustando os nomes dos indicadores
                let nome = partes[0].toUpperCase(); // RSI, EMA, etc.
                let periodo = partes.find(p => !isNaN(p)); // Número (se existir)
                let tipo = partes.includes("diario") ? "Diário" : partes.includes("semanal") ? "Semanal" : partes.includes("mensal") ? "Mensal" : "";
                let descricao = partes.includes("menor") ? "menor que" : "maior que";
          
                // Ajustando nomes específicos
                if (partes[0] === "rsi") nome = "RSI " + (partes[1] ? partes[1][0].toUpperCase() + partes[1].slice(1) : ""); // RSI Rápido
                if (partes[0] === "ema") nome = `EMA ${periodo}D`;
          
                return `${nome} ${tipo} ${descricao} ${valor}`;
              })
              .join("  |  "); // Junta os elementos formatados
          }

        const descricao = formatarString(queryString);

        try {
            const resposta = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/estrategias`, {
                method: "POST", // Método HTTP
                headers: {
                  "Content-Type": "application/json", // Tipo de conteúdo enviado
                },
                body: JSON.stringify({
                  nome: nomeEstrategia, 
                  string_filtro: queryString,
                  id_usuario: id_usuario,
                  descricao: descricao,
                  periodo: periodoFiltros
                }),
              })
            if (resposta.ok) {
                closeModal("modalAdicionarEstrategia");
                formatarFormulario();
                funcaoRecarregar();
                window.feather.replace();
            }
          } catch (err) {
            console.log("Erro ao buscar dados adicionais: ", err);
          }
        }


        // apagar campos quando fechar modal
        useEffect(() => {
            const modalElement = document.getElementById("modalAdicionarEstrategia");
         
            modalElement.addEventListener("hidden.bs.modal", formatarFormulario);
        
            return () => {
            modalElement.removeEventListener("hidden.bs.modal", formatarFormulario);
            };
        }, []);

        

    return(
        <div className="adicionarAporte">
            {/* Modal */}
            <div
                className="modal fade"
                id="modalAdicionarEstrategia"
                tabIndex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-md">
                
              {/* ---------------------------- */}
                <div class="col-12 col-xl-12">
                    <div class="card mb-3">
                        <div className="modal-content">
                            <div className="modal-body mb-0">
                                <form onSubmit={(e) => handleSubmit(e)}>
                                <div class="card-body">
                                    <h4 class="card-title mb-4">Adicionar Estratégia</h4>
                                    <div class="row gx-3">
                                        
                                        <div class="col-12 col-sm-6 col-xl-12">
                                            <div class="mb-4">
            
                                            <div className="row">
                                                {/* Input ocupando 2/3 da linha */}
                                                <div className="col-8 pe-2 ps-4">
                                                    <div className="form-floating">
                                                    <input 
                                                        name="nomeCarteira" 
                                                        id="nome_estrategia" 
                                                        type="text" 
                                                        className="form-control" 
                                                        placeholder="Nome da estratégia"
                                                        value={nomeEstrategia}
                                                        onChange={e => setNomeEstrategia(e.target.value)}
                                                    />
                                                    <label htmlFor="nomeCarteira">Nome da estratégia</label>
                                                    </div>
                                                </div>

                                                {/* Dropdown ocupando 1/3 da linha */}
                                                <div className="col-4 pe-4 ps-2">
                                                    <div className="form-floating">
                                                    <select 
                                                        className="form-select" 
                                                        id="periodo_filtros"
                                                        value={periodoFiltros}
                                                        onChange={e => setPeriodoFiltros(e.target.value)}>
                                                        <option value="diario">Diário</option>
                                                        <option value="semanal">Semanal</option>
                                                        <option value="mensal">Mensal</option>
                                                    </select>
                                                    <label htmlFor="periodo">Período</label>
                                                    </div>
                                                </div>
                                                </div>

                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-6 col-xl-12 ">
                                            <div class="mb-4">
                                                <h5 class="mb-2 text-body-highlight">RSI</h5>
                                                <div className="row w-100 ms-0">
                                                    {/* Bloco 1 */}
                                                    <div className="col-12 col-md-6  m-0 p-0 pe-2 ps-2">
                                                        <div className="d-flex align-items-center gap-2 mb-3 w-100">
                                                        {/* Caixa fixa com "RÁPIDA" */}
                                                        <span className="form-control text-center" style={{ maxWidth: "100px" }}>RÁPIDO</span>

                                                        {/* Caixa de seleção */}
                                                        <select 
                                                            name="condição"
                                                            id="condicao_rsi_rapida"
                                                            className="form-select"
                                                            value={condicaoRSIrapido}
                                                            onChange={e => setCondicaoRSIrapido(e.target.value)}
                                                            style={{ maxWidth: "120px" }}>
                                                            <option value="maior">Maior que</option>
                                                            <option value="menor">Menor que</option>
                                                        </select>

                                                        {/* Campo numérico */}
                                                        <input 
                                                            type="number"
                                                            min="0" 
                                                            id="valor_rsi_rapida"
                                                             className="form-control" 
                                                             placeholder="Valor" 
                                                             value={valorRSIrapido}
                                                             onChange={e => setValorRSIrapido(e.target.value)}
                                                             style={{ maxWidth: "150px" }} />
                                                        </div>
                                                    </div>

                                                    {/* Bloco 2 */}
                                                    <div className="col-12 col-md-6 m-0 p-0 pe-2 ps-2">
                                                        <div className="d-flex align-items-center gap-2 mb-3">
                                                        <span className="form-control text-center" style={{ maxWidth: "100px" }}>LENTO</span>
                                                        <select
                                                            className="form-select" 
                                                            id="condicao_rsi_lenta" 
                                                            placeholder="condição" 
                                                            value={condicaoRSILento}
                                                            onChange={e => setCondicaoRSILento(e.target.value)}
                                                            style={{ maxWidth: "120px" }}>
                                                            <option value="maior">Maior que</option>
                                                            <option value="menor">Menor que</option>
                                                        </select>
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                             id="valor_rsi_lenta"
                                                              className="form-control" 
                                                              placeholder="Valor" 
                                                              value={valorRSILento}
                                                              onChange={e => setValorRSILento(e.target.value)}
                                                              style={{ maxWidth: "150px" }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-6 col-xl-12">
                                            <div class="mb-4">
                                                <h5 class="mb-2 text-body-highlight">EMA</h5>
                                                <div className="row w-100 ms-0">
                                                    {/* Bloco 1 */}
                                                    <div className="col-12 col-md-6 pe-2 ps-2">
                                                        <div className="d-flex align-items-center gap-2 mb-3 w-100">
                                                        {/* Caixa fixa com "20D" */}
                                                        <span className="form-control text-center" style={{ maxWidth: "100px" }}>20D</span>

                                                        {/* Caixa de seleção */}
                                                        <select
                                                            name="condição"
                                                             id="condicao_ema_20" 
                                                             className="form-select" 
                                                             value={condicaoEMA20}
                                                             onChange={e => setCondicaoEMA20(e.target.value)}
                                                             style={{ maxWidth: "120px" }}>
                                                            <option value="maior">Maior que</option>
                                                            <option value="menor">Menor que</option>
                                                        </select>

                                                        {/* Campo numérico */}
                                                        <input
                                                            type="number"
                                                             min="0" 
                                                             id="valor_ema_20" 
                                                             className="form-control" 
                                                             placeholder="Valor" 
                                                             value={valorEMA20}
                                                             onChange={e => setValorEMA20(e.target.value)}
                                                             style={{ maxWidth: "150px" }} />
                                                        </div>
                                                    </div>

                                                    {/* Bloco 2 */}
                                                    <div className="col-12 col-md-6 pe-2 ps-2">
                                                        <div className="d-flex align-items-center gap-2 mb-3">
                                                        <span className="form-control text-center" style={{ maxWidth: "100px" }}>50D</span>

                                                        <select
                                                            className="form-select"
                                                             id="condicao_ema_50" 
                                                             placeholder="condição" 
                                                             value={condicaoEMA50}
                                                             onChange={e => setCondicaoEMA50(e.target.value)}
                                                             style={{ maxWidth: "120px" }}>
                                                            <option value="maior">Maior que</option>
                                                            <option value="menor">Menor que</option>
                                                        </select>

                                                        <input
                                                            type="number"
                                                             min="0" id="valor_ema_50" 
                                                             className="form-control" 
                                                             placeholder="Valor"
                                                             value={valorEMA50}
                                                             onChange={e => setValorEMA50(e.target.value)}
                                                             style={{ maxWidth: "150px" }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-6 col-xl-12">
                                            <div class="mb-4">
                                                <h5 class="mb-2 text-body-highlight">ESTOCÁSTICO</h5>
                                                <div className="row w-100 ms-0">
                                                    {/* Bloco 1 */}
                                                    <div className="col-12 col-md-6 pe-2 ps-2">
                                                        <div className="d-flex align-items-center gap-2 mb-3 w-100">
                                                        {/* Caixa fixa com "50D" */}
                                                        <span className="form-control text-center" style={{ maxWidth: "100px" }}>RÁPIDO</span>

                                                        {/* Caixa de seleção */}
                                                        <select disabled name="condição" className="form-select" style={{ maxWidth: "120px" }}>
                                                            <option value="maior">Maior que</option>
                                                            <option value="menor">Menor que</option>
                                                        </select>

                                                        {/* Campo numérico */}
                                                        <input type="number" min="0" disabled className="form-control" placeholder="Valor" style={{ maxWidth: "150px" }} />
                                                        </div>
                                                    </div>

                                                    {/* Bloco 2 */}
                                                    <div className="col-12 col-md-6 pe-2 ps-2">
                                                        <div className="d-flex align-items-center gap-2 mb-3">
                                                        <span className="form-control text-center" style={{ maxWidth: "100px" }}>LENTO</span>
                                                        <select disabled className="form-select" placeholder="condição" style={{ maxWidth: "120px" }}>
                                                            <option value="maior">Maior que</option>
                                                            <option value="menor">Menor que</option>
                                                        </select>
                                                        <input type="number" min="0" disabled className="form-control" placeholder="Valor" style={{ maxWidth: "150px" }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-6 col-xl-12">
                                            <div class="mb-4">
                                                <h5 class="mb-2 text-body-highlight">MACD</h5>
                                                <div className="row w-100 ms-0">
                                                    {/* Bloco 1 */}
                                                    <div className="col-12 col-md-6 pe-2 ps-2">
                                                        <div className="d-flex align-items-center gap-2 mb-3 w-100">
                                                        {/* Caixa fixa com "RÁPIDA" */}
                                                        <span className="form-control text-center" style={{ maxWidth: "100px" }}>RÁPIDO</span>

                                                        {/* Caixa de seleção */}
                                                        <select disabled name="condição" className="form-select" style={{ maxWidth: "120px" }}>
                                                            <option value="maior">Maior que</option>
                                                            <option value="menor">Menor que</option>
                                                        </select>

                                                        {/* Campo numérico */}
                                                        <input type="number" min="0" disabled className="form-control" placeholder="Valor" style={{ maxWidth: "150px" }} />
                                                        </div>
                                                    </div>

                                                    {/* Bloco 2 */}
                                                    <div className="col-12 col-md-6 pe-2 ps-2">
                                                        <div className="d-flex align-items-center gap-2 mb-3">
                                                        <span className="form-control text-center" style={{ maxWidth: "100px" }}>LENTO</span>
                                                        <select disabled className="form-select" placeholder="condição" style={{ maxWidth: "120px" }}>
                                                            <option value="maior">Maior que</option>
                                                            <option value="menor">Menor que</option>
                                                        </select>
                                                        <input type="number" min="0" disabled className="form-control" placeholder="Valor" style={{ maxWidth: "150px" }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>

                                    <h6 className="text-center text-danger mb-3">{mensagemErroAdicionarAporte}</h6>

                                    <div className="mt-3 text-end">

                                    <button
                                        type="button"
                                        className="btn btn-phoenix-secondary mx-2"
                                        data-bs-dismiss="modal"
                                    >
                                        Fechar
                                    </button>
                                    <button type="submit" className="btn btn-phoenix-primary">
                                        Adicionar Estratégia
                                    </button>
                                </div>
                            </div>
                            </form>
                        </div>
                    </div>
              {/* ---------------------------- */}
                </div>
            </div>
        </div>
      </div>
    </div>
    )
}

export default AdicionarEstrategia;