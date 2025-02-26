import React, { useState, useEffect } from "react";
import "./Uteis/Altura.css";

function Filtros() {
    const [dados, setDados] = useState([]);

    console.log("dados filtros => ", dados)

    // ordenação
    const [ordem, setOrdem] = useState("capitalizacaoDeMercado")
    // em teste

    // campos para ordenação
    const [ordemPrecoAtual, setOrdemPrecoAtual] = useState("padrao");

    const [ordemRSIRapido, setOrdemRSIRapido] = useState("padrao");
    const [ordemRSILento, setOrdemRSILento] = useState("padrao");

    const [ordemEMA20, setOrdemEMA20] = useState("padrao");
    const [ordemEMA50, setOrdemEMA50] = useState("padrao");

    const [ordemCapitalizacao, setOrdemCapitalizacao] = useState("alto");
    const [ordemVolume, setOrdemVolume] = useState("padrao");

    // campos dos filtros
    const [campoRSIRapido, setCampoRSIRapido] = useState("");
    const [campoRSILento, setCampoRSILento] = useState("");
    const [campoEstocasticoRapido, setCampoEstocasticoRapido] = useState("");
    const [campoEstocasticoLento, setCampoEstocasticoLento] = useState("");
    const [campoEMA20, setCampoEMA20] = useState("");
    const [campoEMA50, setCampoEMA50] = useState("");
    const [periodo, setPeriodo] = useState("diario");


    const reiniciarCampo = () => {
      setOrdemPrecoAtual("padrao");
      setOrdemRSIRapido("padrao");
      setOrdemRSILento("padrao");
      setOrdemEMA20("padrao");
      setOrdemEMA50("padrao");
      setOrdemCapitalizacao("padrao");
      setOrdemVolume("padrao");
    }

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    const ordenarDados = (ordem, menorProMaior = false) => {
      console.log("dados ordem...");
      console.log(dados.sort((a, b) => a["precoAtual"] - b["precoAtual"]))
      if (menorProMaior) {
        setDados(dados.sort((a, b) => a[ordem] - b[ordem]));
        setDados(dados.slice());
      } else {
        setDados(dados.sort((a, b) => b[ordem] - a[ordem]));
        setDados(dados.slice());
      }
    }

    const ordenarDadosPorRSI = (tipo, menorProMaior = false, intervalo = "diario", periodo = "14") => {
      console.log("Função ordenar por RSI");
      console.log(tipo, intervalo, periodo);
      
      // Verifique se o valor existe para evitar erro de undefined
      console.log(dados[0]?.["RSI"]?.[tipo]?.[intervalo]?.[periodo]);
    
      // Crie uma cópia do array para evitar mutação direta
      const dadosOrdenados = [...dados];
    
      if (menorProMaior) {
        dadosOrdenados.sort((a, b) => {
          const rsiA = a["RSI"][tipo]?.[intervalo]?.[periodo] ?? 0;
          const rsiB = b["RSI"][tipo]?.[intervalo]?.[periodo] ?? 0;
          return rsiA - rsiB;
        });
      } else {
        dadosOrdenados.sort((a, b) => {
          const rsiA = a["RSI"][tipo]?.[intervalo]?.[periodo] ?? 0;
          const rsiB = b["RSI"][tipo]?.[intervalo]?.[periodo] ?? 0;
          return rsiB - rsiA;
        });
      }
    
      // Atualize o estado com os dados ordenados
      console.log("dados ordenados => ", dadosOrdenados)
      setDados(dadosOrdenados);
    };

    const ordenarDadosPorEMA = (periodo, menorProMaior = false, intervalo = "diario") => {
      console.log("Função ordenar por RSI");
      
      // Crie uma cópia do array para evitar mutação direta
      const dadosOrdenados = [...dados];
    
      if (menorProMaior) {
        dadosOrdenados.sort((a, b) => {
          const rsiA = a["EMA"][intervalo]?.[periodo] ?? 0;
          const rsiB = b["EMA"][intervalo]?.[periodo] ?? 0;
          return rsiA - rsiB;
        });
      } else {
        dadosOrdenados.sort((a, b) => {
          const rsiA = a["EMA"][intervalo]?.[periodo] ?? 0;
          const rsiB = b["EMA"][intervalo]?.[periodo] ?? 0;
          return rsiB - rsiA;
        });
      }
    
      // Atualize o estado com os dados ordenados
      setDados(dadosOrdenados);
    };

    const buscarDados = async (parametros = "",) => {
      try {
          const resposta = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/criptomoedas_teste${parametros}`);
          
          if (!resposta.ok) {
              throw new Error("Erro ao buscar dados da API");
          }
          const dadosApi = await resposta.json();
          setDados(dadosApi.sort((a, b) => b[ordem] - a[ordem]));
      } catch (err) {
          setErro(err.message);
      } finally {
          setCarregando(false); 
      }
  };

  const classificarRSI = (rsi) => {
    if (rsi >= 0 && rsi < 30) {
      return "Baixa Forte";
    } else if (rsi >= 30 && rsi < 45) {
      return "Baixa";
    } else if (rsi >= 45 && rsi <= 55) {
      return "Neutro";
    } else if (rsi > 55 && rsi < 70) {
      return "Alta";
    } else if (rsi >= 70 && rsi <= 100) {
      return "Alta Forte";
    } else {
      return "Valor RSI inválido"; // Para valores fora de 0-100
    }
  };

  // estado para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const dadosPaginados = dados.slice(indiceInicial, indiceFinal);

  const totalPaginas = Math.ceil(dados.length / itensPorPagina);

    const handleSubmit = (event) => {
      event.preventDefault(); 
      const formData = new FormData(event.target); 

      const data = {
        indicador: formData.get("indicador") || "",
        intervalo: formData.get("intervalo") || "",
        periodo: formData.get("periodo") || "",
        condicao: formData.get("condicao") || "",
        valor: formData.get("valor") || "",
      };

      if (!data.indicador || !data.intervalo || !data.periodo || !data.condicao || !data.valor){
        console.log("Preencha todos os dados");
      } else {       
        const requisicao = `?${data.indicador.toLowerCase()}_${data.intervalo.toLowerCase()}_${data.periodo}_${data.condicao.replace(" ", "_")}=${data.valor}`;
        
        console.log(requisicao); // Exibe os dados no console ou realiza uma ação
        buscarDados(requisicao);
      }
    };

    const handleSubmitTest = () => {
      reiniciarCampo();
      const condicaoRSIrapido = document.getElementById("condicao_rsi_rapida")?.value;
      const condicaoRSILento = document.getElementById("condicao_rsi_lenta")?.value;
      const condicaoEstocasticoRapido = document.getElementById("condicao_estocastico_rapida")?.value;
      const condicaoEstocasticoLento = document.getElementById("condicao_estocastico_lenta")?.value;
      const condicaoEMA20 = document.getElementById("condicao_ema_20")?.value;
      const condicaoEMA50 = document.getElementById("condicao_ema_50")?.value;

      const periodoFiltros = document.getElementById("periodo_filtros")?.value;
      setPeriodo(periodoFiltros);

      console.log("campo rsi rapido => ",condicaoRSIrapido, campoRSIRapido);
      console.log("campo rsi lento => ",condicaoRSILento, campoRSILento);
      console.log("campo estocastico rapido => ", condicaoEstocasticoRapido, campoEstocasticoRapido);
      console.log("campo estocastico lento => ",condicaoEstocasticoLento, campoEstocasticoLento);
      console.log("campo ema 20 => ",condicaoEMA20, campoEMA20);
      console.log("campo ema 50 => ",condicaoEMA50, campoEMA50);

      const indicadores = [
        { id: "condicao_rsi_rapida", nome: "rsi-rapido", periodo: periodoFiltros == "mensal" ? 7 : 14 , valor: campoRSIRapido},
        { id: "condicao_rsi_lenta", nome: "rsi-lento", periodo: periodoFiltros == "mensal" ? 7 : 14, valor: campoRSILento },
        { id: "condicao_estocastico_rapida", nome: "estocastico-rapido", periodo: 14, valor: campoEstocasticoRapido },
        { id: "condicao_estocastico_lenta", nome: "estocastico-lento", periodo: 14, valor: campoEstocasticoLento },
        { id: "condicao_ema_20", nome: "ema", periodo: 20, valor: campoEMA20 },
        { id: "condicao_ema_50", nome: "ema", periodo: 50, valor: campoEMA50 },
    ];

    let parametros = [];

    indicadores.forEach(indicador => {
        const condicao = document.getElementById(indicador.id)?.value;
        const valor = indicador.valor
        if (valor) {
          parametros.push(`${indicador.nome}_${periodoFiltros}_${indicador.periodo}_${condicao}=${indicador.valor}`);
        }
    });

    // Criando a query string final
    const queryString = parametros.length ? `?${parametros.join("&")}` : "";

    console.log("Requisição montada:", queryString); 
    buscarDados(queryString)
    }

    useEffect(() => {

      const ajustarItensPorPagina = () => {
        const larguraTela = window.innerWidth;
        if (larguraTela < 1200) {
          setItensPorPagina(4);  
        } else if (larguraTela < 1300) {
          setItensPorPagina(5); 
        } else if (larguraTela < 1400) {
          setItensPorPagina(6); 
        } else if (larguraTela < 1600) {
          setItensPorPagina(7);
        }  else if (larguraTela < 1700) {
          setItensPorPagina(8);
        }  else if (larguraTela < 1800) {
          setItensPorPagina(9);
        } else if (larguraTela < 1900) {
          setItensPorPagina(10); 
        } else {
          setItensPorPagina(11); 
        }
      };

      ajustarItensPorPagina(); // Chama a função inicialmente
      window.addEventListener("resize", ajustarItensPorPagina);

      buscarDados();
      window.feather.replace();

      return () => {
        window.removeEventListener("resize", ajustarItensPorPagina); // Remove o evento ao desmontar
      };
    }, []);

    
    if (erro) {
        return <h2>Erro: {erro}</h2>;
    }

    return(
        <div class="col-12 altura" style={{display: "flex", flexDirection: "column"}}>
          <div className="row align-items-center mx-0 mb-3 mt-2 d-flex">
  <div className="d-flex w-100 m-0 p-0">
    {/* Cards */}
    <div className="d-flex w-100 m-0 p-0">
      <div className="card flex-grow-1 h-100">
      <div className="card-body m-0 p-1">
        <h4 className="text-start m-2 text-center">
          RSI
        </h4>

          <div className="d-flex justify-content-between mb-2">
            <h8 className="card text-start d-flex justify-content-center align-items-center fs-9" style={{width: "100px"}}>RÁPIDA</h8>
            <div className="form-floating">
                        <select name="condicao" id="condicao_rsi_rapida" class="form-select" aria-label="Dropdown 1">
                            <option value="menor" selected>Menor que</option>
                            <option value="maior">Maior que</option>
                        </select>
                        <label for="condicao">condição</label>
                      </div>
                      <div className="form-floating">
                        <input name="valor" id="valor" type="number" class="form-control" placeholder="Valor" onChange={e => setCampoRSIRapido(e.target.value)} />
                        <label for="valor">valor</label>
                      </div>
          </div>

          <div className="d-flex justify-content-between mb-2">
          <h8 className="card text-start d-flex justify-content-center align-items-center fs-9" style={{width: "100px"}}>LENTA</h8>
            <div className="form-floating">
                        <select name="condicao" id="condicao_rsi_lenta" class="form-select" aria-label="Dropdown 1">
                            <option value="menor" selected>Menor que</option>
                            <option value="maior">Maior que</option>
                        </select>
                        <label for="condicao">condição</label>
                      </div>
                      <div className="form-floating">
                        <input name="valor" id="valor" type="number" class="form-control" placeholder="Valor" onChange={e => setCampoRSILento(e.target.value)} />
                        <label for="valor">valor</label>
                      </div>
          </div>
        </div>
      </div>
      <div className="card flex-grow-1 mx-2 h-100">
      <div className="card-body m-0 p-1">
        <h4 className="text-start m-2 text-center">
          ESTOCÁSTICO
        </h4>

          <div className="d-flex justify-content-between mb-2">
            <h8 className="card text-start d-flex justify-content-center align-items-center fs-9" style={{width: "100px"}}>RÁPIDA</h8>
            <div className="form-floating">
                        <select name="condicao" id="condicao_estocastico_rapida" class="form-select" aria-label="Dropdown 1">
                            <option value="menor" selected>Menor que</option>
                            <option value="maior">Maior que</option>
                        </select>
                        <label for="condicao">condição</label>
                      </div>
                      <div className="form-floating">
                        <input name="valor" id="valor" type="number" class="form-control" placeholder="Valor" disabled onChange={e => setCampoEstocasticoRapido(e.target.value)} />
                        <label for="valor">Em desenvolvimento...</label>
                      </div>
          </div>

          <div className="d-flex justify-content-between mb-2">
          <h8 className="card text-start d-flex justify-content-center align-items-center fs-9" style={{width: "100px"}}>LENTA</h8>
            <div className="form-floating">
                        <select name="condicao" id="condicao_estocastico_lenta" class="form-select" aria-label="Dropdown 1">
                            <option value="menor" selected>Menor que</option>
                            <option value="maior">Maior que</option>
                        </select>
                        <label for="condicao">condição</label>
                      </div>
                      <div className="form-floating">
                        <input name="valor" id="valor" type="number" class="form-control" placeholder="Valor" disabled onChange={e => setCampoEstocasticoLento(e.target.value)} />
                        <label for="valor">Em desenvolvimento...</label>
                      </div>
          </div>
        </div>
      </div>
      <div className="card flex-grow-1 me-2 h-100">
      <div className="card-body m-0 p-1">
        <h4 className="text-start m-2 text-center">
          EMA
        </h4>

          <div className="d-flex justify-content-between mb-2">
            <h8 className="card text-start d-flex justify-content-center align-items-center fs-9" style={{width: "100px"}}>20 DIAS</h8>
            <div className="form-floating">
                        <select name="condicao" id="condicao_ema_20" class="form-select" aria-label="Dropdown 1">
                            <option value="menor" selected>Menor que</option>
                            <option value="maior">Maior que</option>
                        </select>
                        <label for="condicao">condição</label>
                      </div>
                      <div className="form-floating">
                        <input name="valor" id="valor" type="number" class="form-control" placeholder="Valor" onChange={e => setCampoEMA20(e.target.value)} />
                        <label for="valor">valor</label>
                      </div>
          </div>

          <div className="d-flex justify-content-between mb-2">
          <h8 className="card text-start d-flex justify-content-center align-items-center fs-9" style={{width: "100px"}}>50 DIAS</h8>
            <div className="form-floating">
                        <select name="condicao" id="condicao_ema_50" class="form-select" aria-label="Dropdown 1">
                            <option value="menor" selected>Menor que</option>
                            <option value="maior">Maior que</option>
                        </select>
                        <label for="condicao">condição</label>
                      </div>
                      <div className="form-floating">
                        <input name="valor" id="valor" type="number" class="form-control" placeholder="Valor" onChange={e => setCampoEMA50(e.target.value)} />
                        <label for="valor">valor</label>
                      </div>
          </div>
      </div>

      </div>
    </div>

    {/* Botões */}
    <div className="d-flex flex-column justify-content-between" style={{ width: '150px' }}>
        <div className="form-floating h-50 mb-2">
          <select name="periodo" id="periodo_filtros" class="form-select h-100" aria-label="Dropdown 1">
              <option value="diario" selected>DIÁRIO</option>
              <option value="semanal">SEMANAL</option>
              <option value="mensal">MENSAL</option>
          </select>
          <label for="condicao">PERIÓDO</label>
        </div>
      <button type="button" className="btn btn-phoenix-primary h-50" onClick={handleSubmitTest}>Filtrar<span data-feather="filter" className="ms-1" style={{height: "16px", width: "16px"}}></span></button>
    </div>
  </div>
</div>



                  <div class="card h-100 mb-2 ms-0" style={{flexGrow: "1"}}>
                  <div class="card-body py-0">
                  { 
                  carregando ? (
                    <div className="table-responsive scrollbar mt-3">
                    <table className="table fs-10 mb-0">
                        <thead>
                            <tr>
                                <th className="sort ps-0 align-start" data-sort="users" style={{ width: "300px" }}>
                                    CRIPTOMOEDA
                                </th>
                                <th className="sort align-start cursor-pointer" data-sort="users" style={{ width: "180px" }} >
                                    PREÇO ATUAL 
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                                <th className="sort align-middle cursos-pointer" data-sort="users" style={{ width: "180px" }} >
                                    RSI RÁPIDA
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                                <th className="sort align-middle cursos-pointer" data-sort="users" style={{ width: "180px" }} >
                                    RSI LENTA
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                                <th className="sort align-middle cursor-pointer" data-sort="users" style={{ width: "180px" }}>
                                    EMA 20
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                                <th className="sort align-middle cursor-pointer" data-sort="users" style={{ width: "180px" }}>
                                    EMA 50
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                                <th className="sort align-middle cursor-pointer" data-sort="users" style={{ width: "200px" }}>
                                    CAPITALIZAÇÃO DE MERCADO
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                                <th className="sort align-middle cursor-pointer" data-sort="status" style={{ width: "200px" }}>
                                    VOLUME 24H
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="list" id="table-country-wise-visitors">
                            {/* Simulação dos dados com placeholders */}
                            {[...Array(10)].map((_, index) => (
                                <tr key={index}>
                                    <td className="py-2 white-space-nowrap ps-0 country">
                                        <span className="placeholder-glow d-flex">
                                            <span className="placeholder col-2"></span>
                                            <span className="placeholder col-4 ms-3"></span>
                                        </span>
                                    </td>
                                    <td className="py-2 align-middle users">
                                        <span className="placeholder-glow d-flex">
                                            <span className="placeholder col-5"></span>
                                        </span>
                                    </td>
                                    <td className="py-2 align-middle users">
                                        <span className="placeholder-glow d-flex">
                                            <span className="placeholder col-4"></span>
                                        </span>
                                    </td>
                                    <td>
                                        <span className="placeholder-glow d-flex">
                                            <span className="placeholder col-4"></span>
                                        </span>
                                    </td>
                                    <td className="py-2 align-middle users">
                                        <span className="placeholder-glow d-flex">
                                            <span className="placeholder col-5"></span>
                                        </span>
                                    </td>
                                    <td className="py-2 align-middle users">
                                        <span className="placeholder-glow d-flex">
                                            <span className="placeholder col-5"></span>
                                        </span>
                                    </td>
                                    <td className="py-2 align-middle users">
                                        <span className="placeholder-glow d-flex">
                                            <span className="placeholder col-7"></span>
                                        </span>
                                    </td>
                                    <td className="py-2 align-middle users">
                                        <span className="placeholder-glow d-flex">
                                            <span className="placeholder col-7"></span>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                  ) : 
                  
                  dadosPaginados.length > 0 ? (
                    <div class="table-responsive scrollbar mt-3">
                    <table class="table fs-10 mb-0">
                      <thead>
                        <tr>
                          <th class="sort ps-0 align-start" data-sort="users" style={{width: "300px"}}>
                            CRIPTOMOEDA
                          </th>

                          {
                            // preço atual
                          }

                          <th key={"precoAtual1"} class={`sort align-middle cursor-pointer ${ordemPrecoAtual === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            reiniciarCampo();
                            setOrdemPrecoAtual("alto")
                            ordenarDados("precoAtual")
                          }}>
                            PREÇO ATUAL
                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"precoAtual2"} class={`sort align-middle cursor-pointer ${ordemPrecoAtual === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            setOrdemPrecoAtual("baixo")
                            ordenarDados("precoAtual", true)
                          }}>
                            PREÇO ATUAL
                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"precoAtual3"} class={`sort align-middle cursor-pointer ${ordemPrecoAtual === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            setOrdemPrecoAtual("alto")
                            ordenarDados("precoAtual")
                          }}>
                            PREÇO ATUAL
                            <i class="fa fa-sort-desc px-2" aria-hidden="true"></i>
                          </th>

                          {
                            // rsi rapida
                          }

                          <th key={"rsi11"} class={`sort align-middle cursor-pointer ${ordemRSIRapido === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            reiniciarCampo();
                            setOrdemRSIRapido("alto");
                            ordenarDadosPorRSI("rapida", false, periodo, periodo === "mensal" ? 7 : 14)
                          }}>

                            {periodo === "mensal" ? "RSI RÁPIDA (M)" : periodo === "semanal" ? "RSI RÁPIDA (S)" : periodo === "diario" ? "RSI RÁPIDA (D)" : "RSI RÁPIDA"}

                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"rsi21"} class={`sort align-middle cursor-pointer ${ordemRSIRapido === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            setOrdemRSIRapido("baixo");
                            ordenarDadosPorRSI("rapida", true, periodo, periodo === "mensal" ? 7 : 14)
                          }}>

                            {periodo === "mensal" ? "RSI RÁPIDA (M)" : periodo === "semanal" ? "RSI RÁPIDA (S)" : periodo === "diario" ? "RSI RÁPIDA (D)" : "RSI RÁPIDA"}

                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"rsi31"} class={`sort align-middle cursor-pointer ${ordemRSIRapido === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            setOrdemRSIRapido("alto");
                            ordenarDadosPorRSI("rapida", false, periodo, periodo === "mensal" ? 7 : 14);
                          }}>
                            
                            {periodo === "mensal" ? "RSI RÁPIDA (M)" : periodo === "semanal" ? "RSI RÁPIDA (S)" : periodo === "diario" ? "RSI RÁPIDA (D)" : "RSI RÁPIDA"}

                            <i class="fa fa-sort-desc px-2" aria-hidden="true"></i>
                          </th>

                          {
                            // rsi lenta
                          }

                          <th key={"rsi1"} class={`sort align-middle cursor-pointer ${ordemRSILento === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            reiniciarCampo();
                            setOrdemRSILento("alto")
                            ordenarDadosPorRSI("lenta", false, periodo, periodo === "mensal" ? 7 : 14)
                          }}>

                            {periodo === "mensal" ? "RSI LENTO (M)" : periodo === "semanal" ? "RSI LENTO (S)" : periodo === "diario" ? "RSI LENTO (D)" : "RSI LENTO"}

                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"rsi2"} class={`sort align-middle cursor-pointer ${ordemRSILento === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            setOrdemRSILento("baixo")
                            ordenarDadosPorRSI("lenta", true, periodo, periodo === "mensal" ? 7 : 14)
                          }}>
                            
                            {periodo === "mensal" ? "RSI LENTO (M)" : periodo === "semanal" ? "RSI LENTO (S)" : periodo === "diario" ? "RSI LENTO (D)" : "RSI LENTO"}

                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"rsi3"} class={`sort align-middle cursor-pointer ${ordemRSILento === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            setOrdemRSILento("alto")
                            ordenarDadosPorRSI("lenta", false, periodo, periodo === "mensal" ? 7 : 14)
                          }}>
                            
                            {periodo === "mensal" ? "RSI LENTO (M)" : periodo === "semanal" ? "RSI LENTO (S)" : periodo === "diario" ? "RSI LENTO (D)" : "RSI LENTO"}

                            <i class="fa fa-sort-desc px-2" aria-hidden="true"></i>
                          </th>

                          {
                            // ema 20
                          }

                          <th key={"ema11"} class={`sort align-middle cursor-pointer ${ordemEMA20 === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            reiniciarCampo();
                            setOrdemEMA20("alto")
                            ordenarDadosPorEMA(20)
                          }}>
                            EMA 20 (D)
                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"ema21"} class={`sort align-middle cursor-pointer ${ordemEMA20 === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            setOrdemEMA20("baixo")
                            ordenarDadosPorEMA(20, true)
                          }}>
                            EMA 20 (D)
                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"ema31"} class={`sort align-middle cursor-pointer ${ordemEMA20 === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            setOrdemEMA20("alto")
                            ordenarDadosPorEMA(20)
                          }}>
                            EMA 20 (D)
                            <i class="fa fa-sort-desc px-2" aria-hidden="true"></i>
                          </th>

                          {
                            // ema 50
                          }

                          <th key={"ema1"} class={`sort align-middle cursor-pointer ${ordemEMA50 === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            reiniciarCampo();
                            setOrdemEMA50("alto")
                            ordenarDadosPorEMA(50)
                          }}>
                            EMA 50 (D)
                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"ema2"} class={`sort align-middle cursor-pointer ${ordemEMA50 === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            setOrdemEMA50("baixo")
                            ordenarDadosPorEMA(50, true)
                          }}>
                            EMA 50 (D)
                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"ema3"} class={`sort align-middle cursor-pointer ${ordemEMA50 === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "180px"}} onClick={() => {
                            setOrdemEMA50("alto")
                            ordenarDadosPorEMA(50)
                          }}>
                            EMA 50 (D)
                            <i class="fa fa-sort-desc px-2" aria-hidden="true"></i>
                          </th>

                          {
                            // capitalização de mercado
                          }

                          <th key={"capitalizacao1"} class={`sort align-middle cursor-pointer ${ordemCapitalizacao === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            reiniciarCampo();
                            setOrdemCapitalizacao("alto")
                            ordenarDados("capitalizacaoDeMercado")
                          }}>
                            CAPITALIZAÇÃO DE MERCADO
                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>

                          <th key={"capitalizacao2"} class={`sort align-middle cursor-pointer ${ordemCapitalizacao === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setOrdemCapitalizacao("baixo")
                            ordenarDados("capitalizacaoDeMercado", true)
                          }}>
                            CAPITALIZAÇÃO DE MERCADO
                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"capitalizacao3"} class={`sort align-middle cursor-pointer ${ordemCapitalizacao === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setOrdemCapitalizacao("alto")
                            ordenarDados("capitalizacaoDeMercado")
                          }}>
                            CAPITALIZAÇÃO DE MERCADO
                            <i class="fa fa-sort-desc px-2" aria-hidden="true"></i>
                          </th>

                          {
                            // volume 24h
                          }
                          
                          <th key={"campoVolume1"} class={`sort align-middle cursor-pointer ${ordemVolume === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            reiniciarCampo();
                            setOrdemVolume("alto")
                            ordenarDados("volumeTotal")
                          }}>
                            VOLUME 24H
                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"campoVolume2"} class={`sort align-middle cursor-pointer ${ordemVolume === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setOrdemVolume("baixo")
                            ordenarDados("volumeTotal", true)
                          }}>
                            VOLUME 24H
                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"campoVolume3"} class={`sort align-middle cursor-pointer ${ordemVolume === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setOrdemVolume("alto")
                            ordenarDados("volumeTotal")
                          }}>
                            VOLUME 24H
                            <i class="fa fa-sort-desc px-2" aria-hidden="true"></i>
                          </th>

                        </tr>
                      </thead>
                      <tbody class="list" id="table-country-wise-visitors">
                          {dadosPaginados.map((dado) => {
                              return (
                              <tr>
                                  <td class="py-2 white-space-nowrap ps-0 country"><div class="d-flex align-items-center text-primary py-md-1 py-xxl-0" href="#!"><img src={dado.imagem} alt="" width="20" />
                                      <h6 class="mb-0 ps-3 fw-bold fs-9">{dado.nome.length > 22 ? `${dado.nome.slice(0, 22)}...`: dado.nome}</h6>
                                  </div></td>

                                  <td class="py-2 align-middle users">
                                  <h6>{new Intl.NumberFormat('en-US', { 
                                    style: 'currency', 
                                    currency: 'USD',
                                    minimumFractionDigits: dado.precoAtual < 0.01 ? 8 : 2,
                                    maximumFractionDigits: dado.precoAtual < 0.01 ? 10 : 2
                                    }).format(dado.precoAtual)}</h6>
                                  </td>

                                  <td>
                                    <h6 class="mb-0 fw-bold fs-9">{(dado["RSI"]["rapida"][periodo][periodo === "mensal" ? 7 : 14] ?? 0).toFixed(2)} - {classificarRSI(dado["RSI"]["rapida"][periodo][periodo === "mensal" ? 7 : 14] ?? 0)}</h6>
                                  </td>

                                  <td>
                                    <h6 class="mb-0 fw-bold fs-9">{(dado["RSI"]["lenta"][periodo][periodo === "mensal" ? 7 : 14] ?? 0).toFixed(2)} - {classificarRSI(dado["RSI"]["lenta"][periodo][periodo === "mensal" ? 7 : 14] ?? 0)}</h6>
                                  </td>

                                  <td class="py-2 align-middle users">   
                                    <h6>{new Intl.NumberFormat('en-US', { 
                                      style: 'currency', 
                                      currency: 'USD',
                                      minimumFractionDigits: dado.EMA?.diario[20] < 0.01 ? 8 : 2,
                                      maximumFractionDigits: dado.EMA?.diario[20] < 0.01 ? 10 : 2
                                      }).format(dado.EMA?.diario[20] ?? 0)}
                                    </h6>
                                  </td>

                                  <td class="py-2 align-middle users">   
                                    <h6>{new Intl.NumberFormat('en-US', { 
                                      style: 'currency', 
                                      currency: 'USD',
                                      minimumFractionDigits: dado.EMA?.diario[50] < 0.01 ? 8 : 2,                                     
                                      maximumFractionDigits: dado.EMA?.diario[50] < 0.01 ? 10 : 2
                                      }).format(dado.EMA?.diario[50] ?? 0)}
                                    </h6>
                                  </td>

                                  

                                  <td class="py-2 align-middle users">
                                  <h6>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(dado.capitalizacaoDeMercado)}</h6>
                                  </td>
                                  <td class="py-2 align-middle users">
                                  <h6>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(dado.volumeTotal)}</h6>
                                  </td>
                              </tr>
                              )
                          })}
                      </tbody>
                    </table>
                    
                  </div>
                  ) : (
                    <h3 className="text-center pt-3"> Nenhum ativo atende a esses filtros. </h3>
                  )
                  }
                    
                  </div>
                    {/* ------------------ */}
                    <div className="pagination d-flex justify-content-center p-3">
                <button
                    className="btn btn-sm btn-primary me-2"
                    disabled={paginaAtual === 1}
                    onClick={() => setPaginaAtual(paginaAtual - 1)}
                >
                <i class="fa fa-chevron-left" aria-hidden="true"></i>  
                </button>
                <h8>Página {paginaAtual} de {totalPaginas}</h8>
                <button
                    className="btn btn-sm btn-primary ms-2"
                    disabled={paginaAtual === totalPaginas}
                    onClick={() => setPaginaAtual(paginaAtual + 1)}
                >
                  <i class="fa fa-chevron-right" aria-hidden="true"></i> 
                </button>
            </div>
          </div>
      </div>
    )
}

export default Filtros;