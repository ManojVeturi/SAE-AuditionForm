import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { DOMAIN_QUESTIONS } from '../../data/questions';
import {
  Users, LogOut, ChevronRight, User as UserIcon,
  Search, Trash2, Download, X, LayoutGrid, ArrowLeft, Menu
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users,          setUsers]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedUser,   setSelectedUser]   = useState(null);
  const [userAnswers,    setUserAnswers]     = useState(null);
  const [loadingAnswers, setLoadingAnswers]  = useState(false);
  // view: 'domains' | 'users' | 'detail'
  const [view,           setView]           = useState('domains');
  const [sidebarOpen,    setSidebarOpen]    = useState(false);

  /* ── auth guard ─────────────────────────────── */
  useEffect(() => {
    if (localStorage.getItem('sae_admin_auth') !== 'true') {
      navigate('/admin');
      return;
    }
    fetchUsers();
  }, [navigate]);

  /* ── fetch all users once ───────────────────── */
  const fetchUsers = async () => {
    try {
      if (!db) return;
      const snap  = await getDocs(collection(db, 'users'));
      const list  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(list.sort((a, b) => (b.submittedAt?.toMillis() || 0) - (a.submittedAt?.toMillis() || 0)));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── domain list derived from DOMAIN_QUESTIONS ─ */
  const domains = useMemo(() => Object.entries(DOMAIN_QUESTIONS).map(([id, meta]) => ({
    id,
    title: meta.title,
    count: users.filter(u => u.domains?.includes(id)).length,
  })), [users]);

  /* ── users filtered by selected domain ──────── */
  const domainUsers = useMemo(() => {
    if (!selectedDomain) return [];
    return users.filter(u => u.domains?.includes(selectedDomain));
  }, [users, selectedDomain]);

  const filteredDomainUsers = useMemo(() => domainUsers.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [domainUsers, searchTerm]);

  /* ── select domain ───────────────────────────── */
  const handleSelectDomain = (domainId) => {
    setSelectedDomain(domainId);
    setSelectedUser(null);
    setUserAnswers(null);
    setSearchTerm('');
    setView('users');
    setSidebarOpen(false);
  };

  /* ── select user → fetch answers for that domain */
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setLoadingAnswers(true);
    setUserAnswers(null);
    setView('detail');

    if (!user.domains || !db) { setLoadingAnswers(false); return; }

    try {
      const answersMap = {};
      for (const domainId of user.domains) {
        const q    = query(collection(db, domainId), where('email', '==', user.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const { userId, email, autoSubmitted, submittedAt, ...flat } = snap.docs[0].data();
          answersMap[domainId] = flat;
        }
      }
      setUserAnswers(answersMap);
    } catch (err) {
      console.error('Error fetching answers:', err);
    } finally {
      setLoadingAnswers(false);
    }
  };

  /* ── delete user ────────────────────────────── */
  const handleDeleteUser = async () => {
    if (!selectedUser || !db) return;
    if (!window.confirm(`Permanently delete ${selectedUser.name || selectedUser.email}?`)) return;

    setLoadingAnswers(true);
    try {
      if (selectedUser.domains) {
        for (const domainId of selectedUser.domains) {
          const q    = query(collection(db, domainId), where('email', '==', selectedUser.email));
          const snap = await getDocs(q);
          for (const d of snap.docs) await deleteDoc(doc(db, domainId, d.id));
        }
      }
      await deleteDoc(doc(db, 'users', selectedUser.id));
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setSelectedUser(null);
      setUserAnswers(null);
      setView('users');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user.');
    } finally {
      setLoadingAnswers(false);
    }
  };

  /* ── export to pdf ───────────────────────────── */
  const handleExportPDF = () => {
    if (!selectedUser) return;
    const element = document.getElementById('applicant-detail-content');
    if (!element) return;
    
    const opt = {
      margin:       0.4,
      filename:     `${selectedUser.name || 'Applicant'}_${DOMAIN_QUESTIONS[selectedDomain]?.title || 'Answers'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    import('html2pdf.js').then((html2pdf) => {
      html2pdf.default().set(opt).from(element).save();
    });
  };

  /* ── export to sheets ────────────────────────── */
  const handleExport = async () => {
    alert('Uploading to Google Sheets…');
    for (const u of users) {
      if (!u.domains) continue;
      for (const domainId of u.domains) {
        let answersStr = '';
        const q    = query(collection(db, domainId), where('email', '==', u.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const { userId, email, autoSubmitted, submittedAt, ...flat } = snap.docs[0].data();
          answersStr = Object.values(flat).map(v => v ?? 'NULL').join(' | ');
        }
        await fetch(
          'https://script.google.com/macros/s/AKfycbyozX6jtc4zOk6Tsl6_BcvssJSF7-8kjm2SlkdSl6J1IiOeZqCV1ipTWrt9bNZ8EMFO8A/exec',
          {
            method: 'POST', mode: 'no-cors',
            body: JSON.stringify({
              domain: domainId, name: u.name, email: u.email,
              rollNo: u.rollNo, whatsapp: u.whatsapp, year: u.year,
              gender: u.gender, branch: u.branch,
              allDomains: (u.domains || []).join(' | '),
              answers: answersStr,
            }),
          }
        );
      }
    }
    setTimeout(() => alert('Upload completed — check Google Sheets.'), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('sae_admin_auth');
    navigate('/admin');
  };

  /* ── stats ───────────────────────────────────── */
  const totalSubmissions   = users.length;
  const autoSubmittedCount = users.filter(u => u.autoSubmitted).length;
  const multiDomainCount   = users.filter(u => (u.domains?.length || 0) > 1).length;

  const currentDomainMeta = selectedDomain ? DOMAIN_QUESTIONS[selectedDomain] : null;

  /* ── render ──────────────────────────────────── */
  return (
    <div className="adm-root">

      {/* ── Top Bar ── */}
      <header className="adm-topbar">
        <div className="adm-topbar-left">
          {/* Hamburger — mobile only, shown on users/detail views */}
          {view !== 'domains' && (
            <button className="adm-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open domains">
              <Menu size={20} />
            </button>
          )}
          <div className="adm-logo-box">
            <LayoutGrid size={18} />
          </div>
          <span className="adm-topbar-title">Admin Dashboard</span>
        </div>
        <div className="adm-topbar-right">
          <button onClick={handleExport} className="adm-btn adm-btn-ghost">
            <Download size={15} /><span className="adm-hide-xs"> Export</span>
          </button>
          <button onClick={handleLogout} className="adm-btn adm-btn-ghost">
            <LogOut size={15} /><span className="adm-hide-xs"> Logout</span>
          </button>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <div className="adm-stats-bar">
        <div className="adm-stat">
          <span className="adm-stat-value">{totalSubmissions}</span>
          <span className="adm-stat-label">Submissions</span>
        </div>
        <div className="adm-stat-divider" />
        <div className="adm-stat">
          <span className="adm-stat-value">{domains.length}</span>
          <span className="adm-stat-label">Domains</span>
        </div>
        <div className="adm-stat-divider" />
        <div className="adm-stat">
          <span className="adm-stat-value">{autoSubmittedCount}</span>
          <span className="adm-stat-label">Auto-Submitted</span>
        </div>
        <div className="adm-stat-divider" />
        <div className="adm-stat">
          <span className="adm-stat-value">{multiDomainCount}</span>
          <span className="adm-stat-label">Multi-Domain</span>
        </div>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="adm-overlay" onClick={() => setSidebarOpen(false)}>
          <aside className="adm-sidebar adm-sidebar-overlay" onClick={e => e.stopPropagation()}>
            <div className="adm-sidebar-overlay-header">
              <p className="adm-sidebar-heading">Domains</p>
              <button className="adm-icon-btn" onClick={() => setSidebarOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <nav className="adm-domain-nav">
              {domains.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleSelectDomain(d.id)}
                  className={`adm-domain-btn ${selectedDomain === d.id ? 'active' : ''}`}
                >
                  <span className="adm-domain-btn-title">{d.title}</span>
                  <span className="adm-domain-count">{d.count}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="adm-body">

        {/* ════ SIDEBAR — desktop always visible ════ */}
        <aside className="adm-sidebar adm-sidebar-desktop">
          <p className="adm-sidebar-heading">Domains</p>
          {loading ? (
            <p className="adm-loading-text">Loading…</p>
          ) : (
            <nav className="adm-domain-nav">
              {domains.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleSelectDomain(d.id)}
                  className={`adm-domain-btn ${selectedDomain === d.id ? 'active' : ''}`}
                >
                  <span className="adm-domain-btn-title">{d.title}</span>
                  <span className="adm-domain-count">{d.count}</span>
                </button>
              ))}
            </nav>
          )}
        </aside>

        {/* ════ MOBILE: Domains screen ════ */}
        <section className={`adm-mobile-domains ${view === 'domains' ? 'adm-mobile-screen-active' : ''}`}>
          <div className="adm-mobile-screen-inner">
            <p className="adm-sidebar-heading" style={{ padding: '1rem 1rem 0.5rem' }}>Select a Domain</p>
            {loading ? (
              <p className="adm-loading-text" style={{ padding: '1rem' }}>Loading…</p>
            ) : (
              <nav className="adm-domain-nav adm-domain-nav-mobile">
                {domains.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleSelectDomain(d.id)}
                    className="adm-domain-btn adm-domain-btn-mobile"
                  >
                    <span className="adm-domain-btn-title">{d.title}</span>
                    <div className="adm-domain-btn-right">
                      <span className="adm-domain-count">{d.count}</span>
                      <ChevronRight size={16} />
                    </div>
                  </button>
                ))}
              </nav>
            )}
          </div>
        </section>

        {/* ════ CENTER — user list ════ */}
        <section className={`adm-panel adm-users-panel ${view === 'users' ? 'adm-mobile-screen-active' : ''} ${view === 'domains' ? 'adm-panel-empty' : ''}`}>
          {!selectedDomain ? (
            <div className="adm-placeholder">
              <LayoutGrid size={48} className="adm-placeholder-icon" />
              <p>Select a domain to view applicants</p>
            </div>
          ) : (
            <>
              <div className="adm-panel-header">
                {/* Mobile back to domains */}
                <button className="adm-back-btn adm-mobile-only" onClick={() => setView('domains')}>
                  <ArrowLeft size={15} /> Domains
                </button>
                <div className="adm-panel-header-meta">
                  <h3 className="adm-panel-title">{currentDomainMeta?.title}</h3>
                  <p className="adm-panel-sub">{filteredDomainUsers.length} applicant{filteredDomainUsers.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="adm-search-wrap">
                  <Search size={15} className="adm-search-icon" />
                  <input
                    type="text"
                    className="adm-search-input"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="adm-user-list">
                {filteredDomainUsers.length === 0 ? (
                  <div className="adm-placeholder">
                    <Users size={36} className="adm-placeholder-icon" />
                    <p>No applicants found</p>
                  </div>
                ) : (
                  filteredDomainUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`adm-user-row ${selectedUser?.id === u.id ? 'active' : ''}`}
                    >
                      <div className="adm-user-avatar">
                        {(u.name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="adm-user-info">
                        <span className="adm-user-name">{u.name || 'Unnamed'}</span>
                        <span className="adm-user-email">{u.email}</span>
                        {u.branch && <span className="adm-user-meta">{u.branch} • {u.year}</span>}
                      </div>
                      <div className="adm-user-row-right">
                        {u.autoSubmitted && <span className="adm-tag adm-tag-warn">Auto</span>}
                        {(u.domains?.length || 0) > 1 && (
                          <span className="adm-tag adm-tag-info">{u.domains.length}d</span>
                        )}
                        <ChevronRight size={16} className="adm-chevron" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </section>

        {/* ════ RIGHT — detail panel ════ */}
        <section className={`adm-panel adm-detail-panel ${view === 'detail' ? 'adm-mobile-screen-active adm-detail-open' : ''}`}>
          {!selectedUser ? (
            <div className="adm-placeholder">
              <UserIcon size={48} className="adm-placeholder-icon" />
              <p>Select an applicant to review answers</p>
            </div>
          ) : (
            <div id="applicant-detail-content" style={{ width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg, #0a0a0a)' }}>
              {/* Detail Header */}
              <div className="adm-detail-header">
                <button className="adm-back-btn" onClick={() => setView('users')} data-html2canvas-ignore="true">
                  <ArrowLeft size={15} /> Back
                </button>
                <div className="adm-detail-identity">
                  <div className="adm-detail-avatar">
                    {(selectedUser.name || selectedUser.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="adm-detail-identity-text">
                    <h2 className="adm-detail-name">{selectedUser.name || 'Applicant'}</h2>
                    <p className="adm-detail-email">{selectedUser.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }} data-html2canvas-ignore="true">
                  <button onClick={handleExportPDF} className="adm-btn adm-btn-primary" style={{ background: 'var(--color-primary)', color: 'white' }} title="Export as PDF">
                    <Download size={14} /><span className="adm-hide-xs"> Export PDF</span>
                  </button>
                  {/* <button onClick={handleDeleteUser} className="adm-btn adm-btn-danger" title="Delete user">
                    <Trash2 size={14} /><span> Delete</span>
                  </button> */}
                </div>
              </div>

              {/* Bio Grid */}
              <div className="adm-bio-grid">
                {[
                  ['Roll No',   selectedUser.rollNo],
                  ['WhatsApp',  selectedUser.whatsapp],
                  ['Branch',    selectedUser.branch],
                  ['Year',      selectedUser.year],
                  ['Gender',    selectedUser.gender],
                  ['Submitted', selectedUser.submittedAt
                    ? new Date(selectedUser.submittedAt.seconds * 1000).toLocaleString()
                    : 'Unknown'],
                ].map(([label, value]) => (
                  <div key={label} className="adm-bio-cell">
                    <span className="adm-bio-label">{label}</span>
                    <span className="adm-bio-value">{value || 'N/A'}</span>
                  </div>
                ))}
              </div>

              {/* All domains this user applied for */}
              {selectedUser.domains?.length > 0 && (
                <div className="adm-domain-tags-row">
                  <span className="adm-bio-label">Applied for:</span>
                  {selectedUser.domains.map(d => (
                    <span key={d} className={`adm-tag ${d === selectedDomain ? 'adm-tag-primary' : 'adm-tag-info'}`}>
                      {DOMAIN_QUESTIONS[d]?.title || d}
                    </span>
                  ))}
                </div>
              )}

              {/* Answers — only for the currently viewed domain */}
              <div className="adm-answers-section">
                {loadingAnswers ? (
                  <p className="adm-loading-text">Fetching answers…</p>
                ) : !userAnswers ? (
                  <p className="adm-loading-text">Could not load answers.</p>
                ) : (
                  (() => {
                    const domainMeta      = DOMAIN_QUESTIONS[selectedDomain];
                    const domainResponses = userAnswers[selectedDomain];

                    if (!domainMeta) return null;

                    return (
                      <div className="adm-domain-answers">
                        <h4 className="adm-answers-domain-title">
                          <span className="adm-dot" /> {domainMeta.title} — Answers
                        </h4>

                        {domainResponses ? (
                          <div className="adm-qa-list">
                            {domainMeta.questions.map((q, idx) => {
                              const answer = domainResponses[q.id];
                              return (
                                <div key={q.id} className="adm-qa-item">
                                  <p className="adm-qa-question">
                                    <span className="adm-q-num">Q{idx + 1}</span> {q.text}
                                  </p>
                                  <div className="adm-qa-answer">
                                    {answer
                                      ? answer
                                      : <em className="adm-no-answer">No answer provided</em>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="adm-loading-text adm-no-resp">
                            No responses found in the database for this domain.
                          </p>
                        )}

                        {selectedUser.domains?.filter(d => d !== selectedDomain).length > 0 && (
                          <p className="adm-other-domains-note">
                            Also applied for:{' '}
                            {selectedUser.domains
                              .filter(d => d !== selectedDomain)
                              .map(d => DOMAIN_QUESTIONS[d]?.title || d)
                              .join(', ')}
                            . Select that domain from the sidebar to view those answers.
                          </p>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}