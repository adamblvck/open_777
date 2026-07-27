import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './routes/LandingPage';
import Workstation from './routes/Workstation';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<Workstation />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
