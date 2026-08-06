import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { CreateQuiz } from './pages/CreateQuiz/CreateQuiz';
import { Quizzes } from './pages/Quizzes/Quizzes';

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}    /* Como a tela nasce (invisível e um pouco pra baixo) */
        animate={{ opacity: 1, y: 0 }}     /* Estado final da tela (visível e no lugar certo) */
        exit={{ opacity: 0, y: -15 }}      /* Como a tela morre (fica invisível e sobe um pouco) */
        transition={{ duration: 0.3, ease: "easeOut" }} /* Duração da transição */
        style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/quizzes" element={<Quizzes />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;