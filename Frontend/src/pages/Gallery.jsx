import { useState } from 'react';
import { FaSearch, FaHeart, FaComment } from 'react-icons/fa';
import './Gallery.css';

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Mind');

  // DUMMY ADATOK (Később az API-ból jön)
  const allPosts = [
    { id: 1, title: 'Hegyi túra', category: 'Természet', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', likes: 45, comments: 12 },
    { id: 2, title: 'Neon Cyberpunk', category: 'Tech', image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086', likes: 120, comments: 34 },
    { id: 3, title: 'Reggeli Kávé', category: 'Életmód', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', likes: 30, comments: 5 },
    { id: 4, title: 'Budapest Lánchíd', category: 'Város', image: 'https://images.unsplash.com/photo-1565426873118-a17ed65d7429', likes: 88, comments: 21 },
    { id: 5, title: 'Kódolás éjjel', category: 'Tech', image: 'https://images.unsplash.com/photo-1510915228340-45c112ee799c', likes: 200, comments: 45 },
    { id: 6, title: 'Őszi erdő', category: 'Természet', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', likes: 67, comments: 9 },
  ];

  const categories = ['Mind', 'Természet', 'Város', 'Tech', 'Életmód'];

  // SZŰRÉSI LOGIKA
  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'Mind' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="gallery-container">
      
      {/* KERESŐ ÉS SZŰRŐK */}
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

      {/* GALÉRIA RÁCS (A Home.css gridjét használjuk újra!) */}
      <div className="gallery-grid">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.id} className="gallery-item">
              <img src={post.image} alt={post.title} />
              <div className="overlay">
                <span className="img-title">{post.title}</span>
                <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                  <span style={{ fontSize: '0.9rem' }}><FaHeart /> {post.likes}</span>
                  <span style={{ fontSize: '0.9rem' }}><FaComment /> {post.comments}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">Nincs találat a keresési feltételekre.</div>
        )}
      </div>
      
    </div>
  );
};

export default Gallery;