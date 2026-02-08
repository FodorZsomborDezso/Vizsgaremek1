import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css'; // Ugyanazt a CSS-t használjuk

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // --- VALIDÁCIÓ (Vizsga szempontból kritikus!) ---
    
    // 1. Üres mezők ellenőrzése
    if (!formData.username || !formData.email || !formData.password) {
      setError('Minden mező kitöltése kötelező!');
      return;
    }

    // 2. Jelszavak egyezése
    if (formData.password !== formData.confirmPassword) {
      setError('A két jelszó nem egyezik meg!');
      return;
    }

    // 3. Jelszó hossza
    if (formData.password.length < 6) {
      setError('A jelszónak legalább 6 karakternek kell lennie!');
      return;
    }

    // --- Ha minden oké ---
    console.log('Regisztrációs adatok:', formData);
    alert('Sikeres regisztráció! Most jelentkezz be.');
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Csatlakozz</h2>
        
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Felhasználónév</label>
            <input 
              type="text" 
              name="username" 
              placeholder="pl. KisPista"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email cím</label>
            <input 
              type="email" 
              name="email" 
              placeholder="pelda@email.hu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Jelszó</label>
            <input 
              type="password" 
              name="password" 
              placeholder="******"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Jelszó megerősítése</label>
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="******"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
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