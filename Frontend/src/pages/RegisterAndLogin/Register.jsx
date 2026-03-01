import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaUserCircle } from 'react-icons/fa';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();

  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [file, setFile] = useState(null); 
  const [preview, setPreview] = useState(null); 

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('A két jelszó nem egyezik meg!');
      return;
    }

    
    
    const dataToSend = new FormData();
    dataToSend.append('username', formData.username);
    dataToSend.append('email', formData.email);
    dataToSend.append('password', formData.password);
    
    if (file) {
      
      dataToSend.append('profileImage', file); 
    }

    try {
      
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: dataToSend 
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Sikeres regisztráció! Kép feltöltve.');
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
        {success && <div className="success-msg" style={{color: 'green', textAlign:'center'}}>{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Felhasználónév</label>
            <input type="text" name="username" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email cím</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Profilkép (Opcionális)</label>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
              
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
                {preview ? (
                  <img src={preview} alt="Előnézet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FaUserCircle style={{ fontSize: '2.5rem', color: 'var(--text-secondary)' }} />
                )}
              </div>

              <label style={{ cursor: 'pointer', color: 'var(--accent-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaCloudUploadAlt /> Kép kiválasztása
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>


          <div className="form-group">
            <label>Jelszó</label>
            <input type="password" name="password" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Jelszó megerősítése</label>
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