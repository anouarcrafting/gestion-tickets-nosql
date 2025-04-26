import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardEmploye from './components/DashboardEmploye';
import DashboardTechnicien from './components/DashboardTechnicien';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');

    if (token && userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        if (userData?.role) {
          setUser(userData);
        } else {
          throw new Error('Données utilisateur invalides');
        }
      } catch (err) {
        console.error('Erreur:', err);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/api/auth/logout', {
        withCredentials: true
      });
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!user || user.role !== requiredRole) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to={`/${user.role}`} replace /> : <Login setUser={setUser} />
          } />

          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <DashboardAdmin user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } />

          <Route path="/employe" element={
            <ProtectedRoute requiredRole="employe">
              <DashboardEmploye user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } />

          <Route path="/technicien" element={
            <ProtectedRoute requiredRole="technicien">
              <DashboardTechnicien user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } />

          <Route path="/" element={
            user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;