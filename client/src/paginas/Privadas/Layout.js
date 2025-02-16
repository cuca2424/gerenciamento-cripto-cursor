import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Layout({componente}) {
  const navigate = useNavigate();

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

  return (
    <div>
      <div>
      {/* conteúdo principal */}
      <main class="main" id="top">

        {/* menu lateral */}
        <nav class="navbar navbar-vertical navbar-expand-lg">
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

                  {/* item do menu lateral - Sentimento de Mercado*/}
                  <div class="nav-item-wrapper">
                    <Link to={"/sentimento_de_mercado"} className={rotaAtual === "/sentimento_de_mercado" ? "nav-link active label-1" : "nav-link label-1"} role="button" data-bs-toggle="" aria-expanded="false" onClick={() => handleMenuClick({nome: "Sentimento De Mercado", rota: "/sentimento_de_mercado", icone: "activity"})}>
                      <div class="d-flex align-items-center"><span class="nav-link-icon"><span data-feather="activity" style={{height: "16px", width: "16px"}}></span></span><span class="nav-link-text-wrapper"><span class="nav-link-text">Sentimento de mercado</span></span>
                      </div>
                    </Link>
                  </div>

                  {/* label do menu lateral - Filtros */}
                  <p class="navbar-vertical-label">Filtros
                  </p>

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
              <li class="nav-item">
                {/* botao do tema */}
                <div class="theme-control-toggle px-2">

                  <input class="form-check-input ms-0 theme-control-toggle-input" type="checkbox" data-theme-control="phoenixTheme" value="dark" id="themeControlToggle" />

                  <label class="mb-0 theme-control-toggle-label theme-control-toggle-light" for="themeControlToggle" data-bs-placement="left" data-bs-title="Switch theme" style={{height: "32px", width: "32px"}}>
                    <span class="icon" data-feather="moon" style={{height: "16px", width: "16px"}}></span></label>
                    
                  <label class="mb-0 theme-control-toggle-label theme-control-toggle-dark" for="themeControlToggle" data-bs-placement="left" data-bs-title="Switch theme" style={{height: "32px", width: "32px"}}><span class="icon" data-feather="sun" style={{height: "16px", width: "16px"}}></span></label>

                </div>
              </li>

              {/* foto de perfil */}
              <li class="nav-item dropdown"><a class="nav-link lh-1 pe-0" id="navbarDropdownUser" href="#!" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-haspopup="true" aria-expanded="false">
                <div class="avatar avatar-l ">
                  <img class="rounded-circle " src="../assets/img/team/40x40/57.webp" alt="" />
                </div>
              </a>

              {/* card da foto de perfil */}
                <div class="dropdown-menu dropdown-menu-end navbar-dropdown-caret py-0 dropdown-profile shadow border" aria-labelledby="navbarDropdownUser">
                  <div class="card position-relative border-0">
                    <div class="card-body p-0">
                      <div class="text-center pt-4 pb-3">
                        <div class="avatar avatar-xl ">
                          <img class="rounded-circle " src="assets/img/team/72x72/57.webp" alt="" />
                        </div>
                        <h6 class="mt-2 text-body-emphasis">Jerry Seinfield</h6>
                      </div>
                    </div>
                    <div class="overflow-auto scrollbar" style={{height: "10rem"}}>
                      <ul class="nav d-flex flex-column mb-2 pb-1">
                        <li class="nav-item"><a class="nav-link px-3 d-block" href="#!"><span class="me-2 text-body align-bottom" data-feather="pie-chart"></span>Dashboard</a></li>
                        <li class="nav-item"><a class="nav-link px-3 d-block" href="#!"> <span class="me-2 text-body align-bottom" data-feather="settings"></span>Configurações</a></li>
                      </ul>
                    </div>
                      <div class="px-3"> 
                        <button class="btn btn-phoenix-secondary d-flex flex-center w-100" onClick={() => {
                          localStorage.removeItem("token");
                          navigate("/login");
                        }}> <span class="me-2" data-feather="log-out"> </span>Sair</button>
                      </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </nav>

        <div class="content px-4 pt-10 pb-0">
          {/* conteúdo do componente */}
          {componente}
        </div>

      </main>
    </div>
  </div>
      
  );
}

export default Layout;
