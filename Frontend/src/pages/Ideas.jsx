import { useState, useEffect } from 'react';
import { FaLightbulb, FaPenFancy, FaPalette, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Ideas.css';

const Ideas = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // MODAL ÁLLAPOTOK
  const [showModal, setShowModal] = useState(false); // Látszik-e az ablak?
  const [newIdea, setNewIdea] = useState({ title: '', description: '', category_id: '1' });

  // 1. ÖTLETEK BETÖLTÉSE (Külön függvénybe tettük, hogy frissíteni tudjuk)
  const fetchIdeas = () => {
    setLoading(true);
    fetch('http://localhost:3000/api/ideas')
      .then(res => res.json())
      .then(data => {
        setIdeas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Szerver hiba.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleImplement = (idea) => {
    navigate('/upload', { 
      state: { type: 'response', ideaId: idea.id, ideaTitle: idea.title } 
    });
  };

  // 2. ÚJ ÖTLET BEKÜLDÉSE
  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Kérlek jelentkezz be az ötletíráshoz!");
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newIdea)
      });

      if (response.ok) {
        alert("Ötlet sikeresen közzétéve!");
        setShowModal(false); // Bezárjuk az ablakot
        setNewIdea({ title: '', description: '', category_id: '1' }); // Töröljük az űrlapot
        fetchIdeas(); // Újratöltjük a listát, hogy látszódjon az új elem!
      } else {
        alert("Hiba történt a mentéskor.");
      }

    } catch (error) {
      console.error(error);
      alert("Nem sikerült elérni a szervert.");
    }
  };

  return (
    <div className="ideas-container">
      
      {/* FEJLÉC */}
      <div className="ideas-header">
        <h1 style={{ color: 'var(--text-primary)' }}>
          <FaLightbulb style={{ color: '#ffcc00', marginRight: '10px' }} />
          Ötletbörze
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '10px auto' }}>
          Oszd meg az elképzelésedet, és a közösség alkotói megvalósítják!
        </p>
        
        {/* GOMB: Megnyitja a modalt */}
        <button className="new-idea-btn" onClick={() => setShowModal(true)}>
          <FaPenFancy style={{ marginRight: '8px' }} /> Új Ötlet Közzététele
        </button>
      </div>

      {/* --- MODAL (Csak akkor renderelődik, ha showModal = true) --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowModal(false)}><FaTimes /></button>
            
            <h2 className="modal-title">Új Ötlet</h2>
            
            <form onSubmit={handleSubmitIdea} className="modal-form">
              <div className="form-group">
                <label>Cím</label>
                <input 
                  type="text" 
                  placeholder="Pl. Cyberpunk Lánchíd" 
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Kategória</label>
                <select 
                  value={newIdea.category_id}
                  onChange={(e) => setNewIdea({...newIdea, category_id: e.target.value})}
                >
                  <option value="1">Természet</option>
                  <option value="2">Város</option>
                  <option value="3">Tech</option>
                  <option value="4">Digitális Art</option>
                  <option value="5">Design</option>
                </select>
              </div>

              <div className="form-group">
                <label>Részletes leírás</label>
                <textarea 
                  rows="4" 
                  placeholder="Írd le minél pontosabban, mit szeretnél látni..."
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-idea-btn">Közzététel</button>
            </form>
          </div>
        </div>
      )}

      {/* HIBAKEZELÉS */}
      {loading && <p style={{textAlign: 'center'}}>Betöltés...</p>}
      {error && <p style={{textAlign: 'center', color: 'red'}}>{error}</p>}

      {/* ÖTLETEK LISTÁJA */}
      <div className="ideas-list">
        {!loading && !error && ideas.map((idea) => (
          <div key={idea.id} className="idea-card">
            <div className="idea-header">
              <div className="idea-user">
                <img src={idea.avatar_url} alt="Avatar" className="user-avatar-small" />
                <span>@{idea.username}</span>
              </div>
              <span className="idea-category">{idea.category_name}</span>
            </div>

            <div className="idea-content">
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
            </div>

            <div className="idea-footer">
              <span>{new Date(idea.created_at).toLocaleDateString()}</span>
              <button className="action-btn" onClick={() => handleImplement(idea)}>
                <FaPalette style={{ marginRight: '5px' }} /> Megvalósítom
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ideas;