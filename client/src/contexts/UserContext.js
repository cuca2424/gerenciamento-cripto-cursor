import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const response = await axios.get(`${process.env.REACT_APP_ENDPOINT_API}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setUser(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <UserContext.Provider value={{ user, setUser, logout, fetchUserData }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);