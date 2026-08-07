import axios from 'axios';

export const api = axios.create({
  // A URL onde o seu FastAPI estará rodando
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});