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
  const DELETE_PASSWORD = 'webd@2026';
  const [users,          setUsers]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedUser,   setSelectedUser]   = useState(null);
  const [userAnswers,    setUserAnswers]     = useState(null);
  const [loadingAnswers, setLoadingAnswers]  = useState(false);
  const [exportingDomain, setExportingDomain] = useState(false);
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

    const pwd = window.prompt('Enter admin password to delete this user:');
    if (pwd === null) return; // cancelled
    if (pwd !== DELETE_PASSWORD) {
      alert('Incorrect password. Deletion cancelled.');
      return;
    }

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

  /* ── export single user pdf ───────────────────────────── */
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

  /* ── export whole domain pdf (FIXED) ────────────────────── */
  const handleExportDomainPDF = async () => {
    if (!selectedDomain || !db) return;
    const domainMeta = DOMAIN_QUESTIONS[selectedDomain];
    if (!domainMeta) return;
    setExportingDomain(true);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' });

      const PAGE_W    = doc.internal.pageSize.getWidth();
      const PAGE_H    = doc.internal.pageSize.getHeight();
      const MARGIN    = 40;
      const CONTENT_W = PAGE_W - MARGIN * 2;
      const LINE_H    = 15;
      const BLUE      = [37, 99, 235];
      const DARK      = [17, 17, 17];
      const GRAY      = [107, 114, 128];
      const LIGHT_BG  = [249, 250, 251];
      const BORDER    = [229, 231, 235];

      let y = MARGIN;

      const checkPage = (needed = 20) => {
        if (y + needed > PAGE_H - MARGIN) {
          doc.addPage();
          y = MARGIN;
        }
      };

      const drawText = (text, x, fontSize, color, opts = {}) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
        if (opts.bold) doc.setFont('helvetica', 'bold');
        else           doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(String(text ?? ''), opts.maxWidth ?? CONTENT_W);
        lines.forEach(line => {
          checkPage();
          doc.text(line, x, y);
          y += LINE_H * (fontSize / 10);
        });
      };

      // ── Cover header ──────────────────────────────
      drawText(domainMeta.title, MARGIN, 20, DARK, { bold: true });
      y += 4;
      drawText(
        `All Applicant Responses  ·  ${domainUsers.length} applicant${domainUsers.length !== 1 ? 's' : ''}`,
        MARGIN, 10, GRAY
      );
      y += 6;
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(1);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 16;

      // ── Per-user blocks ───────────────────────────
      for (let i = 0; i < domainUsers.length; i++) {
        const u = domainUsers[i];

        // Fetch answers
        let answers = {};
        try {
          const q    = query(collection(db, selectedDomain), where('email', '==', u.email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const { userId, email, autoSubmitted, submittedAt, ...flat } = snap.docs[0].data();
            answers = flat;
          }
        } catch (e) {
          console.error('fetch failed for', u.email, e);
        }

        const submittedDate = u.submittedAt
          ? new Date(u.submittedAt.seconds * 1000).toLocaleString()
          : 'Unknown';

        checkPage(120);

        // Card background
        const cardStartY = y;
        // We'll patch height after drawing; draw a placeholder rect first
        const cardX = MARGIN - 8;
        const cardW = CONTENT_W + 16;

        // ── Name + email ──
        y += 10;
        drawText(u.name || 'Unnamed', MARGIN + 4, 13, DARK, { bold: true });
        drawText(u.email, MARGIN + 4, 10, GRAY);
        y += 4;

        // ── Bio row ──
        doc.setDrawColor(...BORDER);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(MARGIN + 4, y, CONTENT_W - 8, 52, 3, 3, 'FD');

        const bioFields = [
          ['Roll No',   u.rollNo],
          ['Branch',    u.branch],
          ['Year',      u.year],
          ['WhatsApp',  u.whatsapp],
          ['Gender',    u.gender],
          ['Submitted', submittedDate],
        ];
        const colW = (CONTENT_W - 8) / 3;
        bioFields.forEach(([label, value], idx) => {
          const col  = idx % 3;
          const row  = Math.floor(idx / 3);
          const bx   = MARGIN + 4 + col * colW + 6;
          const by   = y + row * 26 + 10;

          doc.setFontSize(8);
          doc.setTextColor(...GRAY);
          doc.setFont('helvetica', 'normal');
          doc.text(label, bx, by);

          doc.setFontSize(9);
          doc.setTextColor(...DARK);
          doc.setFont('helvetica', 'bold');
          doc.text(String(value || 'N/A'), bx, by + 12);
        });
        y += 60;

        // ── Q&A ──
        domainMeta.questions.forEach((q, idx) => {
          const answer = answers[q.id];

          checkPage(40);

          // Question label
          // Small blue badge "Q1"
          doc.setFillColor(...BLUE);
          doc.roundedRect(MARGIN + 4, y, 18, 12, 2, 2, 'F');
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text(`Q${idx + 1}`, MARGIN + 6, y + 8.5);

          doc.setFontSize(10);
          doc.setTextColor(...DARK);
          doc.setFont('helvetica', 'bold');
          const qLines = doc.splitTextToSize(q.text, CONTENT_W - 30);
          qLines.forEach((line, li) => {
            if (li === 0) doc.text(line, MARGIN + 26, y + 9);
            else {
              y += 13;
              checkPage();
              doc.text(line, MARGIN + 26, y + 9);
            }
          });
          y += 16;

          // Answer box
          const ansText  = answer ? String(answer) : 'No answer provided';
          const ansColor = answer ? DARK : GRAY;
          const ansLines = doc.splitTextToSize(ansText, CONTENT_W - 22);
          const boxH     = ansLines.length * 13 + 12;

          checkPage(boxH + 6);
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(...(answer ? BLUE : BORDER));
          doc.setLineWidth(0.5);
          doc.rect(MARGIN + 4, y, CONTENT_W - 8, boxH);

          // Blue left accent bar
          doc.setFillColor(...(answer ? BLUE : BORDER));
          doc.rect(MARGIN + 4, y, 3, boxH, 'F');

          doc.setFontSize(9.5);
          doc.setTextColor(...ansColor);
          doc.setFont('helvetica', 'normal');
          ansLines.forEach((line, li) => {
            doc.text(line, MARGIN + 12, y + 10 + li * 13);
          });
          y += boxH + 10;
        });

        // Now draw card border retroactively
        const cardEndY = y + 8;
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.5);
        doc.setFillColor(...LIGHT_BG);
        // Draw behind — we can't do this retroactively in jsPDF easily,
        // so just draw a border rect on top (still visible as card outline)
        doc.rect(cardX, cardStartY, cardW, cardEndY - cardStartY);

        y += 16;

        // Page break between users (not after last)
        if (i < domainUsers.length - 1) {
          doc.addPage();
          y = MARGIN;
        }
      }

      doc.save(`${domainMeta.title}_All_Responses.pdf`);

    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export. Check console.');
    } finally {
      setExportingDomain(false);
    }
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
                  <ArrowLeft size={15} /><span className="adm-hide-xs"> Domains</span>
                </button>
                <div className="adm-panel-header-meta">
                  <h3 className="adm-panel-title">{currentDomainMeta?.title}</h3>
                  <p className="adm-panel-sub">{filteredDomainUsers.length} applicant{filteredDomainUsers.length !== 1 ? 's' : ''}</p>
                </div>

                {/* ── Export Domain PDF button — always visible when a domain is selected ── */}
                <button
                  onClick={handleExportDomainPDF}
                  className="adm-btn adm-btn-primary"
                  disabled={exportingDomain || domainUsers.length === 0}
                  title={`Export all ${domainUsers.length} responses as PDF`}
                  style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {exportingDomain
                    ? <><span className="adm-hide-xs">Exporting…</span></>
                    : <><Download size={14} /><span className="adm-hide-xs"> Domain PDF</span></>
                  }
                </button>

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
              <LayoutGrid size={48} className="adm-placeholder-icon" />
              <p>Select an applicant to view their responses</p>
            </div>
          ) : (
            <div id="applicant-detail-content" style={{ width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg, #0a0a0a)' }}>
              {/* Detail Header */}
              <div className="adm-detail-header">
                <button className="adm-back-btn" onClick={() => setView('users')} data-html2canvas-ignore="true">
                  <ArrowLeft size={15} /><span className="adm-hide-xs"> Back</span>
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
                  <button onClick={handleDeleteUser} className="adm-btn adm-btn-danger" title="Delete user">
                    <Trash2 size={14} /><span className="adm-hide-xs"> Delete</span>
                  </button>
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