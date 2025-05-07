require('dotenv').config();
console.log('Ambiente:', process.env.NODE_ENV);
console.log('Variáveis de ambiente:', {
    STRIPE_KEY: process.env.STRIPE_SECRET_KEY,
    PRICE_ID: process.env.STRIPE_PRICE_ID,
    FRONTEND_URL: process.env.FRONTEND_URL
});

const stripe = process.env.STRIPE_SECRET_KEY 
    ? require('stripe')(process.env.STRIPE_SECRET_KEY)
    : null;

const criarSessaoCheckout = async (req, res) => {
    if (!stripe) {
        console.error('Stripe não foi inicializado - STRIPE_SECRET_KEY não encontrada');
        return res.status(500).json({ message: 'Erro de configuração do Stripe' });
    }

    try {
        const { nome, email, senha, telefone } = req.body;

        // Validações básicas
        if (!nome || !email || !senha || !telefone) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        // Verificar se usuário já existe
        const usuarioExistente = await req.db.collection("usuarios").findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        // Criar sessão do Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/sucesso`,
            cancel_url: `${process.env.FRONTEND_URL}/cancelado`,
            subscription_data: {
                metadata: {
                    nome,
                    email,
                    senha,
                    telefone
                }
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        res.status(500).json({ message: 'Erro ao criar sessão de checkout', error: error.message });
    }
};

const criarSessaoReativacao = async (req, res) => {
    if (!stripe) {
        console.error('Stripe não foi inicializado - STRIPE_SECRET_KEY não encontrada');
        return res.status(500).json({ message: 'Erro de configuração do Stripe' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email é obrigatório' });
        }

        // Buscar usuário
        const usuario = await req.db.collection("usuarios").findOne({ email });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Verificar se a conta já está ativa
        if (usuario.ativo && usuario.statusAssinatura === 'active') {
            return res.status(400).json({ 
                message: 'Esta conta já está ativa. Faça login normalmente.' 
            });
        }

        // Criar sessão do Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/sucesso`,
            cancel_url: `${process.env.FRONTEND_URL}/conta-inativa`,
            customer: usuario.stripeCustomerId, // Usar o customer ID existente
            subscription_data: {
                metadata: {
                    userId: usuario._id.toString(),
                    email: usuario.email,
                    tipo: 'reativacao'
                }
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Erro ao criar sessão de reativação:', error);
        res.status(500).json({ message: 'Erro ao criar sessão de checkout', error: error.message });
    }
};

module.exports = {
    criarSessaoCheckout,
    criarSessaoReativacao
}; 