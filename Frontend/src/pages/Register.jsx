import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; // Ikon a profilkép mezőhöz
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar_url: '' // ÚJ MEZŐ
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('A két jelszó nem egyezik meg!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          avatar_url: formData.avatar_url // Elküldjük ezt is!
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Sikeres regisztráció! Most már van profilképed is.');
        setTimeout(() => {
            navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'Hiba történt.');
      }

    } catch (err) {
      setError('Nem sikerült elérni a szervert.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Csatlakozz</h2>
        
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg" style={{color: 'green', textAlign:'center', marginBottom:'10px'}}>{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Felhasználónév *</label>
            <input type="text" name="username" onChange={handleChange} required placeholder="Pl. KovacsBela" />
          </div>

          <div className="form-group">
            <label>Email cím *</label>
            <input type="email" name="email" onChange={handleChange} required placeholder="bela@email.hu" />
          </div>

          {/* ÚJ MEZŐ: Profilkép URL */}
          <div className="form-group">
            <label>Profilkép URL (Opcionális)</label>
            <div style={{position: 'relative'}}>
              <input 
                type="text" 
                name="avatar_url" 
                onChange={handleChange} 
                placeholder="https://imgur.com/..." 
                style={{paddingLeft: '40px', width: '100%', boxSizing: 'border-box'}} // Hely az ikonnak
              />
              <FaUserCircle style={{position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)'}}/>
            </div>
            <small style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>
              Ha üresen hagyod, generálunk egyet a nevedből!
            </small>
          </div>

          <div className="form-group">
            <label>Jelszó *</label>
            <input type="password" name="password" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Jelszó megerősítése *</label>
            <input type="password" name="confirmPassword" onChange={handleChange} required />
          </div>

          <button type="submit" className="auth-btn">Regisztráció</button>
        </form>

        <div className="auth-footer">
          <p>Már van fiókod? <Link to="/login">Jelentkezz be!</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;