import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaUsers, FaImages, FaShieldAlt, FaExclamationTriangle, FaHeart, FaEye, FaTimes, FaCommentDots } from 'react-icons/fa';
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports'); 
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]); // ÚJ: Visszajelzések állapota
  const [loading, setLoading] = useState(true);
  
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) { navigate('/login'); return; }
    if (JSON.parse(userStr).role !== 'admin') { navigate('/'); return; }
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    setLoading(true);
    try {
      const usersRes = await fetch('http://localhost:3000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      if (usersRes.ok) setUsers(await usersRes.json());

      const postsRes = await fetch('http://localhost:3000/api/gallery');
      if (postsRes.ok) setPosts(await postsRes.json());

      const reportsRes = await fetch('http://localhost:3000/api/admin/reports', { headers: { 'Authorization': `Bearer ${token}` } });
      if (reportsRes.ok) setReports(await reportsRes.json());

      // ÚJ: Visszajelzések letöltése
      const feedbackRes = await fetch('http://localhost:3000/api/admin/feedbacks', { headers: { 'Authorization': `Bearer ${token}` } });
      if (feedbackRes.ok) setFeedbacks(await feedbackRes.json());
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Biztosan törlöd ezt a felhasználót? Minden posztja és kommentje is végleg törlődni fog!')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) { setUsers(users.filter(u => u.id !== id)); fetchData(token); }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Biztosan törlöd ezt a posztot?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/admin/posts/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setPosts(posts.filter(p => p.id !== id));
  };

  // ÚJ: Visszajelzés törlése (Megoldva)
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Biztosan törlöd ezt a visszajelzést? (Pl. mert már megoldottad)')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/admin/feedbacks/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setFeedbacks(feedbacks.filter(f => f.id !== id));
  };

  // --- MODERÁCIÓS FÜGGVÉNYEK ---

  const handleDismissReport = async (reportId) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3000/api/admin/reports/${reportId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setReports(reports.filter(r => r.id !== reportId));
    setSelectedReport(null);
  };

  const handleDeleteContent = async (report) => {
    if (!window.confirm("Biztosan törlöd a jelentett tartalmat? Ezt nem lehet visszavonni!")) return;
    const token = localStorage.getItem('token');
    
    try {
        if (report.target_type === 'post') {
            await fetch(`http://localhost:3000/api/admin/posts/${report.target_id}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${token}`} });
        } else if (report.target_type === 'comment') {
            await fetch(`http://localhost:3000/api/admin/comments/${report.target_id}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${token}`} });
        }

        await fetch(`http://localhost:3000/api/admin/reports/${report.id}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${token}`} });

        setReports(reports.filter(r => r.id !== report.id));
        setSelectedReport(null);
        fetchData(token); 
    } catch(e) { console.error("Hiba a moderáció során:", e); }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-primary)'}}>Adatok betöltése folyamatban...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1><FaShieldAlt style={{color: '#e74c3c'}} /> Adminisztrációs Központ</h1>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}><FaExclamationTriangle /> Jelentések ({reports.length})</button>
        {/* ÚJ: Visszajelzések Fül */}
        <button className={activeTab === 'feedbacks' ? 'active' : ''} onClick={() => setActiveTab('feedbacks')}><FaCommentDots /> Visszajelzések ({feedbacks.length})</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}><FaUsers /> Felhasználók ({users.length})</button>
        <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}><FaImages /> Posztok ({posts.length})</button>
      </div>

      <div className="admin-content">
        
        {/* JELENTÉSEK TÁBLÁZAT */}
        {activeTab === 'reports' && (
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Típus</th><th>Bejelentő</th><th>Indoklás</th><th>Dátum</th><th>Művelet</th></tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map(r => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>
                      <span style={{ background: r.target_type === 'post' ? '#3498db' : '#9b59b6', color: 'white', padding: '3px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {r.target_type.toUpperCase()}
                      </span>
                    </td>
                    <td>@{r.reporter_name}</td>
                    <td>{r.reason}</td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="admin-delete-btn" style={{backgroundColor: '#f39c12'}} onClick={() => setSelectedReport(r)}>
                        <FaEye /> Megtekintés
                      </button>
                    </td>
                  </tr>
                ))
              ) : ( <tr><td colSpan="6" style={{textAlign:'center', padding: '30px'}}>Nincs új bejelentés. Minden rendben van! 🎉</td></tr> )}
            </tbody>
          </table>
        )}

        {/* ÚJ: VISSZAJELZÉSEK TÁBLÁZAT */}
        {activeTab === 'feedbacks' && (
          <table className="admin-table">
            <thead>
              <tr><th>Típus</th><th>Név & Email</th><th>Üzenet</th><th>Dátum</th><th>Művelet</th></tr>
            </thead>
            <tbody>
              {feedbacks.length > 0 ? (
                feedbacks.map(f => (
                  <tr key={f.id}>
                    <td>
                      <span style={{ background: f.type === 'Hiba' ? '#e74c3c' : f.type === 'Javaslat' ? '#2ecc71' : '#3498db', color: 'white', padding: '3px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {f.type.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <strong>{f.name}</strong><br/>
                      <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{f.email}</span>
                    </td>
                    <td style={{maxWidth: '300px', whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{f.message}</td>
                    <td>{new Date(f.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="admin-delete-btn" onClick={() => handleDeleteFeedback(f.id)}>
                        <FaTrash /> Törlés
                      </button>
                    </td>
                  </tr>
                ))
              ) : ( <tr><td colSpan="5" style={{textAlign:'center', padding: '30px'}}>Nincs új visszajelzés. 📥</td></tr> )}
            </tbody>
          </table>
        )}

        {/* Felhasználók táblázat */}
        {activeTab === 'users' && (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Név</th><th>Email</th><th>Szerepkör</th><th>Művelet</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td><td><strong>{u.username}</strong></td><td>{u.email}</td>
                  <td><span className={`role-badge ${u.role}`}>{u.role.toUpperCase()}</span></td>
                  <td>{u.role !== 'admin' && <button className="admin-delete-btn" onClick={() => handleDeleteUser(u.id)}><FaTrash /> Törlés</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Posztok táblázat */}
        {activeTab === 'posts' && (
          <table className="admin-table">
            <thead><tr><th>Kép</th><th>Cím</th><th>Feltöltő</th><th>Lájkok</th><th>Művelet</th></tr></thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td><img src={p.image_url} alt="thumbnail" className="admin-thumbnail" style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px'}} /></td>
                  <td><strong>{p.title}</strong></td><td>@{p.username}</td>
                  <td><FaHeart style={{color: '#e74c3c'}}/> {p.like_count || 0}</td>
                  <td><button className="admin-delete-btn" onClick={() => handleDeletePost(p.id)}><FaTrash /> Törlés</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ========================================= */}
      {/* MODERÁCIÓS FELUGRÓ ABLAK (MODAL)           */}
      {/* ========================================= */}
      {selectedReport && (
        <div className="admin-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border-color)', paddingBottom:'15px', marginBottom:'15px'}}>
              <h2>Jelentés Ellenőrzése</h2>
              <button onClick={() => setSelectedReport(null)} style={{background:'none', border:'none', fontSize:'1.5rem', color:'var(--text-primary)', cursor:'pointer'}}><FaTimes /></button>
            </div>

            <p><strong>Bejelentő:</strong> @{selectedReport.reporter_name}</p>
            <p><strong>Indok:</strong> {selectedReport.reason}</p>

            <div className="reported-content-preview">
              {/* HA POSZTOT JELENTETTEK */}
              {selectedReport.target_type === 'post' && (
                selectedReport.post_image ? (
                  <>
                    <h3 style={{marginTop:'15px'}}>Jelentett Poszt: {selectedReport.post_title}</h3>
                    <img src={selectedReport.post_image} alt="Reported" style={{width: '100%', maxHeight: '300px', objectFit:'contain', borderRadius:'8px', marginTop:'10px', backgroundColor:'#000'}} />
                  </>
                ) : (<p style={{color:'red'}}>Ezt a posztot már törölték az adatbázisból!</p>)
              )}

              {/* HA KOMMENTET JELENTETTEK */}
              {selectedReport.target_type === 'comment' && (
                selectedReport.comment_text ? (
                  <>
                    <h3 style={{marginTop:'15px'}}>Jelentett Komment:</h3>
                    <blockquote style={{borderLeft: '4px solid #e74c3c', padding: '15px', background: 'var(--bg-secondary)', borderRadius:'0 8px 8px 0', marginTop:'10px', fontStyle:'italic'}}>
                      "{selectedReport.comment_text}"
                    </blockquote>
                  </>
                ) : (<p style={{color:'red'}}>Ezt a kommentet már törölték az adatbázisból!</p>)
              )}
            </div>

            {/* AKCIÓ GOMBOK */}
            <div className="admin-modal-actions">
              <button onClick={() => handleDismissReport(selectedReport.id)} className="btn-safe">
                Jelentés Elutasítása (Tartalom marad)
              </button>
              <button onClick={() => handleDeleteContent(selectedReport)} className="btn-danger">
                Tartalom Törlése!
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;