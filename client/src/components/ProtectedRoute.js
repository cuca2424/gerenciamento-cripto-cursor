import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redireciona para a página de login se não houver token
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute; 