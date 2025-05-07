import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          // Se a assinatura estiver inativa, limpar dados e redirecionar para página específica
          if (data.code === 'INACTIVE_SUBSCRIPTION') {
            // Não remover o token para assinatura inativa
            setError({ type: 'subscription', email: user.email });
          } 
          // Se a conta estiver inativa, não limpar dados
          else if (data.code === 'INACTIVE_ACCOUNT') {
            setError({ type: 'account', email: user.email });
          }
          // Para outros erros de autenticação, limpar os dados
          else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Erro ao validar token:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    // Se o erro for de assinatura, redireciona para página de renovação
    if (error?.type === 'subscription') {
      return <Navigate to={`/renovar-assinatura?email=${encodeURIComponent(error.email || '')}`} replace />;
    }
    // Se o erro for de conta inativa, redireciona para página de suporte
    if (error?.type === 'account') {
      return <Navigate to={`/conta-inativa?email=${encodeURIComponent(error.email || '')}`} replace />;
    }
    // Para outros casos, redireciona para o login
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute; 