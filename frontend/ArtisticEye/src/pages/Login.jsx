import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate a továbbirányításhoz
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  
  // Állapotok a bemeneti mezőkhöz
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');

  // Ha írnak a mezőbe, frissítjük az állapotot
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Űrlap elküldése
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Hiba törlése

    // 1. Validáció (Tesztelői szempont!)
    if (!formData.email || !formData.password) {
      setError('Kérlek töltsd ki az összes mezőt!');
      return;
    }

    // 2. Szimulált belépés (Később ide jön a Backend API hívás)
    console.log('Login adatok:', formData);
    
    // Sikeres belépés imitálása:
    alert('Sikeres bejelentkezés (Demo)');
    navigate('/profile'); // Átirányítás a profilra
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Bejelentkezés</h2>
        
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit" className="auth-btn">Belépés</button>
        </form>

        <div className="auth-footer">
          <p>Még nincs fiókod? <Link to="/register">Regisztrálj itt!</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;