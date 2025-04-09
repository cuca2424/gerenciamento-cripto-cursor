import { createContext, useContext, useState, useEffect } from "react";

// Criando o contexto
const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  // 1️⃣ Recupera a moeda do localStorage (ou usa "USD" como padrão)
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("currency") || "USD";
  });

  // 2️⃣ Estado para armazenar a cotação do dólar
  const [exchangeRate, setExchangeRate] = useState(5.2); // Valor padrão

  // 3️⃣ Efeito que salva a moeda no localStorage e busca a cotação do dólar quando necessário
  useEffect(() => {
    localStorage.setItem("currency", currency); // Salva a moeda escolhida

    if (currency === "BRL") {
      fetch(`${process.env.REACT_APP_ENDPOINT_API}/valor-dolar`)
        .then((res) => res.json())
        .then((data) => {
          setExchangeRate(data.valor); // Atualiza a cotação do dólar
        })
        .catch((err) => console.error("Erro ao buscar cotação:", err));
    }
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Hook para acessar o contexto facilmente
export function useCurrency() {
  return useContext(CurrencyContext);
}
