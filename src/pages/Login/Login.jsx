import React, { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';

import './Login.css';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔥 CHECK IF USER IS ALLOWED
  const checkUserAllowed = async (email) => {
    const userRef = doc(db, "allowed_users", email); // document ID = email
    const snap = await getDoc(userRef);
    return snap.exists();
  };

  const handleGoogleLogin = async () => {
    if (!auth || !provider) {
      setError("Firebase requires configuration.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 🔥 STEP 1: CHECK IF REGISTERED
      const allowed = await checkUserAllowed(user.email);

      if (!allowed) {
        const goRegister = window.confirm(
          "❌ You are not registered for SAE auditions\n\nDo you want to register now?"
        );

        if (goRegister) {
          window.location.href = "https://auditions.saenitd.in";
        }

        await signOut(auth);
        setLoading(false);
        return;
      }

      // 🔥 STEP 2: CHECK IF ALREADY SUBMITTED
      if (db) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists() && userSnap.data().submitted) {
          navigate('/success');
          return;
        }
      }

      // 🔥 STEP 3: ALLOW ACCESS
      navigate('/details');

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in login-page">
      <div className="glass-panel login-panel">
        <h2 className="login-title font-display font-extrabold">
          Join <span className="text-primary">SAE</span>
        </h2>
        <p className="text-text-secondary login-subtitle">
          Society of Automotive Engineers
        </p>
        
        <p className="login-desc">
          Please sign in with your Google account to start your audition. <br/>
          <strong className="text-primary font-bold">
            One submission allowed per email.
          </strong>
        </p>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} className="text-primary login-error-icon" />
            <span>{error}</span>
          </div>
        )}

        <button 
          className={`btn-primary login-btn ${loading ? 'opacity-70' : ''}`}
          onClick={handleGoogleLogin} 
          disabled={loading}
        >
          <LogIn size={20} />
          {loading ? 'Authenticating...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}