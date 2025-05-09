const WebSocket = require('ws');
const axios = require('axios');

// Configuración
const API_WEATHER = 'https://api.open-meteo.com/v1/forecast?latitude=19.43&longitude=-99.13&current_weather=true';
const API_TIME = 'https://worldtimeapi.org/api/ip';
const UPDATE_INTERVAL = 3000; // 3 segundos

const fetchData = async () => {
  try {
    const [timeRes, weatherRes] = await Promise.all([
      axios.get(API_TIME),
      axios.get(API_WEATHER)
    ]);

    return {
      time: new Date(timeRes.data.datetime).toLocaleTimeString(),
      temp: `${weatherRes.data.current_weather.temperature}°C`,
      location: 'Ciudad de México'
    };
  } catch (error) {
    console.error('Error al obtener datos:', error.message);
    return null;
  }
};


const wss = new WebSocket.Server({ port: 8080 });
console.log('Servidor WebSocket iniciado en ws://localhost:8080');

setInterval(async () => {
  const data = await fetchData();
  if (data) {
    console.clear();
    console.log('=== DATOS EN TIEMPO REAL (SERVIDOR) ===');
    console.log(`📍 ${data.location} | 🕒 ${data.time} | 🌡️ ${data.temp}`);
    
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}, UPDATE_INTERVAL);