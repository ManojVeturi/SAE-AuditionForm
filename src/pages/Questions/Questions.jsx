import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Send, AlertCircle, ChevronLeft, ShieldAlert } from 'lucide-react';
import { DOMAIN_QUESTIONS } from '../../data/questions';
import './Questions.css';

export default function Questions() {
  const location = useLocation();
  const navigate = useNavigate();

  const [answers,     setAnswers]     = useState({});
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [warnCount,   setWarnCount]   = useState(0);
  const [guardActive, setGuardActive] = useState(false);

  const answersRef   = useRef({});
  const hasSubmitted = useRef(false);
  const isSubmitting = useRef(false);
  const warnRef      = useRef(0);
  const warningTimer = useRef(null);

  const selectedDomains = location.state?.selectedDomains || [];
  const userDetails     = location.state?.userDetails     || {};

  /* ── flat answer builder ─────────────────────────────── */
  const buildFlatAnswers = useCallback((domainId) => {
    const domainInfo = DOMAIN_QUESTIONS[domainId];
    if (!domainInfo) return {};
    const flat = {};
    domainInfo.questions.forEach((q) => {
      flat[q.id] = answersRef.current[domainId]?.[q.id] || null;
    });
    return flat;
  }, []);

  /* ── sheets helper ───────────────────────────────────── */
  const sendToSheets = async (data) => {
    try {
      await fetch(
        'https://script.google.com/macros/s/AKfycbww6Ku32V2SAQwH3KhFLYqi3DxQLPGuXJDDSm0XfHi-Qh7vSzBVetDQnLp2LCwmmxV5fw/exec',
        { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) }
      );
    } catch (err) {
      console.error('Sheets error:', err);
    }
  };

  /* ── core submit ─────────────────────────────────────── */
  const doSubmit = useCallback(async (isAutoSubmit = false) => {
    if (hasSubmitted.current || isSubmitting.current) return;
    if (!auth?.currentUser) return;

    isSubmitting.current = true;
    hasSubmitted.current = true;

    try {
      const userId    = auth.currentUser.uid;
      const userEmail = auth.currentUser.email;

      if (!db) { navigate('/success'); return; }

      const userRef = doc(db, 'users', userId);

      // Each domain → its own Firestore document with flat columns (q1, q2 … or null)
      const domainPromises = selectedDomains.map((domainId) => {
        const flat = buildFlatAnswers(domainId);
        return addDoc(collection(db, domainId), {
          userId,
          email: userEmail,
          autoSubmitted: isAutoSubmit,
          submittedAt: serverTimestamp(),
          ...flat
        });
      });

      await Promise.all([
        ...domainPromises,
        setDoc(userRef, {
          email: userEmail,
          submitted: true,
          autoSubmitted: isAutoSubmit,
          domains: selectedDomains,
          submittedAt: serverTimestamp()
        }, { merge: true })
      ]);

      // ✅ Mirror to Google Sheets — each q1, q2, q3... as its own column
      for (const domainId of selectedDomains) {
        const flat = buildFlatAnswers(domainId);

        // Build { q1: "answer or NULL", q2: "answer or NULL", ... }
        const questionColumns = Object.fromEntries(
          Object.entries(flat).map(([key, val]) => [key, val ?? 'NULL'])
        );

        await sendToSheets({
          domain:        domainId,
          name:          userDetails.name     || '',
          email:         userEmail,
          rollNo:        userDetails.rollNo   || '',
          whatsapp:      userDetails.whatsapp || '',
          year:          userDetails.year     || '',
          gender:        userDetails.gender   || '',
          branch:        userDetails.branch   || '',
          allDomains:    selectedDomains.join(' | '),
          autoSubmitted: isAutoSubmit ? 'YES' : 'NO',
          ...questionColumns   // spreads q1, q2, q3 ... as individual keys
        });
      }

      navigate('/success');
    } catch (err) {
      console.error(err);
      isSubmitting.current = false;
      hasSubmitted.current = false;
    }
  }, [selectedDomains, userDetails, navigate, buildFlatAnswers]);

  /* ── activate anti-cheat after 3s so page loads cleanly */
  useEffect(() => {
    const activateTimer = setTimeout(() => {
      setGuardActive(true);
    }, 3000);
    return () => clearTimeout(activateTimer);
  }, []);

  /* ── attach listeners only after guard is active ─────── */
  useEffect(() => {
    if (!guardActive) return;

    const onVisibilityChange = () => {
      if (document.hidden && !hasSubmitted.current) {
        doSubmit(true);
      }
    };

    const onBlur = () => {
      if (hasSubmitted.current) return;
      warnRef.current += 1;
      setWarnCount(warnRef.current);

      if (warnRef.current >= 2) {
        doSubmit(true);
      } else {
        setShowWarning(true);
        clearTimeout(warningTimer.current);
        warningTimer.current = setTimeout(() => setShowWarning(false), 4000);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      clearTimeout(warningTimer.current);
    };
  }, [guardActive, doSubmit]);

  /* ── block keyboard shortcuts ────────────────────────── */
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const ctrlBlocked      = ['c', 'v', 'a', 'x', 'u', 's', 'p'];
      const ctrlShiftBlocked = ['i', 'j', 'c', 'k'];

      if (e.ctrlKey && !e.shiftKey && ctrlBlocked.includes(key))      { e.preventDefault(); return; }
      if (e.ctrlKey &&  e.shiftKey && ctrlShiftBlocked.includes(key)) { e.preventDefault(); return; }
      if (e.key === 'F12')                                             { e.preventDefault(); return; }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  /* ── redirect if no domains ──────────────────────────── */
  if (selectedDomains.length === 0) return <Navigate to="/domains" />;

  /* ── handlers ────────────────────────────────────────── */
  const handleInputChange = (domainId, questionId, value) => {
    const updated = {
      ...answersRef.current,
      [domainId]: { ...(answersRef.current[domainId] || {}), [questionId]: value }
    };
    answersRef.current = updated;
    setAnswers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth?.currentUser) { setError('You must be logged in to submit.'); return; }
    setLoading(true);
    setError('');
    await doSubmit(false);
    setLoading(false);
  };

  /* ── render ──────────────────────────────────────────── */
  return (
    <div
      className="container animate-fade-in questions-page"
      onCopy={(e)        => e.preventDefault()}
      onCut={(e)         => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Floating warning toast */}
      {showWarning && (
        <div className="questions-cheat-warning">
          <ShieldAlert size={18} />
          <span>⚠️ Warning {warnCount}/2 — Leave again and your form will be auto-submitted!</span>
        </div>
      )}

      <button onClick={() => navigate('/domains')} className="questions-back-btn">
        <ChevronLeft size={20} /> Back to Domains
      </button>

      <div className="questions-content">
        <h2 className="questions-title font-display font-bold">Audition Form</h2>
        <p className="text-text-secondary questions-subtitle">
          Please answer the domain-specific questions below honestly.
        </p>

        {/* Integrity notice */}
        <div className="questions-integrity-notice">
          <ShieldAlert size={16} />
          <span>
            Integrity mode active — switching tabs or windows will auto-submit your form with
            unanswered questions marked as NULL.
          </span>
        </div>

        {error && (
          <div className="questions-error">
            <AlertCircle size={20} className="text-primary" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {selectedDomains.map((domainId, index) => {
            const domainInfo = DOMAIN_QUESTIONS[domainId];
            if (!domainInfo) return null;

            return (
              <div key={domainId} className="glass-panel questions-panel">
                <div className="questions-panel-header">
                  <div className="questions-number-circle">{index + 1}</div>
                  <h3 className="questions-domain-title font-display font-bold">
                    {domainInfo.title}
                  </h3>
                </div>

                <div className="questions-grid">
                  {domainInfo.questions.map((q) => (
                    <div key={q.id}>
                      <label className="label questions-label">{q.text}</label>

                      {q.type === 'textarea' ? (
                        <textarea
                          className="input-field questions-textarea"
                          rows="4"
                          placeholder="Your answer…"
                          value={answers[domainId]?.[q.id] || ''}
                          onChange={(e) => handleInputChange(domainId, q.id, e.target.value)}
                          onCopy={(e)  => e.preventDefault()}
                          onPaste={(e) => e.preventDefault()}
                        />
                      ) : (
                        <input
                          type={q.type}
                          className="input-field"
                          placeholder={q.type === 'url' ? 'https://…' : 'Your answer…'}
                          value={answers[domainId]?.[q.id] || ''}
                          onChange={(e) => handleInputChange(domainId, q.id, e.target.value)}
                          onCopy={(e)  => e.preventDefault()}
                          onPaste={(e) => e.preventDefault()}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="questions-submit-container">
            <button
              type="submit"
              className="btn-primary questions-submit-btn"
              disabled={loading}
            >
              <Send size={20} />
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}