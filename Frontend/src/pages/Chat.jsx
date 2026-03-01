import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import './Chat.css';

const Chat = () => {
  const { userId } = useParams(); // A másik fél ID-ja
  const location = useLocation(); // A profilról átadott adatok (név, avatar)
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const chatEndRef = useRef(null); // Ez kell az automatikus legörgetéshez

  // A bejelentkezett felhasználó adatai
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  // A másik fél adatai (ha profilról jöttünk)
  const otherUsername = location.state?.username || "Felhasználó";
  const otherAvatar = location.state?.avatar;

  // Üzenetek betöltése
  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3000/api/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Hiba az üzenetek lekérésekor:", error);
    }
  };

  // 1. Amikor megnyílik az oldal, lekérjük, és utána 3 másodpercenként frissítjük!
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchMessages(); // Első azonnali lekérés
    const interval = setInterval(fetchMessages, 3000); // Folyamatos frissítés
    
    return () => clearInterval(interval); // Ha elhagyjuk az oldalt, leáll a frissítés
  }, [userId, currentUser, navigate]);

  // 2. Automatikus görgetés a legújabb üzenethez
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Üzenet küldése
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/messages/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (res.ok) {
        setNewMessage(''); // Input kiürítése
        fetchMessages(); // Azonnali frissítés, hogy lássuk a saját üzenetünket
      }
    } catch (error) {
      console.error("Hiba a küldéskor:", error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="chat-container">
      {/* FEJLÉC */}
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /></button>
        <div className="chat-partner-info">
          {otherAvatar ? (
            <img src={otherAvatar} alt="avatar" className="chat-avatar" />
          ) : (
            <FaUserCircle className="chat-avatar-placeholder" />
          )}
          <h3>@{otherUsername}</h3>
        </div>
      </div>

      {/* ÜZENETEK TERÜLETE */}
      <div className="chat-messages-area">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            Nincs még üzenetetek. Írj rá bátran! 👋
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id} className={`chat-bubble-wrapper ${isMe ? 'me' : 'other'}`}>
                <div className="chat-bubble">
                  {msg.content}
                  <span className="chat-time">
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {/* Egy láthatatlan elem a lista alján, amihez mindig odagörgetünk */}
        <div ref={chatEndRef} />
      </div>

      {/* ÍRÁS TERÜLET */}
      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <input 
          type="text" 
          placeholder="Üzenet írása..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" disabled={newMessage.trim() === ''}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default Chat;