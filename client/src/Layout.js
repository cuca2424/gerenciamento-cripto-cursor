import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import { useCurrency } from "./contexts/CurrencyContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import "./paginas/Auth/custom.css";

function Layout({componente}) {
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const { user, logout, fetchUserData } = useUser();
  const phoneInputRef = useRef(null);

  {/* menu do topo */}
  const [itemsMenuTopo, setItemsMenuTopo] = useState(() => {
    const storedItems = localStorage.getItem("itemsMenuTopo");
    return storedItems ? JSON.parse(storedItems) : [];
  });

  {/* funções para mudar o menu do topo */}

  const handleDeletar = (rota) => {
    setItemsMenuTopo((prevItems) => prevItems.filter((item) => item.rota !== rota));
  };

  const handleMenuClick = (item) => {
    setItemsMenuTopo((prevItems) => {
      if (!prevItems.some((menuItem) => menuItem.rota === item.rota)) {
        return [...prevItems, item];
      }
      return prevItems;
    });
  };


  {/* pegando a rota atual */}
  let rotaAtual = useLocation().pathname;


  useEffect(() => {
    localStorage.setItem("itemsMenuTopo", JSON.stringify(itemsMenuTopo));
    if (window.feather) {
      setTimeout(() => {
        window.feather.replace();
      }, 100);
    }
  }, [itemsMenuTopo]);


  useEffect(() => {

    {/* função para pesquisar valores no localStorage */}
    const pesquisarLocalStorage = (chave, valorPadrao, store = localStorage) => {
      try {
        return JSON.parse(store.getItem(chave)) || valorPadrao;
      } catch {
        return store.getItem(chave) || valorPadrao;
      }
    };

    {/* recuperando o modo do thema no localstorage */}
    const modoAtual = pesquisarLocalStorage('phoenixTheme');
    
    {/* ajustando o emoji conforme o modo */}
    if (modoAtual === "dark") {
      const botaoControladorDoTema = document.getElementById('themeControlToggle');
      botaoControladorDoTema.checked = true;
    }

    {/* reimportando o script com funcionalidades */}
    const script = document.createElement('script');
    script.src = '/assets/js/phoenix.js';
    script.async = true;
    document.body.appendChild(script);

    const script2 = document.createElement('script');
    script2.src = './assets/js/echarts-example.js';
    script2.async = true;
    document.body.appendChild(script2)
    
    script.onload = () => {
      if (window.feather) {
        window.feather.replace();
      }
    };

    

    {/* importações do projeto original */}
    let phoenixIsRTL = window.config.config.phoenixIsRTL;
      if (phoenixIsRTL) {
        let linkDefault = document.getElementById('style-default');
        let userLinkDefault = document.getElementById('user-style-default');
        linkDefault.setAttribute('disabled', true);
        userLinkDefault.setAttribute('disabled', true);
        document.querySelector('html').setAttribute('dir', 'rtl');
      } else {
        let linkRTL = document.getElementById('style-rtl');
        let userLinkRTL = document.getElementById('user-style-rtl');
        linkRTL.setAttribute('disabled', true);
        userLinkRTL.setAttribute('disabled', true);
      }

    let navbarTopStyle = window.config.config.phoenixNavbarTopStyle;
    let navbarTop = document.querySelector('.navbar-top');
      if (navbarTopStyle === 'darker') {
        navbarTop.setAttribute('data-navbar-appearance', 'darker');
      }

    let navbarVerticalStyle = window.config.config.phoenixNavbarVerticalStyle;
    let navbarVertical = document.querySelector('.navbar-vertical');
      if (navbarVertical && navbarVerticalStyle === 'darker') {
        navbarVertical.setAttribute('data-navbar-appearance', 'darker');
      }
  },[])

  const handleUpdatePhone = async () => {
    try {
      if (newPhone.length < 5) {
        setPhoneError("Número de telefone inválido");
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/usuario/telefone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ telefone: newPhone })
      });

      if (response.ok) {
        setShowPhoneModal(false);
        setNewPhone("");
        setPhoneError("");
        // Atualizar o contexto do usuário
        await fetchUserData();
      } else {
        const data = await response.json();
        setPhoneError(data.message || "Erro ao atualizar telefone");
      }
    } catch (error) {
      setPhoneError("Erro ao conectar com o servidor");
    }
  };

  return (
    <div>
      <div>
      {/* conteúdo principal */}
      <main class="main" id="top">

        {/* menu lateral */}
        <nav class="navbar navbar-vertical navbar-expand-xl">
          <div class="collapse navbar-collapse" id="navbarVerticalCollapse">
            <div class="navbar-vertical-content">
              <ul class="navbar-nav flex-column" id="navbarVerticalNav">
                <li class="nav-item">

                  {/* label do menu lateral - Análise */}
                  <p class="navbar-vertical-label">Análise
                  </p>

                  {/* item do menu lateral - Dashboard */}
                  <div class="nav-item-wrapper">
                    <Link to={"/"} name="dash" className={rotaAtual === "/" ? "nav-link active label-1" : "nav-link label-1"} role="button" data-bs-toggle="" aria-expanded="false" onClick={() => handleMenuClick({nome: "Dashboard", rota: "/", icone: "pie-chart"})}>
                      <div class="d-flex align-items-center"><span class="nav-link-icon"><span data-feather="pie-chart" style={{height: "16px", width: "16px"}}></span></span><span class="nav-link-text-wrapper"><span class="nav-link-text">Dashboard</span></span>
                      </div>
                    </Link>
                  </div>

                  {/* item do menu lateral - Carteiras */}
                  <div class="nav-item-wrapper">
                    <Link to={"/carteiras"} className={rotaAtual.startsWith("/carteiras") ? "nav-link active label-1" : "nav-link label-1"} role="button" data-bs-toggle="" aria-expanded="false" onClick={() => handleMenuClick({nome: "Carteiras", rota: "/carteiras", icone: "credit-card"})}>
                      <div class="d-flex align-items-center"><span class="nav-link-icon"><span data-feather="credit-card" style={{height: "16px", width: "16px"}}></span></span><span class="nav-link-text-wrapper"><span class="nav-link-text">Carteiras</span></span>
                      </div>
                    </Link>
                  </div>

                  {/* item do menu lateral - Depósito/Saque */}
                  <div class="nav-item-wrapper">
                    <Link to={"/deposito-saque"} className={rotaAtual === "/deposito-saque" ? "nav-link active label-1" : "nav-link label-1"} role="button" data-bs-toggle="" aria-expanded="false" onClick={() => handleMenuClick({nome: "Depósito/Saque", rota: "/deposito-saque", icone: "dollar-sign"})}>
                      <div class="d-flex align-items-center"><span class="nav-link-icon"><span data-feather="dollar-sign" style={{height: "16px", width: "16px"}}></span></span><span class="nav-link-text-wrapper"><span class="nav-link-text">Depósito/Saque</span></span>
                      </div>
                    </Link>
                  </div>

                  {/* item do menu lateral - Histórico */}
                  <div class="nav-item-wrapper">
                    <Link to={"/historico"} className={rotaAtual === "/historico" ? "nav-link active label-1" : "nav-link label-1"} role="button" data-bs-toggle="" aria-expanded="false" onClick={() => handleMenuClick({nome: "Histórico", rota: "/historico", icone: "clock"})}>
                      <div class="d-flex align-items-center"><span class="nav-link-icon"><span data-feather="clock" style={{height: "16px", width: "16px"}}></span></span><span class="nav-link-text-wrapper"><span class="nav-link-text">Histórico</span></span>
                      </div>
                    </Link>
                  </div>

                  {/* label do menu lateral - Filtros */}
                  <p class="navbar-vertical-label">Monitoramento
                  </p>

                  {/* item do menu lateral - Estratégias */}
                  <div class="nav-item-wrapper">
                    <Link to={"/estrategias"} className={rotaAtual === "/estrategias" ? "nav-link active label-1" : "nav-link label-1"} role="button" data-bs-toggle="" aria-expanded="false" onClick={() => handleMenuClick({nome: "Estratégias", rota: "/estrategias", icone: "target"})}>
                      <div class="d-flex align-items-center"><span class="nav-link-icon"><span data-feather="target" style={{height: "16px", width: "16px"}}></span></span><span class="nav-link-text-wrapper"><span class="nav-link-text">Estratégias</span></span>
                      </div>
                    </Link>
                  </div>

                  {/* item do menu lateral - Filtros */}
                  <div class="nav-item-wrapper">
                    <Link to={"/filtros"} className={rotaAtual === "/filtros" ? "nav-link active label-1" : "nav-link label-1"} role="button" data-bs-toggle="" aria-expanded="false" onClick={() => handleMenuClick({nome: "Filtros", rota: "/filtros", icone: "filter"})}>
                      <div class="d-flex align-items-center"><span class="nav-link-icon"><span data-feather="filter" style={{height: "16px", width: "16px"}}></span></span><span class="nav-link-text-wrapper"><span class="nav-link-text">Filtros</span></span>
                      </div>
                    </Link>
                  </div>

                  {/* label do menu lateral - Financeiro */}
                  <p class="navbar-vertical-label">Financeiro
                  </p>

                  {/* item do menu lateral - Imposto de renda */}
                  <div class="nav-item-wrapper">
                    <Link to={"/imposto_de_renda"} className={rotaAtual === "/imposto_de_renda" ? "nav-link active label-1" : "nav-link label-1"} role="button" data-bs-toggle="" aria-expanded="false" onClick={() => handleMenuClick({nome: "Imposto De Renda", rota: "/imposto_de_renda", icone: "dollar-sign"})}>
                      <div class="d-flex align-items-center"><span class="nav-link-icon"><span data-feather="dollar-sign" style={{height: "16px", width: "16px"}}></span></span><span class="nav-link-text-wrapper"><span class="nav-link-text">Imposto de renda</span></span>
                      </div>
                    </Link>
                  </div>

                  {/* Seção de Admin (apenas para usuários admin) */}
                  {user?.role === 'admin' && (
                    <>
                      <p class="navbar-vertical-label">Administração
                      </p>
                      <div class="nav-item-wrapper">
                        <Link to={"/admin"} className={rotaAtual === "/admin" ? "nav-link active label-1" : "nav-link label-1"} role="button" data-bs-toggle="" aria-expanded="false" onClick={() => handleMenuClick({nome: "Admin", rota: "/admin", icone: "settings"})}>
                          <div class="d-flex align-items-center"><span class="nav-link-icon"><span data-feather="settings" style={{height: "16px", width: "16px"}}></span></span><span class="nav-link-text-wrapper"><span class="nav-link-text">Painel Admin</span></span>
                          </div>
                        </Link>
                      </div>
                    </>
                  )}
                </li>
              </ul>
            </div>
          </div>
          {/* footer do menu lateral*/}
          <div class="navbar-vertical-footer">
            <button class="btn navbar-vertical-toggle border-0 fw-semibold w-100 white-space-nowrap d-flex align-items-center"><span class="uil uil-left-arrow-to-left fs-8"></span><span class="uil uil-arrow-from-right fs-8"></span><span class="navbar-vertical-footer-text ms-2">Visão minimizada</span></button>
          </div>
        </nav>
        <nav class="navbar navbar-top fixed-top navbar-expand" id="navbarDefault">
          <div class="collapse navbar-collapse justify-content-between">
            {/* logo acima do menu lateral */}
            <div class="navbar-logo">
              <button class="btn navbar-toggler navbar-toggler-humburger-icon hover-bg-transparent" type="button" data-bs-toggle="collapse" data-bs-target="#navbarVerticalCollapse" aria-controls="navbarVerticalCollapse" aria-expanded="false" aria-label="Toggle Navigation"><span class="navbar-toggle-icon"><span class="toggle-line"></span></span></button>
              <Link to={"/"} class="navbar-brand me-1 me-sm-3">
                <div class="d-flex align-items-center">
                  <div class="d-flex align-items-center">
                    {/* imgem da logo bem aqui width="27 */}
                    <h5 class="logo-text ms-2 d-none d-sm-block">Projeto</h5>
                  </div>
                </div>
              </Link>
            </div>
            {/* menu do top */}
            <div class="navbar-content">
              <ul class="navbar-nav nav-pills">
                {itemsMenuTopo.map(item => {
                  return(
                    <li className="nav-item mx-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <Link
                        to={item.rota}
                        className={
                          rotaAtual === item.rota
                            ? "nav-link active label-1 mx-1 d-flex align-items-center m-1 p-1"
                            : "nav-link label-1 mx-1 d-flex align-items-center m-1 p-1"
                        }
                        role="button"
                        aria-expanded="false"
                      >
                        <span className="nav-link-icon d-inline d-md-none">
                          <span
                            data-feather={item.icone}
                            style={{ height: "20px", width: "20px" }}
                          ></span>
                        </span>
                        <span className="nav-link-text-wrapper">
                          <span className="nav-link-text d-none d-md-inline">
                            {item.nome}
                          </span>
                        </span>
                      <button
                        className="btn btn-phoenix-primary rounded-circle d-flex align-items-center justify-content-center ms-2 p-1"
                        style={{ width: "20px", height: "20px" }}
                        onClick={(e) =>{ 
                          e.preventDefault();
                          handleDeletar(item.rota);
                        }}
                      >
                        <span
                          data-feather="x"
                          style={{ height: "20px", width: "20px" }}
                        ></span>
                      </button>
                      </Link>
                    </div>
                  </li>
                  )
                })}
              </ul>
            </div>

            <ul class="navbar-nav navbar-nav-icons flex-row">
              <li class="nav-item d-flex">
                {/* Currency buttons container */}
                <div class="d-flex currency-toggle-container" style={{ gap: "8px", padding: "0 8px" }}>
                  {/* USD button */}
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`btn ${currency === "USD" ? 'btn-primary' : 'btn-outline-primary'}`}
                    style={{
                      minWidth: "64px",
                      height: "32px",
                      padding: "4px 12px",
                      fontSize: "13px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                      transform: currency === "USD" ? "scale(1)" : "scale(1)",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <span style={{
                      position: "relative",
                      zIndex: 2,
                      color: currency === "USD" ? "white" : "#3874ff",
                      fontWeight: "700"
                    }}>USD</span>
                    {currency === "USD" && (
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "#3874ff",
                        animation: "ripple 0.6s linear"
                      }} />
                    )}
                  </button>

                  {/* BRL button */}
                  <button
                    onClick={() => setCurrency("BRL")}
                    className={`btn ${currency === "BRL" ? 'btn-primary' : 'btn-outline-primary'}`}
                    style={{
                      minWidth: "64px",
                      height: "32px",
                      padding: "4px 12px",
                      fontSize: "13px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                      transform: currency === "BRL" ? "scale(1)" : "scale(1)",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <span style={{
                      position: "relative",
                      zIndex: 2,
                      color: currency === "BRL" ? "white" : "#3874ff",
                      fontWeight: "700"
                    }}>BRL</span>
                    {currency === "BRL" && (
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "#3874ff",
                        animation: "ripple 0.6s linear"
                      }} />
                    )}
                  </button>
                </div>
              </li>

              <li class="nav-item">
                {/* botao do tema */}
                <div class="theme-control-toggle px-2">
                  <input class="form-check-input ms-0 theme-control-toggle-input" type="checkbox" data-theme-control="phoenixTheme" value="dark" id="themeControlToggle" />
                  <label class="mb-0 theme-control-toggle-label theme-control-toggle-light" for="themeControlToggle" data-bs-placement="left" data-bs-title="Switch theme" style={{height: "32px", width: "32px"}}>
                    <span class="icon" data-feather="moon" style={{height: "16px", width: "16px"}}></span>
                  </label>
                  <label class="mb-0 theme-control-toggle-label theme-control-toggle-dark" for="themeControlToggle" data-bs-placement="left" data-bs-title="Switch theme" style={{height: "32px", width: "32px"}}>
                    <span class="icon" data-feather="sun" style={{height: "16px", width: "16px"}}></span>
                  </label>
                </div>
              </li>
              
              {/* ícone de configurações */}
              <li class="nav-item dropdown"><a class="nav-link lh-1 pe-0" id="navbarDropdownUser" href="#!" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-haspopup="true" aria-expanded="false">
                <div class="avatar avatar-l d-flex align-items-center justify-content-center">
                  <span data-feather="settings" style={{height: "24px", width: "24px"}}></span>
                </div>
              </a>

              {/* card de configurações */}
                <div class="dropdown-menu dropdown-menu-end navbar-dropdown-caret py-0 dropdown-profile shadow border" aria-labelledby="navbarDropdownUser">
                  <div class="card position-relative border-0">
                    <div class="card-body p-0">
                      <div class="text-center pt-4 pb-3">
                        <h6 class="text-body-emphasis fw-semibold">{user?.nome || "Usuário"}</h6>
                        <p class="text-body-tertiary mb-0">{user?.email || ""}</p>
                        <p class="text-body-tertiary mb-3">{user?.telefone || "Sem telefone cadastrado"}</p>
                      </div>
                    </div>
                    <div class="px-3 pb-3">
                      <button class="btn btn-phoenix-secondary d-flex flex-center w-100 mb-3" onClick={() => setShowPhoneModal(true)}>
                        <span class="me-2" data-feather="phone"></span>Alterar Telefone
                      </button>
                      <button class="btn btn-phoenix-secondary d-flex flex-center w-100" onClick={() => {
                        logout();
                        navigate("/login");
                      }}><span class="me-2" data-feather="log-out"></span>Sair</button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </nav>

        {/* Modal de alteração de telefone */}
        {showPhoneModal && (
          <div class="modal show" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Alterar Número de Telefone</h5>
                  <button type="button" class="btn-close" onClick={() => {
                    setShowPhoneModal(false);
                    setNewPhone("");
                    setPhoneError("");
                  }}></button>
                </div>
                <div class="modal-body">
                  <div class="mb-3 text-start">
                    <label class="form-label" for="phone">Novo número de telefone</label>
                    <PhoneInput
                      ref={phoneInputRef}
                      country="br"
                      value={newPhone}
                      onChange={setNewPhone}
                      inputClass="form-control custom-input w-100"
                      dropdownClass="custom-dropdown"
                      placeholder="+55 (11) 9 11111111"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleUpdatePhone();
                        }
                      }}
                    />
                    {phoneError && <div class="text-danger mt-2">{phoneError}</div>}
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" onClick={() => {
                    setShowPhoneModal(false);
                    setNewPhone("");
                    setPhoneError("");
                  }}>Cancelar</button>
                  <button type="button" class="btn btn-primary" onClick={handleUpdatePhone}>Salvar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div class="content px-2 pt-10 pb-0">
          {/* conteúdo do componente */}
          {componente}
        </div>

      </main>
    </div>
  </div>
      
  );
}

export default Layout;
