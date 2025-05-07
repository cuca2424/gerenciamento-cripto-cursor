// Listar todos os usuários
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await req.db.collection('usuarios')
      .find({}, { projection: { senha: 0 } })
      .toArray();
    
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
};

// Atualizar status do usuário
exports.atualizarStatusUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    const result = await req.db.collection('usuarios').findOneAndUpdate(
      { _id: new req.ObjectId(id) },
      { 
        $set: { 
          ativo,
          atualizadoEm: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(result.value);
  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar status do usuário' });
  }
};

// Listar todas as estratégias globais
exports.listarEstrategiasGlobais = async (req, res) => {
  try {
    const estrategias = await req.db.collection('estrategias')
      .find({ tipo: 'global' })
      .toArray();
    
    res.json(estrategias);
  } catch (error) {
    console.error('Erro ao listar estratégias globais:', error);
    res.status(500).json({ message: 'Erro ao listar estratégias globais' });
  }
};

// Criar estratégia global
exports.criarEstrategiaGlobal = async (req, res) => {
  try {
    const { nome, filtros } = req.body;
    
    const estrategia = {
      nome,
      filtros,
      tipo: 'global',
      notificacoes: [],
      deletados: [],
      criadoPor: new req.ObjectId(req.userId),
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };

    const result = await req.db.collection('estrategias').insertOne(estrategia);
    
    if (!result.acknowledged) {
      throw new Error('Erro ao criar estratégia global');
    }

    res.status(201).json({ ...estrategia, _id: result.insertedId });
  } catch (error) {
    console.error('Erro ao criar estratégia global:', error);
    res.status(500).json({ message: 'Erro ao criar estratégia global' });
  }
};

// Atualizar estratégia global
exports.atualizarEstrategiaGlobal = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, filtros } = req.body;

    const result = await req.db.collection('estrategias').findOneAndUpdate(
      { 
        _id: new req.ObjectId(id),
        tipo: 'global'
      },
      { 
        $set: { 
          nome,
          filtros,
          atualizadoEm: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Estratégia global não encontrada' });
    }

    res.json(result.value);
  } catch (error) {
    console.error('Erro ao atualizar estratégia global:', error);
    res.status(500).json({ message: 'Erro ao atualizar estratégia global' });
  }
};

// Deletar estratégia global
exports.deletarEstrategiaGlobal = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await req.db.collection('estrategias').findOneAndDelete({
      _id: new req.ObjectId(id),
      tipo: 'global'
    });

    if (!result.value) {
      return res.status(404).json({ message: 'Estratégia global não encontrada' });
    }

    res.json({ message: 'Estratégia global deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar estratégia global:', error);
    res.status(500).json({ message: 'Erro ao deletar estratégia global' });
  }
};

// Atualizar role do usuário
exports.atualizarRoleUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Role inválida' });
    }

    const result = await req.db.collection('usuarios').findOneAndUpdate(
      { _id: new req.ObjectId(id) },
      { 
        $set: { 
          role,
          atualizadoEm: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(result.value);
  } catch (error) {
    console.error('Erro ao atualizar role do usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar role do usuário' });
  }
}; 