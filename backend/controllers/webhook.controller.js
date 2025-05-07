require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

const handleWebhook = async (req, res) => { 
    const sig = req.headers['stripe-signature'];
    
    let event;

    try {
        // Construir o evento do Stripe
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        
        console.log('Evento construído com sucesso:', event.type);
    } catch (err) {
        console.error('Erro na assinatura do webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Lidar com os diferentes tipos de eventos
    try {
        switch (event.type) {
            case 'customer.subscription.deleted': {
                console.log('Processando customer.subscription.deleted');
                const subscription = event.data.object;
                
                // Desativar usuário
                await req.db.collection("usuarios").updateOne(
                    { subscriptionId: subscription.id },
                    { 
                        $set: { 
                            ativo: false,
                            atualizadoEm: new Date(),
                            canceladoEm: new Date()
                        } 
                    }
                );

                console.log('Usuário desativado com sucesso');
                break;
            }

            case 'customer.subscription.updated': {
                console.log('Processando customer.subscription.updated');
                const subscription = event.data.object;

                // Atualizar status da assinatura do usuário
                await req.db.collection("usuarios").updateOne(
                    { subscriptionId: subscription.id },
                    { 
                        $set: { 
                            statusAssinatura: subscription.status,
                            atualizadoEm: new Date()
                        } 
                    }
                );

                console.log('Status da assinatura atualizado com sucesso');
                break;
            }

            case 'invoice.payment_succeeded': {
                console.log('Processando invoice.payment_succeeded');
                const invoice = event.data.object;
                
                // Buscar a subscription associada à invoice
                const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
                console.log('Subscription:', subscription);
                
                // Verificar se é uma reativação ou novo usuário
                const isReativacao = subscription.metadata.tipo === 'reativacao';
                
                if (isReativacao) {
                    // Atualizar usuário existente
                    await req.db.collection("usuarios").updateOne(
                        { _id: new ObjectId(subscription.metadata.userId) },
                        { 
                            $set: { 
                                ativo: true,
                                statusAssinatura: subscription.status,
                                atualizadoEm: new Date(),
                                reativadoEm: new Date()
                            } 
                        }
                    );
                    console.log('Usuário reativado com sucesso');
                } else {
                    // Extrair os metadados diretamente da subscription
                    const { nome, email, senha, telefone } = subscription.metadata;
                    console.log('Metadados da subscription:', { nome, email, telefone });

                    // Verificar se o usuário já existe
                    const usuarioExistente = await req.db.collection("usuarios").findOne({ email });
                    if (!usuarioExistente) {
                        // Hash da senha
                        const salt = await bcrypt.genSalt(10);
                        const senhaHash = await bcrypt.hash(senha, 10);

                        // Criar usuário
                        await req.db.collection("usuarios").insertOne({
                            nome,
                            email,
                            senha: senhaHash,
                            telefone,
                            saldoReais: 0,
                            aporteTotal: 0,
                            stripeCustomerId: invoice.customer,
                            subscriptionId: invoice.subscription,
                            dataCriacao: new Date(),
                            atualizadoEm: new Date(),
                            ativo: true,
                            statusAssinatura: subscription.status,
                            role: 'user'
                        });

                        console.log('Usuário criado com sucesso');
                    } else {
                        console.log('Usuário já existe, atualizando status da assinatura');
                        await req.db.collection("usuarios").updateOne(
                            { email },
                            { 
                                $set: { 
                                    statusAssinatura: subscription.status,
                                    atualizadoEm: new Date()
                                } 
                            }
                        );
                    }
                }
                break;
            }

            default:
                console.log(`Evento não tratado: ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Erro ao processar webhook:', err);
        res.status(500).json({ error: 'Erro ao processar webhook' });
    }
};

module.exports = {
    handleWebhook
};
