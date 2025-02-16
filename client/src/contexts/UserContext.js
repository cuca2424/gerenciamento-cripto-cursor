import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode as jwt_decode} from "jwt-decode";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const descodificado = jwt_decode(token);
                const tokenValido = descodificado.exp * 1000 > Date.now();
                if (tokenValido) {
                    setUser({ id: descodificado.id, email: descodificado.email });
                } else {
                    localStorage.removeItem("token");
                    setUser(null);
                }
            } catch (error) {
                console.error("Erro ao decodificar o token:", error);
                localStorage.removeItem("token");
                setUser(null);
            }
        }
    }, []);

    return (
        <UserContext.Provider value={{ user }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);