import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://quiz-sipat.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});