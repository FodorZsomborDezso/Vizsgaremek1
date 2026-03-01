import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Gallery from './pages/Gallery/Gallery'; // <--- ÚJ
import Chat from './pages/Chat/Chat';
import Upload from './pages/Upload/Upload';   // <--- ÚJ
import Ideas from './pages/Ideas/Ideas'; // <--- ÚJ IMPORT
import Admin from './pages/Admin/Admin';
import PublicProfile from './pages/Profile/PublicProfile'; // Tedd be felülre


// Importáljuk a többi oldalt is (LÉTEZNIE KELL A FÁJLNAK!)
import Login from './pages/RegisterAndLogin/Login';
import Register from './pages/RegisterAndLogin/Register';
import Profile from './pages/Profile/Profile';

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
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/upload" element={<Upload />} />   {/* <--- ÚJ */}
          <Route path="/ideas" element={<Ideas />} /> {/* <--- ÚJ ÚTVONAL */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/user/:username" element={<PublicProfile />} />
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