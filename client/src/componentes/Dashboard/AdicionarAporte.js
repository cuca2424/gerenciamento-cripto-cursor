import { useState, useEffect, useCallback } from "react";

function AdicionarAporte({carteiras = [], botaoCarteira, funcaoRecarregar}) {

    // useStates
    const [criptomoedas, setCriptomoedas] = useState([]);
    const [criptomoedaNome, setCriptomoedaNome] = useState(""); // Nome visível no input
    const [criptomoedaSimbolo, setCriptomoedaSimbolo] = useState(""); // Símbolo enviado no formulário
    const [filteredList, setFilteredList] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    // buscar ativos

    useEffect(() => {
        const fetchCriptomoedas = async () => {
          try {
            const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/criptomoedas/lista`);
            if (response.ok) {
              const prices = await response.json();
              const criptoPrices = prices.map((price) => ({
                nome: price.nome,
                simbolo: price.id,
              }));
              console.log("criptoPrices: ", criptoPrices.slice(0, 2)); // Confirmar dados aqui
              setCriptomoedas(criptoPrices); // Atualizar estado com os dados mapeados
            } else {
              console.error("Erro ao buscar criptomoedas:", response.statusText);
            }
          } catch (error) {
            console.error("Erro na requisição:", error);
          }
        };
      
        fetchCriptomoedas();
      }, []);

    // dropdown com pesquisa

    const criptomoedass = [
        { nome: "Bitcoin", simbolo: "bitcoin" },
        { nome: "Ethereum", simbolo: "ethereum" },
        { nome: "Ripple", simbolo: "ripple" },
        { nome: "Solana", simbolo: "solana" },
        // adicione suas criptomoedas aqui
    ];

    // Função para debounce, reduzindo chamadas excessivas durante a digitação
      const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => func(...args), delay);
        };
      };
    
      const handleInputChange = useCallback(
        debounce((value) => {
          if (value.trim() === "") {
            setFilteredList([]);
            setIsDropdownVisible(false);
          } else {
            const filtered = criptomoedas.filter((item) =>
              item.nome.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredList(filtered);
            setIsDropdownVisible(true);
          }
        }, 100),
        [criptomoedas]
      );
    
      const onInputChange = (e) => {
        const value = e.target.value;
        setCriptomoedaNome(value); // Atualiza o nome visível
        setCriptomoedaSimbolo(""); // Reseta o símbolo quando o usuário digita
        handleInputChange(value);
      };
    
      const handleOptionClick = (nome, simbolo) => {
        setCriptomoedaNome(nome); // Define o nome visível no input
        setCriptomoedaSimbolo(simbolo); // Armazena o símbolo para envio
        setIsDropdownVisible(false);
      };
    
      useEffect(() => {
        if (criptomoedaNome.trim() === "") {
          setFilteredList([]);
          setIsDropdownVisible(false);
        }
      }, [criptomoedaNome]);
    
      const handleSubmitTest = (e) => {
        e.preventDefault();
        console.log("id_carteira: ", carteiraForm.value);
        console.log("criptmoeda: ", criptomoedaSimbolo);
        console.log("preco: ", preco);
        console.log("quantidade: ", quantidade);
      };

    console.log("criptmoedas: ", criptomoedas);


    //////////////////////////////////////////////////////////////////
    const [mensagemErroAdicionarAporte, setMensagemErroAdicionarAporte] = useState("");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const id_carteira = carteiraForm.value;
        console.log("dados: ", id_carteira, criptomoedaSimbolo, quantidade, preco);
        
        try {
            const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/aporte`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id_carteira: id_carteira,
                criptomoeda: criptomoedaSimbolo,
                preco: preco,
                quantidade: quantidade
              }),
            });
      
            if (response.ok) {
              funcaoRecarregar();
              setMensagemErroAdicionarAporte("");
              setCriptomoeda("");
              setPreco("");
              setQuantidade("");
              closeModal("modalAdicionarAporte");    
            } else {
              const errorMessage = await response.text();
              setMensagemErroAdicionarAporte(errorMessage);
            }
      
          } catch (err) {
            console.log(err)
          }
    }

    return(
        <div className="adicionarAporte">
            {/* Modal */}
            <div
                className="modal fade"
                id="modalAdicionarAporte"
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
                                    <h4 class="card-title mb-4">Adicionar Aporte</h4>
                                    <div class="row gx-3">
                                        
                                        <div class="col-12 col-sm-6 col-xl-12">
                                            <div class="mb-4">
                                                <div class="d-flex flex-wrap mb-2">
                                                <h5 class="mb-0 text-body-highlight me-2">Carteira</h5>
                                                <a class="fw-bold fs-9" href="#!" data-bs-toggle="modal"
                                                data-bs-target="#modalCriarCarteira"
                                                onClick={botaoCarteira}>Criar nova carteira</a>
                                                </div>
                                                <select class="form-select mb-3" id="formCarteira" aria-label="category" onKeyDown={e => {
                                                    handleKeyDown(e, "formCriptomoeda")
                                                }}>
                                                {
                                                carteiras ? (
                                                    carteiras.map((carteira) => {
                                                        return(
                                                            <option value={carteira._id}>{carteira.nome}</option>
                                                        )
                                                    })
                                                ) : (
                                                    ""
                                                )
                                                }
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-6 col-xl-12">
                                            <div class="mb-4">
                                                <h5 class="mb-2 text-body-highlight">Criptomoeda</h5>
                                                <div className="dropdown">
                                                    <input
                                                        className="form-control mb-xl-3"
                                                        type="text"
                                                        placeholder="Pesquise uma criptomoeda"
                                                        value={criptomoedaNome}
                                                        onKeyDown={e => {
                                                            handleKeyDown(e, "formPreco")
                                                        }}
                                                        onChange={onInputChange}
                                                        onFocus={() => setIsDropdownVisible(true)}
                                                        onBlur={() => setTimeout(() => setIsDropdownVisible(false), 100)} // Delay para permitir clique nas opções
                                                    />
                                                    {isDropdownVisible && (
                                                    <ul className="dropdown-menu w-100 show">
                                                        {filteredList.length > 0 ? (
                                                        filteredList.slice(0, 5).map((item, index) => (
                                                            <li key={index}>
                                                            <a
                                                                className="dropdown-item"
                                                                href="#!"
                                                                onClick={() => handleOptionClick(item.nome, item.simbolo)}
                                                            >
                                                                {item.nome}
                                                            </a>
                                                            </li>
                                                        ))
                                                        ) : (
                                                        <li>
                                                            <a className="dropdown-item" href="#!">
                                                            Nenhuma correspondência
                                                            </a>
                                                        </li>
                                                        )}
                                                    </ul>
                                                    )}
                                                    </div>
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-6 col-xl-12">
                                            <div class="mb-4">
                                                <h5 class="mb-2 text-body-highlight">Preço</h5>
                                                <input class="form-control mb-xl-3" type="number" placeholder="Preço" id="formPreco" value={preco} onChange={e => setPreco(e.target.value)} onKeyDown={e => {
                                                    handleKeyDown(e, "formQuantidade")
                                                }} step="any" />
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-6 col-xl-12">
                                            <div class="mb-4">
                                                <h5 class="mb-2 text-body-highlight" value={quantidade}>Quantidade</h5>
                                                <input class="form-control mb-xl-3" type="number" placeholder="Quantidade" id="formQuantidade" value={quantidade} onChange={e => setQuantidade(e.target.value)} step="any"/>
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
                                        Adicionar Aporte
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

export default AdicionarAporte;