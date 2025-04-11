import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";

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
                    {/* Rotas públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route path="/esqueceu_senha" element={<EsqueceuSenha />} />
                    <Route path="/sucesso" element={<Sucesso />} />
                    <Route path="/cancelado" element={<Cancelado />} />

                    {/* Rotas protegidas */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout componente={<Dashboard />} />
                        </ProtectedRoute>
                    } />
                    <Route path="/estrategias" element={
                        <ProtectedRoute>
                            <Layout componente={<Estrategias />} />
                        </ProtectedRoute>
                    } />
                    <Route path="/filtros" element={
                        <ProtectedRoute>
                            <Layout componente={<Filtros />} />
                        </ProtectedRoute>
                    } />
                    <Route path="/imposto_de_renda" element={
                        <ProtectedRoute>
                            <Layout componente={<ImpostoDeRenda />} />
                        </ProtectedRoute>
                    } />
                    <Route path="/notificacoes" element={
                        <ProtectedRoute>
                            <Layout componente={<Notificacoes />} />
                        </ProtectedRoute>
                    } />
                    <Route path="/carteiras" element={
                        <ProtectedRoute>
                            <Layout componente={<Carteiras />} />
                        </ProtectedRoute>
                    } />
                    <Route path="/carteiras/:id" element={
                        <ProtectedRoute>
                            <Layout componente={<Carteiras />} />
                        </ProtectedRoute>
                    } />
                    <Route path="/deposito-saque" element={
                        <ProtectedRoute>
                            <Layout componente={<DepositoSaque />} />
                        </ProtectedRoute>
                    } />
                    <Route path="/historico" element={
                        <ProtectedRoute>
                            <Layout componente={<Historico />} />
                        </ProtectedRoute>
                    } />

                    {/* Rota padrão (redireciona para dashboard) */}
                    <Route path="*" element={
                        <ProtectedRoute>
                            <Layout componente={<Dashboard />} />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router> 
        </UserProvider>
    )
}

export default App;