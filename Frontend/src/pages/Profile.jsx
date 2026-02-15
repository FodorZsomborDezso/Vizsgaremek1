import { useState } from 'react';
import { FaUserEdit, FaCamera, FaHeart, FaMapMarkerAlt, FaLink } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('posts');

  // DUMMY USER ADATOK
  const user = {
    name: "Fodor Zsombor",
    username: "@zsombor_dev",
    bio: "Full Stack fejlesztő. Szeretem a természetfotózást és a modern webes technológiákat. A kávé a motorom.",
    location: "Budapest, Hungary",
    website: "github.com/zsombor",
    postsCount: 12,
    followers: 145,
    following: 30,
    avatar: "https://ui-avatars.com/api/?name=Fodor+Zsombor&background=0D8ABC&color=fff&size=200"
  };

  // DUMMY KÉPEK
  const myPosts = [
    { id: 1, url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', title: 'Coding Setup' },
    { id: 2, url: 'https://images.unsplash.com/photo-1526772662000-3f88f107f5d8', title: 'Monitor' },
    { id: 4, url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f', title: 'Retro Tech' },
  ];

  const likedPosts = [
    { id: 3, url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d', title: 'Night City' },
  ];

  return (
    <div className="profile-container">
      
      {/* 1. PROFIL KÁRTYA (Egyben a fejléc és az infók) */}
      <div className="profile-card">
        {/* Színes borítókép */}
        <div className="cover-photo"></div>
        
        <div className="profile-content">
          {/* Profilkép (Negatív margóval felhúzva) */}
          <img src={user.avatar} alt="Avatar" className="avatar" />
          
          <div className="profile-name-section">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-username">{user.username}</p>
          </div>

          <p className="profile-bio">{user.bio}</p>

          {/* Helyszín és Link (Opcionális extra infók) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
            <span><FaMapMarkerAlt /> {user.location}</span>
            <span><FaLink /> {user.website}</span>
          </div>

          {/* Szerkesztés gomb */}
          <button className="edit-profile-btn">
            <FaUserEdit /> Profil szerkesztése
          </button>

          {/* Statisztika */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{user.postsCount}</span>
              <span className="stat-label">Poszt</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.followers}</span>
              <span className="stat-label">Követő</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.following}</span>
              <span className="stat-label">Követés</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABOK (Váltás) */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <FaCamera /> Saját képek
        </button>
        <button 
          className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          <FaHeart /> Kedvelések
        </button>
      </div>

      {/* 3. GALÉRIA GRID */}
      <div className="gallery-grid">
        {activeTab === 'posts' ? (
          myPosts.length > 0 ? (
            myPosts.map(post => (
              <div key={post.id} className="gallery-item">
                <img src={post.url} alt={post.title} />
                <div className="overlay">
                  <span className="img-title">{post.title}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">Még nem töltöttél fel képet.</div>
          )
        ) : (
          likedPosts.length > 0 ? (
            likedPosts.map(post => (
              <div key={post.id} className="gallery-item">
                <img src={post.url} alt={post.title} />
                <div className="overlay">
                  <span className="img-title">Kedvelve <FaHeart /></span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">Még nincs kedvenc képed.</div>
          )
        )}
      </div>

    </div>
  );
};

export default Profile;