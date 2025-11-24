import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});

// Interceptador para logs (debug)
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 Fazendo requisição: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ Resposta recebida: ${response.status}`);
    return response;
  },
  (error) => {
    console.log(`❌ Erro na requisição: ${error.message}`);
    return Promise.reject(error);
  }
);

export default api;