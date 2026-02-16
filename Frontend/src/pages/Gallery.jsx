import { useState, useEffect } from 'react';
import { FaSearch, FaHeart, FaComment } from 'react-icons/fa';
import './Gallery.css';

const Gallery = () => {
  const [posts, setPosts] = useState([]); // Itt tároljuk a DB adatait
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Mind');

  // Adatok lekérése a szerverről
  useEffect(() => {
    fetch('http://localhost:3000/api/gallery')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Hiba:", err);
        setLoading(false);
      });
  }, []);

  const categories = ['Mind', 'Természet', 'Város', 'Tech', 'Digitális Art'];

  // SZŰRÉS (A frontend oldalon szűrjük a lekérdezett listát)
  const filteredPosts = posts.filter((post) => {
    // Ha 'Mind', akkor igaz, amúgy a kategória névnek egyeznie kell
    const matchesCategory = selectedCategory === 'Mind' || post.category_name === selectedCategory;
    // A címben keresünk
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="gallery-container">
      
      {/* KERESŐ SÁV */}
      <div className="gallery-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Keresés cím alapján..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map((cat) => (
            <button 
              key={cat} 
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TÖLTÉS JELZŐ */}
      {loading && <p style={{textAlign:'center'}}>Képek betöltése...</p>}

      {/* GALÉRIA RÁCS */}
      <div className="gallery-grid">
        {!loading && filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.id} className="gallery-item">
              <img src={post.image_url} alt={post.title} loading="lazy" />
              
              <div className="overlay">
                <span className="img-title">{post.title}</span>
                <span className="img-user">@{post.username}</span>
                
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  {/* Ezek most még statikus számok, később beköthetjük a like táblát is */}
                  <span style={{ fontSize: '0.9rem' }}><FaHeart /> 12</span> 
                  <span style={{ fontSize: '0.9rem' }}><FaComment /> 3</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && <div className="no-results">Nincs találat.</div>
        )}
      </div>
      
    </div>
  );
};

export default Gallery;