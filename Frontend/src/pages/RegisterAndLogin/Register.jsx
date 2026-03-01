import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCloudUploadAlt } from 'react-icons/fa';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();

  // --- ÁLLAPOTOK (Minden adat bekérése) ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // Új, opcionális profil adatok
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  
  // Kép és előnézet
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [loading, setLoading] = useState(false);

  // Kép kiválasztásának kezelése
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return alert("A jelszavak nem egyeznek!");
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('full_name', fullName);
    formData.append('bio', bio);
    formData.append('location', location);
    
    if (file) {
      formData.append('profileImage', file);
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        // FormData küldésekor TILOS a Content-Type fejléc beállítása!
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert("Sikeres regisztráció! Most már bejelentkezhetsz.");
        navigate('/login');
      } else {
        alert(data.error || "Hiba a regisztráció során!");
      }
    } catch (error) {
      console.error(error);
      alert("Szerver hiba történt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: 'white' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px' }}>Csatlakozz</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Kötelező mezők */}
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Felhasználónév *</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'white' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email cím *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'white' }} />
          </div>

          {/* Opcionális Profil Adatok */}
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Teljes Név (Opcionális)</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Pl: Kovács Anna" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'white' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Rövid Bemutatkozás (Opcionális)</label>
            <input type="text" value={bio} onChange={e => setBio(e.target.value)} placeholder="Írj magadról pár sort..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'white' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Helyszín (Opcionális)</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Pl: Budapest, Magyarország" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'white' }} />
          </div>

          {/* Gyönyörű Profilkép Feltöltő */}
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Profilkép (Opcionális)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FaUserCircle style={{ fontSize: '30px', color: 'var(--text-secondary)' }} />
                )}
              </div>
              <label style={{ color: '#00d2ff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <FaCloudUploadAlt /> Kép kiválasztása
                <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {/* Jelszavak */}
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Jelszó *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'white' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Jelszó megerősítése *</label>
            <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'white' }} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#00d2ff', color: 'black', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
            {loading ? 'Regisztráció...' : 'Regisztráció'}
          </button>

        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Már van fiókod? <Link to="/login" style={{ color: '#00d2ff', textDecoration: 'none', fontWeight: 'bold' }}>Jelentkezz be!</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;