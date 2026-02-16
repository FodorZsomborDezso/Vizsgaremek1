import { useState, useEffect } from 'react'; // useEffect kell a lekérdezéshez
import { FaLightbulb, FaPenFancy, FaPalette } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Ideas.css';

const Ideas = () => {
  const [ideas, setIdeas] = useState([]); // Üres tömbbel indulunk
  const [loading, setLoading] = useState(true); // Töltés állapot
  const [error, setError] = useState(null); // Hiba állapot

  // Amikor az oldal betöltődik, lekérjük az adatokat
  useEffect(() => {
    fetch('http://localhost:3000/api/ideas')
      .then(response => {
        if (!response.ok) { throw new Error('Hiba a szerver elérésében'); }
        return response.json();
      })
      .then(data => {
        setIdeas(data); // Beállítjuk a kapott adatokat
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Nem sikerült betölteni az ötleteket. Fut a backend?");
        setLoading(false);
      });
  }, []);

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
        <button className="new-idea-btn">
          <FaPenFancy style={{ marginRight: '8px' }} /> Új Ötlet Közzététele
        </button>
      </div>

      {/* HIBAKEZELÉS ÉS TÖLTÉS */}
      {loading && <p style={{textAlign: 'center'}}>Betöltés...</p>}
      {error && <p style={{textAlign: 'center', color: 'red'}}>{error}</p>}

      {/* ÖTLETEK LISTÁJA */}
      <div className="ideas-list">
        {!loading && !error && ideas.map((idea) => (
          <div key={idea.id} className="idea-card">
            
            <div className="idea-header">
              <div className="idea-user">
                {/* Figyeld meg: most már az adatbázis mezőit használjuk! */}
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
              
              <Link to="/upload" style={{ textDecoration: 'none' }}>
                <button className="action-btn">
                  <FaPalette style={{ marginRight: '5px' }} /> Megvalósítom
                </button>
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default Ideas;