const { startOfWeek, startOfMonth, format } = require("date-fns");

function agregarDados(prices, period) {
    if (prices.length > 0) {

  
        const grouped = prices.reduce((acc, { date, price }) => {
        
        let key;
        if (period === "weekly") key = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");  // Começando na segunda-feira
        else if (period === "monthly") key = format(startOfMonth(date), "yyyy-MM");
        
        if (!acc[key]) acc[key] = [];
        acc[key].push(price);
        
        return acc;
        }, {});
  
        return Object.entries(grouped).map(([key, prices]) => ({
        date: key,
        price: prices[prices.length - 1],  // Pega o último preço do período
        }));
    }
}

module.exports = agregarDados;