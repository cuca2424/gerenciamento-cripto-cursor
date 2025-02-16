import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode as jwt_decode } from "jwt-decode";
import { UserProvider } from "./contexts/UserContext";

import Layout from "./paginas/Privadas/Layout";
import Dashboard from "./paginas/Privadas/Dashboard";
import Filtros from "./paginas/Privadas/Filtros";
import ImpostoDeRenda from "./paginas/Privadas/ImpostoDeRenda";
import SentimentoDeMercado from "./paginas/Privadas/SentimentoDeMercado";
import Login from "./paginas/Auth/Login";
import Cadastro from "./paginas/Auth/Cadastro";
import EsqueceuSenha from "./paginas/Auth/EsqueceuSenha";
import Sucesso from "./paginas/PosCheckout/Sucesso";
import Cancelado from "./paginas/PosCheckout/Cancelado";
import Teste01 from "./paginas/Testes/Teste01";


const Privado = ({ Item }) => {
    const [estaAutenticado, setEstaAutenticado] = useState(false);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwt_decode(token); 
                const isTokenValid = decoded.exp * 1000 > Date.now();
                setEstaAutenticado(isTokenValid);
            } catch (error) {
                console.error("Token inválido:", error);
                setEstaAutenticado(false);
            }
        }
    setCarregando(false);
    }, []);

    if (!carregando) {
        return estaAutenticado ? <Item /> : <Navigate to="/login" />;
    }

};



function App() {
    return(
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/" element={< Privado Item={() => <Layout componente={<Dashboard />}/>}/>}/>
                    <Route path="/filtros" element={< Privado Item={() => <Layout componente={<Filtros />}/>}/>}/>
                    <Route path="/imposto_de_renda" element={< Privado Item={() => <Layout componente={<ImpostoDeRenda />}/>}/>}/>
                    <Route path="/sentimento_de_mercado" element={< Privado Item={() => <Layout componente={<SentimentoDeMercado />}/>}/>}/>
                    
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route path="/esqueceu_senha" element={<EsqueceuSenha />} />
                    <Route path="/sucesso" element={<Sucesso />} />
                    <Route path="/cancelado" element={<Cancelado />} />
                    <Route path="*" element={<Login />} />
                    <Route path="/test01" element={<Layout componente={<Teste01 />}/>} />
                </Routes>
            </Router> 
        </UserProvider>
    )
}

export default App;