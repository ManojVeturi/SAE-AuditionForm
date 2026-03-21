import React from 'react';
import { CheckCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

import './Success.css';

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="container animate-fade-in success-page">
      <div className="glass-panel success-panel">
        <CheckCircle size={80} className="text-primary success-icon" />
        <h2 className="success-title font-display font-bold">Application Submitted</h2>
        <p className="text-text-secondary success-desc">
          Thank you for applying to the Society of Automotive Engineers Collegiate Club. Your responses have been recorded successfully. We will reach out to you soon!
        </p>
        
        <button 
          className="btn-secondary success-btn" 
          onClick={() => {
            auth?.signOut().then(() => navigate('/')).catch(() => navigate('/'));
          }}
        >
          <Home size={20} />
          Return to Home
        </button>
      </div>
    </div>
  );
}
