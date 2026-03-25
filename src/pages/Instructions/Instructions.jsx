import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { ArrowRight, AlertCircle, FileText } from 'lucide-react';
import './Instructions.css';

export default function Instructions() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSubmission = async () => {
      if (auth?.currentUser && db) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().submitted) {
            navigate('/success');
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    checkSubmission();
  }, [navigate]);

  const handleNext = () => {
    if (!agreed) return;
    navigate('/domains', {
      state: location.state
    });
  };

  return (
    <div className="container animate-fade-in instructions-page">
      <div className="instructions-content">
        <div className="instructions-header">
          <FileText className="text-primary mb-4" size={48} />
          <h2 className="instructions-title font-display font-bold">Round One Instructions</h2>
          <p className="text-text-secondary instructions-subtitle">
            Please read the following instructions carefully before proceeding.
          </p>
        </div>

        <div className="glass-panel instructions-panel">
          <ul className="instructions-list">
            <li>
              <span className="instruction-number">1.</span>
              <span className="instruction-text">You must answer questions from the domain you selected during registration.</span>
            </li>
            <li>
              <span className="instruction-number">2.</span>
              <span className="instruction-text">Only one attempt allowed.</span>
            </li>
            <li>
              <span className="instruction-number">3.</span>
              <span className="instruction-text"> No tab switching or refreshing (auto-submit if detected).</span>
            </li>
            <li>
              <span className="instruction-number">4.</span>
              <span className="instruction-text">Complete in one sitting.</span>
            </li>
          </ul>

          <div className="instructions-agreement">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
                className="custom-checkbox"
              />
              <span className="checkbox-text">I have read and understood the instructions</span>
            </label>
          </div>

          <div className="instructions-submit-container">
            <button 
              className={`btn-primary instructions-next-btn ${!agreed ? 'disabled' : ''}`} 
              onClick={handleNext}
              disabled={!agreed}
            >
              Continue <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
