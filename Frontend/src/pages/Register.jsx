import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Validáció
    if (formData.password !== formData.confirmPassword) {
      setError('A két jelszó nem egyezik meg!');
      return;
    }

    try {
      // POST kérés küldése a Backendnek
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Sikeres regisztráció! Átirányítás a belépéshez...');
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
            <label>Felhasználónév</label>
            <input type="text" name="username" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email cím</label>
            <input type="email" name="email" onChange={handleChange} required />
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