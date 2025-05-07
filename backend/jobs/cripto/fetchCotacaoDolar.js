async function fetchCotacaoDolar(db) {
    const cotacaoDoc = await db.collection('cotacao_dolar').findOne({});
    
    if (!cotacaoDoc) return null;
  
    return cotacaoDoc.valor ?? null;
  }
  
  module.exports = { fetchCotacaoDolar };
  
