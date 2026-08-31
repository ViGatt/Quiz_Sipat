import axios from 'axios';

// Detecta automaticamente se está em produção (Vercel) ou desenvolvimento local
const getApiUrl = () => {
  // Se houver a variável do Vite, usa ela
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Se estiver rodando no domínio da Vercel, força a URL do Render
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://quiz-sipat.onrender.com';
  }
  
  // Caso contrário, assume o ambiente local
  return 'http://localhost:8000';
};

export const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});