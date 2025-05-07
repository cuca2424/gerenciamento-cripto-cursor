import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./Layout";
import Login from "./paginas/Auth/Login";
import Cadastro from "./paginas/Auth/Cadastro";
import EsqueceuSenha from "./paginas/Auth/EsqueceuSenha";
import RedefinirSenha from "./paginas/Auth/RedefinirSenha";
import VerificarEmail from "./paginas/Auth/VerificarEmail";
import Sucesso from "./paginas/PosCheckout/Sucesso";
import Cancelado from "./paginas/PosCheckout/Cancelado";
import ContaInativa from './paginas/Auth/ContaInativa';

// Lazy loading para componentes protegidos
const Dashboard = lazy(() => import("./paginas/Privadas/Dashboard"));
const Filtros = lazy(() => import("./paginas/Privadas/Filtros"));
const ImpostoDeRenda = lazy(() => import("./paginas/Privadas/ImpostoDeRenda"));
const Notificacoes = lazy(() => import("./paginas/Privadas/Notificacoes"));
const Estrategias = lazy(() => import("./paginas/Privadas/Estrategias"));
const Carteiras = lazy(() => import("./paginas/Privadas/Carteiras"));
const DepositoSaque = lazy(() => import("./paginas/Privadas/DepositoSaque"));
const Historico = lazy(() => import("./paginas/Privadas/Historico"));
const Admin = lazy(() => import("./paginas/Privadas/Admin"));

// Componente de loading
const LoadingComponent = () => (
    <div className="text-center p-5">
        <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
        </div>
    </div>
);

function App() {
    return(
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route path="/esqueceu_senha" element={<EsqueceuSenha />} />
                    <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
                    <Route path="/verificar-email/:token" element={<VerificarEmail />} />
                    <Route path="/sucesso" element={<Sucesso />} />
                    <Route path="/cancelado" element={<Cancelado />} />
                    <Route path="/conta-inativa" element={<ContaInativa />} />

                    {/* Rotas protegidas */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingComponent />}>
                                <Layout componente={<Dashboard />} />
                            </Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/estrategias" element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingComponent />}>
                                <Layout componente={<Estrategias />} />
                            </Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/filtros" element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingComponent />}>
                                <Layout componente={<Filtros />} />
                            </Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/imposto_de_renda" element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingComponent />}>
                                <Layout componente={<ImpostoDeRenda />} />
                            </Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/notificacoes" element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingComponent />}>
                                <Layout componente={<Notificacoes />} />
                            </Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/carteiras" element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingComponent />}>
                                <Layout componente={<Carteiras />} />
                            </Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/carteiras/:id" element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingComponent />}>
                                <Layout componente={<Carteiras />} />
                            </Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/deposito-saque" element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingComponent />}>
                                <Layout componente={<DepositoSaque />} />
                            </Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/historico" element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingComponent />}>
                                <Layout componente={<Historico />} />
                            </Suspense>
                        </ProtectedRoute>
                    } />

                    {/* Rota do Admin */}
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingComponent />}>
                                <Layout componente={<Admin />} />
                            </Suspense>
                        </ProtectedRoute>
                    } />

                    {/* Rota padrão (redireciona para dashboard) */}
                    <Route path="*" element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingComponent />}>
                                <Layout componente={<Dashboard />} />
                            </Suspense>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router> 
        </UserProvider>
    )
}

export default App;