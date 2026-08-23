import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './routes/LandingPage';
import Workstation from './routes/Workstation';
import PricingPage from './routes/PricingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<Workstation />} />
      <Route path="/pricing" element={<PricingPage />} />
      {/* Stripe's success_url lands here; PricingPage reads ?checkout=success. */}
      <Route path="/account" element={<PricingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
