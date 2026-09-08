import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Anexa o token da sessão (obtido no login) em toda requisição, quando existir.
// Rotas públicas simplesmente ignoram o header; rotas administrativas o exigem.
api.interceptors.request.use((config) => {
  try {
    const usuarioSalvo = localStorage.getItem('@sipat:usuario');
    const token = usuarioSalvo ? JSON.parse(usuarioSalvo)?.token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Sem token disponível, segue a requisição sem autenticação.
  }
  return config;
});