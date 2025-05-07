import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

function RedefinirSenha() {
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemSucesso, setMensagemSucesso] = useState("");
    const [loading, setLoading] = useState(false);
    const [tokenValido, setTokenValido] = useState(false);
    const [verificandoToken, setVerificandoToken] = useState(true);
    
    const { token } = useParams();
    console.log('token: ', token);
    const navigate = useNavigate();

    useEffect(() => {
        verificarToken();
    }, [token]);


    const verificarToken = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_ENDPOINT_API}/auth/verify-reset-token/${token}`);
            setTokenValido(true);
        } catch (error) {
            setMensagemErro("Este link de redefinição de senha é inválido ou expirou.");
            setTokenValido(false);
        } finally {
            setVerificandoToken(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validações
        if (senha.length < 6) {
            setMensagemErro("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        if (senha !== confirmarSenha) {
            setMensagemErro("As senhas não coincidem");
            return;
        }

        try {
            setLoading(true);
            setMensagemErro("");
            setMensagemSucesso("");

            await axios.post(`${process.env.REACT_APP_ENDPOINT_API}/auth/reset-password`, {
                token,
                newPassword: senha
            });

            setMensagemSucesso("Senha redefinida com sucesso!");
            setSenha("");
            setConfirmarSenha("");

            // Redirecionar para login após 3 segundos
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            setMensagemErro(
                error.response?.data?.message || 
                "Erro ao redefinir senha. Tente novamente."
            );
        } finally {
            setLoading(false);
        }
    };

    if (verificandoToken) {
        return (
            <main className="main" id="top">
                <div className="container bg-white">
                    <div className="row flex-center min-vh-100 py-5">
                        <div className="col-sm-10 col-md-8 col-lg-5 col-xxl-4">
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                                <p className="mt-3">Verificando...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!tokenValido) {
        return (
            <main className="main" id="top">
                <div className="container">
                    <div className="row flex-center min-vh-100 py-5">
                        <div className="col-sm-10 col-md-8 col-lg-5 col-xxl-4">
                            <div className="text-center">
                                <h4 className="text-danger">Link Inválido</h4>
                                <p>{mensagemErro}</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate("/esqueceu_senha")}
                                >
                                    Solicitar novo link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="main" id="top">
            <div className="container">
                <div className="row flex-center min-vh-100 py-5">
                    <div className="col-sm-10 col-md-8 col-lg-5 col-xxl-4">
                        <Link to="/" className="d-flex flex-center text-decoration-none mb-4">
                            <div className="d-flex align-items-center fw-bolder fs-3 d-inline-block">
                                <img src="/assets/img/icons/logo.png" alt="phoenix" width="58" />
                            </div>
                        </Link>
                        <div className="px-xxl-5">
                            <div className="text-center mb-6">
                                <h4 className="text-body-highlight">Redefinir Senha</h4>
                                <p className="text-body-tertiary mb-5">
                                    Digite sua nova senha abaixo
                                </p>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <input
                                            className="form-control"
                                            type="password"
                                            placeholder="Nova senha"
                                            value={senha}
                                            onChange={(e) => setSenha(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            className="form-control"
                                            type="password"
                                            placeholder="Confirmar nova senha"
                                            value={confirmarSenha}
                                            onChange={(e) => setConfirmarSenha(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary w-100"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            "Redefinir Senha"
                                        )}
                                    </button>
                                </form>
                                {mensagemErro && (
                                    <div className="mt-3 text-center">
                                        <h6 className="text-danger">{mensagemErro}</h6>
                                    </div>
                                )}
                                {mensagemSucesso && (
                                    <div className="mt-3 text-center">
                                        <h6 className="text-success">{mensagemSucesso}</h6>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default RedefinirSenha; 