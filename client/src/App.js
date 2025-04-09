import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { UserProvider } from "./contexts/UserContext";

import Layout from "./Layout";
import Dashboard from "./paginas/Privadas/Dashboard";
import Filtros from "./paginas/Privadas/Filtros";
import ImpostoDeRenda from "./paginas/Privadas/ImpostoDeRenda";
import Login from "./paginas/Auth/Login";
import Cadastro from "./paginas/Auth/Cadastro";
import EsqueceuSenha from "./paginas/Auth/EsqueceuSenha";
import Sucesso from "./paginas/PosCheckout/Sucesso";
import Cancelado from "./paginas/PosCheckout/Cancelado";
import Notificacoes from "./paginas/Privadas/Notificacoes";
import Estrategias from "./paginas/Privadas/Estrategias";
import Carteiras from "./paginas/Privadas/Carteiras";
import DepositoSaque from "./paginas/Privadas/DepositoSaque";
import Historico from "./paginas/Privadas/Historico";

function App() {
    return(
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Layout componente={<Dashboard />}/>}/>
                    <Route path="/estrategias" element={<Layout componente={<Estrategias />}/>}/>
                    <Route path="/filtros" element={<Layout componente={<Filtros />}/>}/>
                    <Route path="/imposto_de_renda" element={<Layout componente={<ImpostoDeRenda />}/>}/>
                    <Route path="/notificacoes" element={<Layout componente={<Notificacoes/>}/>}/>
                    <Route path="/carteiras" element={<Layout componente={<Carteiras />}/>}/>
                    <Route path="/deposito-saque" element={<Layout componente={<DepositoSaque />}/>}/>
                    <Route path="/historico" element={<Layout componente={<Historico />}/>}/>
                    
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route path="/esqueceu_senha" element={<EsqueceuSenha />} />
                    <Route path="/sucesso" element={<Sucesso />} />
                    <Route path="/cancelado" element={<Cancelado />} />
                    <Route path="*" element={<Layout componente={<Dashboard />}/>} />
                </Routes>
            </Router> 
        </UserProvider>
    )
}

export default App;