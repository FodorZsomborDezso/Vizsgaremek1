import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // SIKERES BELÉPÉS!
        // Elmentjük az adatokat a böngészőbe
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Frissítjük az oldalt, hogy a Header észrevegye a változást
        // (Később ezt elegánsabban, Context-tel oldjuk meg, de vizsgára ez a leggyorsabb)
        window.location.href = '/profile'; 
      } else {
        setError(data.error || 'Hibás adatok.');
      }

    } catch (err) {
      setError('Nem sikerült elérni a szervert.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Bejelentkezés</h2>
        
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email cím</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Jelszó</label>
            <input type="password" name="password" onChange={handleChange} required />
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