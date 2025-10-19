import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { LandingRoute } from './routes/Landing';
import { CollectionRoute } from './routes/Collection';
import { CardRoute } from './routes/Card';
import { CreateCardRoute } from './routes/CreateCard';
import { PaymentRoute } from './routes/Payment';
import { initializeStatsig, trackPageView } from './services/statsig';

function App() {
  const location = useLocation();

  useEffect(() => {
    // Initialize Statsig when the app loads
    initializeStatsig();
  }, []);

  useEffect(() => {
    // Track page views whenever the route changes
    const pageName = location.pathname === '/' ? 'landing' : location.pathname.slice(1);
    trackPageView(pageName);
  }, [location]);

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/collection" element={<CollectionRoute />} />
        <Route path="/create-card" element={<CreateCardRoute />} />
        <Route path="/card/:id" element={<CardRoute />} />
        <Route path="/payment" element={<PaymentRoute />} />
      </Routes>
    </div>
  );
}

export default App;
