import { useState } from 'react';
import { FaUserEdit, FaCamera, FaHeart } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('posts');

  // Dummy User Adatok
  const user = {
    name: "Fodor Zsombor",
    username: "@zsombor_dev",
    bio: "Full Stack fejlesztő | Szeretem a természetfotózást és a Reactet.",
    postsCount: 12,
    followers: 145,
    following: 30,
    avatar: "https://ui-avatars.com/api/?name=Fodor+Zsombor&background=0D8ABC&color=fff&size=128"
  };

  // Dummy képek
  const myPosts = [
    { id: 1, url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', title: 'Code' },
    { id: 2, url: 'https://images.unsplash.com/photo-1526772662000-3f88f107f5d8', title: 'Monitor' },
  ];

  const likedPosts = [
    { id: 3, url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d', title: 'City' },
  ];

  return (
    <div className="profile-container">
      
      {/* FEJLÉC */}
      <div className="profile-header">
        <div className="cover-photo"></div>
        <div className="profile-info">
          <img src={user.avatar} alt="Avatar" className="avatar" />
          <h2 className="profile-name">
            {user.name} <FaUserEdit style={{ fontSize: '1rem', cursor: 'pointer', color: 'var(--text-secondary)' }} />
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>{user.username}</p>
          <p style={{ maxWidth: '400px', margin: '10px auto' }}>{user.bio}</p>
        </div>
      </div>

      {/* STATISZTIKA */}
      <div className="profile-stats">
        <div className="stat-item">
          <h3>{user.postsCount}</h3>
          <p>Poszt</p>
        </div>
        <div className="stat-item">
          <h3>{user.followers}</h3>
          <p>Követő</p>
        </div>
        <div className="stat-item">
          <h3>{user.following}</h3>
          <p>Követés</p>
        </div>
      </div>

      {/* TABS (Váltó gombok) */}
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

      {/* KÉPEK RÁCS */}
      <div className="gallery-grid">
        {activeTab === 'posts' ? (
          myPosts.map(post => (
            <div key={post.id} className="gallery-item">
              <img src={post.url} alt={post.title} />
            </div>
          ))
        ) : (
          likedPosts.map(post => (
            <div key={post.id} className="gallery-item">
              <img src={post.url} alt={post.title} />
              <div className="overlay"><FaHeart /> Liked</div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Profile;