import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery'; // <--- ÚJ
import Upload from './pages/Upload';   // <--- ÚJ
import Ideas from './pages/Ideas'; // <--- ÚJ IMPORT

// Importáljuk a többi oldalt is (LÉTEZNIE KELL A FÁJLNAK!)
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

import './App.css';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-container">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} /> {/* <--- ÚJ */}
          <Route path="/upload" element={<Upload />} />   {/* <--- ÚJ */}
          <Route path="/ideas" element={<Ideas />} /> {/* <--- ÚJ ÚTVONAL */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<h1>404</h1>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;