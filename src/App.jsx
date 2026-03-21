import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './pages/Login';
import UserDetails from './pages/UserDetails';
import DomainSelection from './pages/DomainSelection';
import Questions from './pages/Questions';
import Success from './pages/Success';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <h2 className="text-primary font-display">Loading...</h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-header">
          <div className="app-logo-container">
            <img src="/saelogo.png" alt="SAE Logo" className="app-logo" />
            <h1 className="app-title font-display font-bold">SAE <span className="text-primary app-title-span">AUDITION</span></h1>
          </div>
          {user && (
            <div className="user-profile">
              <span className="user-email">{user.email}</span>
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="avatar" className="user-avatar" />
            </div>
          )}
        </header>

        <main>
          <Routes>
            <Route path="/" element={!user ? <Login /> : <Navigate to="/details" />} />
            <Route path="/details" element={user ? <UserDetails /> : <Navigate to="/" />} />
            <Route path="/domains" element={user ? <DomainSelection /> : <Navigate to="/" />} />
            <Route path="/questions" element={user ? <Questions /> : <Navigate to="/" />} />
            <Route path="/success" element={user ? <Success /> : <Navigate to="/" />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
