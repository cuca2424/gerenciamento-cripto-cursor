// Criar uma nova estratégia
exports.createEstrategia = async (req, res) => {
  try {
    const { nome, filtros } = req.body;
    const db = req.db;
    const ObjectId = req.ObjectId;
    
    const estrategia = {
      nome,
      filtros,
      usuario: new ObjectId(req.userId),
      notificacoes: false,
      tipo: "pessoal",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Criando estratégia:', estrategia);
    const result = await db.collection('estrategias').insertOne(estrategia);
    
    if (!result.acknowledged) {
      console.error('Erro ao criar estratégia - não reconhecido pelo MongoDB');
      throw new Error('Erro ao criar estratégia');
    }

    console.log('Estratégia criada com sucesso:', { ...estrategia, _id: result.insertedId });
    res.status(201).json({ ...estrategia, _id: result.insertedId });
  } catch (error) {
    console.error('Erro ao criar estratégia:', error);
    res.status(500).json({ message: 'Erro ao criar estratégia', error: error.message });
  }
};

// Buscar todas as estratégias do usuário
exports.getEstrategias = async (req, res) => {
  try {
    console.log('Buscando estratégias para o usuário:', req.userId);
    const db = req.db;
    const ObjectId = req.ObjectId;

    if (!db) {
      console.error('Conexão com o banco de dados não disponível');
      throw new Error('Conexão com o banco de dados não disponível');
    }

    if (!db.collection) {
      console.error('Método collection não disponível no objeto db');
      throw new Error('Erro na conexão com o banco de dados');
    }

    // Buscar estratégias pessoais do usuário
    const estrategiasPessoais = await db.collection('estrategias')
      .find({ 
        usuario: new ObjectId(req.userId),
        tipo: "pessoal"
      })
      .toArray();

    // Buscar estratégias globais que o usuário não deletou
    const estrategiasGlobais = await db.collection('estrategias')
      .find({ 
        tipo: "global",
        deletados: { $ne: new ObjectId(req.userId) }
      })
      .toArray();

    const estrategias = [...estrategiasPessoais, ...estrategiasGlobais];
    console.log('Estratégias encontradas:', estrategias);
    res.json(estrategias);
  } catch (error) {
    console.error('Erro detalhado ao buscar estratégias:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar estratégias',
      error: error.message,
      stack: error.stack
    });
  }
};

// Atualizar uma estratégia
exports.updateEstrategia = async (req, res) => {
  try {
    const { nome, filtros } = req.body;
    const db = req.db;
    const ObjectId = req.ObjectId;
    
    console.log('Atualizando estratégia:', {
      id: req.params.id,
      nome,
      filtros
    });

    const result = await db.collection('estrategias').findOneAndUpdate(
      {
        _id: new ObjectId(req.params.id),
        usuario: new ObjectId(req.userId)
      },
      {
        $set: {
          nome,
          filtros,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      console.error('Estratégia não encontrada para atualização');
      return res.status(404).json({ message: 'Estratégia não encontrada' });
    }

    console.log('Estratégia atualizada com sucesso:', result.value);
    res.json(result.value);
  } catch (error) {
    console.error('Erro ao atualizar estratégia:', error);
    res.status(500).json({ message: 'Erro ao atualizar estratégia', error: error.message });
  }
};

// Excluir uma estratégia
exports.deleteEstrategia = async (req, res) => {
  try {
    const db = req.db;
    const ObjectId = req.ObjectId;
    
    console.log('Excluindo estratégia:', req.params.id);

    // Primeiro, verificar se é uma estratégia global
    const estrategia = await db.collection('estrategias').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!estrategia) {
      console.error('Estratégia não encontrada para exclusão');
      return res.status(404).json({ message: 'Estratégia não encontrada' });
    }

    if (estrategia.tipo === "global") {
      // Para estratégias globais, adicionar o usuário ao array deletados e remover das notificacoes
      const result = await db.collection('estrategias').findOneAndUpdate(
        {
          _id: new ObjectId(req.params.id)
        },
        {
          $addToSet: {
            deletados: new ObjectId(req.userId)
          },
          $pull: {
            notificacoes: new ObjectId(req.userId)
          }
        },
        { returnDocument: 'after' }
      );
      console.log('Usuário adicionado ao array deletados e removido de notificacoes da estratégia global');
      res.json({ message: 'Estratégia global removida do seu perfil' });
    } else {
      // Para estratégias pessoais, excluir normalmente
      const result = await db.collection('estrategias').findOneAndDelete({
        _id: new ObjectId(req.params.id),
        usuario: new ObjectId(req.userId)
      });

      if (!result.value) {
        console.error('Estratégia não encontrada para exclusão');
        return res.status(404).json({ message: 'Estratégia não encontrada' });
      }

      console.log('Estratégia excluída com sucesso');
      res.json({ message: 'Estratégia excluída com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao excluir estratégia:', error);
    res.status(500).json({ message: 'Erro ao excluir estratégia', error: error.message });
  }
};

// Atualizar notificações da estratégia
exports.toggleNotificacoes = async (req, res) => {
  try {
    const db = req.db;
    const ObjectId = req.ObjectId;
    
    console.log('Alternando notificações da estratégia:', req.params.id);

    const estrategia = await db.collection('estrategias').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!estrategia) {
      console.error('Estratégia não encontrada para alternar notificações');
      return res.status(404).json({ message: 'Estratégia não encontrada' });
    }

    if (estrategia.tipo === "global") {
      // Para estratégias globais, adicionar/remover o usuário do array notificacoes
      const userId = new ObjectId(req.userId);
      const isSubscribed = estrategia.notificacoes.some(id => id.toString() === userId.toString());
      
      console.log('Estado atual das notificações:', {
        userId: userId.toString(),
        currentNotifications: estrategia.notificacoes,
        isSubscribed
      });

      const result = await db.collection('estrategias').findOneAndUpdate(
        {
          _id: new ObjectId(req.params.id)
        },
        {
          [isSubscribed ? '$pull' : '$addToSet']: {
            notificacoes: userId
          }
        },
        { returnDocument: 'after' }
      );

      console.log('Notificações atualizadas para estratégia global:', {
        previous: estrategia.notificacoes,
        updated: result.value.notificacoes
      });

      res.json(result.value);
    } else {
      // Para estratégias pessoais, atualizar o campo notificacoes normalmente
      const result = await db.collection('estrategias').findOneAndUpdate(
        {
          _id: new ObjectId(req.params.id),
          usuario: new ObjectId(req.userId)
        },
        {
          $set: {
            notificacoes: !estrategia.notificacoes,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      console.log('Notificações atualizadas para estratégia pessoal:', result.value);
      res.json(result.value);
    }
  } catch (error) {
    console.error('Erro ao atualizar notificações:', error);
    res.status(500).json({ message: 'Erro ao atualizar notificações', error: error.message });
  }
}; 