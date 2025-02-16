import React, { useState, useEffect } from "react";
import "./Uteis/Altura.css";

function Filtros() {
    const [dados, setDados] = useState([]);

    console.log("dados filtros => ", dados)

    // ordenação
    const [ordem, setOrdem] = useState("capitalizacaoDeMercado")
    // em teste
    const [crescente, setCrescente] = useState(true);

    // campos para ordenação
    const [campoPrecoAtual, setCampoPrecoAtual] = useState("padrao");
    const [campoEMA, setCampoEMA] = useState("padrao");
    const [campoRSI, setCampoRSI] = useState("padrao");
    const [campoCapitalizacao, setCampoCapitalizacao] = useState("alto");
    const [campoVolume, setCampoVolume] = useState("padrao");

    const reiniciarCampo = () => {
      setCampoPrecoAtual("padrao");
      setCampoEMA("padrao");
      setCampoRSI("padrao");
      setCampoCapitalizacao("padrao");
      setCampoVolume("padrao");
    }

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    const ordenarDados = (ordem, menorProMaior = false) => {
      if (menorProMaior) {
        setDados(dados.sort((a, b) => a[ordem] - b[ordem]));
        setDados(dados.slice());
      } else {
        setDados(dados.sort((a, b) => b[ordem] - a[ordem]));
        setDados(dados.slice());
      }
    }

    const ordenarDadosPorIndicador = (indicador, menorProMaior = false, intervalo = "diario", periodo = "14") => {
      if (menorProMaior) {
        setDados(dados.sort((a, b) => (a[indicador][intervalo][periodo] ?? 0) - (b[indicador][intervalo][periodo]) ?? 0));
        setDados(dados.slice());
      } else {
        setDados(dados.sort((a, b) => (b[indicador][intervalo][periodo] ?? 0) - (a[indicador][intervalo][periodo]) ?? 0));
        setDados(dados.slice());
      }
    }

    const buscarDados = async (parametros = "",) => {
      try {
          const resposta = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/criptomoedas${parametros}`);
          
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
        console.log(data);
      } else {       
        const requisicao = `?${data.indicador.toLowerCase()}_${data.intervalo.toLowerCase()}_${data.periodo}_${data.condicao.replace(" ", "_")}=${data.valor}`;
        
        console.log(requisicao); // Exibe os dados no console ou realiza uma ação
        buscarDados(requisicao);
      }
    };

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
          setItensPorPagina(12); 
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
          <div className="row align-items-center mb-3">
          <form className=" d-flex flex-wrap" onSubmit={handleSubmit}>

          <div class="col-6 col-md-auto p-2">
            <div className="form-floating">
                <select name="indicador" id="indicador" class="form-select" aria-label="Indicador">
                    <option value="rsi" selected>RSI</option>
                    <option value="ema">EMA</option>
                </select>
                <label for="indicador">indicador</label>
            </div>
          </div>

            <div class="col-6 col-md-auto p-2">
            <div className="form-floating">
                <select name="intervalo" id="intervalo" class="form-select" aria-label="Dropdown 1">
                    <option value="diario" selected>Diário</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                </select>
                <label for="intervalo">intervalo</label>
            </div>
            </div>

            <div class="col-6 col-md-auto p-2">
              <div className="form-floating">
                <input name="periodo" id="periodo" type="number" class="form-control" placeholder="Período" />
                <label for="periodo">periodo</label>
              </div>
            </div>

            <div class="col-6 col-md-auto p-2">
              <div className="form-floating">
                <select name="condicao" id="condicao" class="form-select" aria-label="Dropdown 1">
                    <option value="menor" selected>Menor que</option>
                    <option value="maior">Maior que</option>
                </select>
                <label for="condicao">condição</label>
              </div>
            </div>

            <div class="col-6 col-md-auto p-2">
              <div className="form-floating">
                <input name="valor" id="valor" type="number" class="form-control" placeholder="Valor" />
                <label for="valor">valor</label>
              </div>
            </div>

            <div class="col-6 col-md-auto p-2">
                <button type="submit" class="btn btn-primary h-100">Filtrar</button>
            </div>
            
          </form>
          </div>

                  <div class="card h-100" style={{flexGrow: "1"}}>
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
                                <th className="sort align-start cursor-pointer" data-sort="users" style={{ width: "250px" }} onClick={() => ordenarDados("precoAtual")}>
                                    PREÇO ATUAL 
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                                <th className="sort align-middle cursor-pointer" data-sort="users" style={{ width: "200px" }} onClick={() => ordenarDadosPorIndicador("EMA")}>
                                    EMA
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                                <th className="sort align-middle cursos-pointer" data-sort="users" style={{ width: "200px" }} onClick={() => ordenarDadosPorIndicador("RSI")}>
                                    RSI
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                                <th className="sort align-middle cursor-pointer" data-sort="users" style={{ width: "200px" }} onClick={() => ordenarDados("capitalizacaoDeMercado")}>
                                    CAPITALIZAÇÃO DE MERCADO
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                                <th className="sort align-middle cursor-pointer" data-sort="status" style={{ width: "200px" }} onClick={() => ordenarDados("volumeTotal")}>
                                    VOLUME 24H
                                    <i className="fa fa-sort px-2" aria-hidden="true"></i>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="list" id="table-country-wise-visitors">
                            {/* Simulação dos dados com placeholders */}
                            {[...Array(13)].map((_, index) => (
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

                          <th key={"precoAtual1"} class={`sort align-middle cursor-pointer ${campoPrecoAtual === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            reiniciarCampo();
                            setCampoPrecoAtual("alto")
                            ordenarDados("precoAtual")
                          }}>
                            PREÇO ATUAL
                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"precoAtual2"} class={`sort align-middle cursor-pointer ${campoPrecoAtual === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setCampoPrecoAtual("baixo")
                            ordenarDados("precoAtual", true)
                          }}>
                            PREÇO ATUAL
                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"precoAtual3"} class={`sort align-middle cursor-pointer ${campoPrecoAtual === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setCampoPrecoAtual("alto")
                            ordenarDados("precoAtual")
                          }}>
                            PREÇO ATUAL
                            <i class="fa fa-sort-desc px-2" aria-hidden="true"></i>
                          </th>

                          <th key={"ema1"} class={`sort align-middle cursor-pointer ${campoEMA === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            reiniciarCampo();
                            setCampoEMA("alto")
                            ordenarDadosPorIndicador("EMA")
                          }}>
                            EMA
                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"ema2"} class={`sort align-middle cursor-pointer ${campoEMA === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setCampoEMA("baixo")
                            ordenarDadosPorIndicador("EMA", true)
                          }}>
                            EMA
                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"ema3"} class={`sort align-middle cursor-pointer ${campoEMA === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setCampoEMA("alto")
                            ordenarDadosPorIndicador("EMA")
                          }}>
                            EMA
                            <i class="fa fa-sort-desc px-2" aria-hidden="true"></i>
                          </th>

                          <th key={"rsi1"} class={`sort align-middle cursor-pointer ${campoRSI === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            reiniciarCampo();
                            setCampoRSI("alto")
                            ordenarDadosPorIndicador("RSI")
                          }}>
                            RSI
                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"rsi2"} class={`sort align-middle cursor-pointer ${campoRSI === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setCampoRSI("baixo")
                            ordenarDadosPorIndicador("RSI", true)
                          }}>
                            RSI
                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"rsi3"} class={`sort align-middle cursor-pointer ${campoRSI === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setCampoRSI("alto")
                            ordenarDadosPorIndicador("RSI")
                          }}>
                            RSI
                            <i class="fa fa-sort-desc px-2" aria-hidden="true"></i>
                          </th>

                          <th key={"capitalizacao1"} class={`sort align-middle cursor-pointer ${campoCapitalizacao === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            reiniciarCampo();
                            setCampoCapitalizacao("alto")
                            ordenarDados("capitalizacaoDeMercado")
                          }}>
                            CAPITALIZAÇÃO DE MERCADO
                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>

                          <th key={"capitalizacao2"} class={`sort align-middle cursor-pointer ${campoCapitalizacao === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setCampoCapitalizacao("baixo")
                            ordenarDados("capitalizacaoDeMercado", true)
                          }}>
                            CAPITALIZAÇÃO DE MERCADO
                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"capitalizacao3"} class={`sort align-middle cursor-pointer ${campoCapitalizacao === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setCampoCapitalizacao("alto")
                            ordenarDados("capitalizacaoDeMercado")
                          }}>
                            CAPITALIZAÇÃO DE MERCADO
                            <i class="fa fa-sort-desc px-2" aria-hidden="true"></i>
                          </th>
                          
                          <th key={"campoVolume1"} class={`sort align-middle cursor-pointer ${campoVolume === "padrao" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            reiniciarCampo();
                            setCampoVolume("alto")
                            ordenarDados("volumeTotal")
                          }}>
                            VOLUME 24H
                            <i class="fa fa-sort px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"campoVolume2"} class={`sort align-middle cursor-pointer ${campoVolume === "alto" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setCampoVolume("baixo")
                            ordenarDados("volumeTotal", true)
                          }}>
                            VOLUME 24H
                            <i class="fa fa-sort-asc px-2" aria-hidden="true"></i>
                          </th>
                          <th key={"campoVolume3"} class={`sort align-middle cursor-pointer ${campoVolume === "baixo" ? "" : "d-none" }`} data-sort="status" style={{width: "200px"}} onClick={() => {
                            setCampoVolume("alto")
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
                                      <h6 class="mb-0 ps-3 fw-bold fs-9">{dado.nome.length > 25 ? `${dado.nome.slice(0, 25)}...`: dado.nome}</h6>
                                  </div></td>
                                  <td class="py-2 align-middle users">
                                  <h6>{new Intl.NumberFormat('en-US', { 
                                    style: 'currency', 
                                    currency: 'USD',
                                    minimumFractionDigits: dado.precoAtual < 0.01 ? 6 : 2,
                                    maximumFractionDigits: dado.precoAtual < 0.01 ? 8 : 2
                                    }).format(dado.precoAtual)}</h6>
                                  </td>
                                  <td class="py-2 align-middle users">
                                  <h6>{new Intl.NumberFormat('en-US', { 
                                    style: 'currency', 
                                    currency: 'USD',
                                    minimumFractionDigits: dado.EMA.diario[14] < 0.01 ? 6 : 2,
                                    maximumFractionDigits: dado.EMA.diario[14] < 0.01 ? 8 : 2
                                    }).format(dado.EMA.diario[14] ?? 0)}</h6>
                                  </td>
                                  <td>
                                  <h6 class="mb-0 fw-bold fs-9">{(dado.RSI.diario["14"] ?? 0).toFixed(2)} - {classificarRSI(dado.RSI.diario[14])}</h6>
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