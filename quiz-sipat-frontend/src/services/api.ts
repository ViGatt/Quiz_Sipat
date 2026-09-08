import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export const api = axios.create({
  baseURL,
});
// Content-Type não é fixado aqui de propósito: o axios já define
// 'application/json' automaticamente para objetos comuns, e precisa ficar
// livre para definir 'multipart/form-data' (com boundary) quando o corpo é
// um FormData (upload de arquivo) — um Content-Type fixo em JSON faz o axios
// serializar o FormData como JSON, quebrando qualquer upload de arquivo.

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