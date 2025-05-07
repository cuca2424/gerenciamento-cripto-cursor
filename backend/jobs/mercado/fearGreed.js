const axios = require('axios');

const getFearGreedData = async () => {
  try {
    const response = await axios.get('https://api.alternative.me/fng/');
    const data = response.data.data[0];
    
    const getClassification = (value) => {
      if (value >= 80) return "Extrema Ganância";
      if (value >= 60) return "Ganância";
      if (value >= 40) return "Neutro";
      if (value >= 20) return "Medo";
      return "Medo Extremo";
    };

    return {
      valor: parseInt(data.value),
      classificacao: getClassification(parseInt(data.value)),
      ultimaAtualizacao: new Date()
    };
  } catch (error) {
    console.error('Erro ao buscar dados do Fear & Greed:', error);
    throw error;
  }
};

module.exports = getFearGreedData; 