// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;