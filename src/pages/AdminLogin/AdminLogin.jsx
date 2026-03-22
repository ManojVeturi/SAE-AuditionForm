import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';

import './AdminLogin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'user123' && password === 'password') {
      localStorage.setItem('sae_admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="container animate-fade-in admin-login-page">
      <div className="glass-panel admin-login-panel">
        <div className="admin-login-icon-box">
          <Lock size={30} className="text-white" />
        </div>
        <h2 className="admin-login-title font-display font-bold">Admin Login</h2>
        <p className="text-text-secondary admin-login-subtitle">Access applicant submissions</p>
        
        {error && (
          <div className="admin-login-error">
            <AlertCircle size={18} className="text-primary" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary admin-login-btn">
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
