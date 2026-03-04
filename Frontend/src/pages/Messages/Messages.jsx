import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaUserCircle, FaEnvelope, FaChevronLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Messages.css';

const Messages = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const chatContainerRef = useRef(null);
  const loggedInUserStr = localStorage.getItem('user');
  const myUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;

  // 1. ISMERŐSÖK BETÖLTÉSE (Bal oldali lista)
  useEffect(() => {
    if (!myUser) { navigate('/login'); return; }

    const fetchFriends = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:3000/api/friends', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setFriends(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchFriends();
  }, [navigate, myUser]);

  // 2. AKTÍV CHAT ÜZENETEINEK LETÖLTÉSE ÉS FRISSÍTÉSE (POLLING)
  useEffect(() => {
    if (!activeChatUser) return;

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:3000/api/messages/${activeChatUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setMessages(await res.json());
      } catch (err) { console.error(err); }
    };

    fetchMessages(); // Azonnali betöltés
    const interval = setInterval(fetchMessages, 3000); // 3 mp-enként frissít

    return () => clearInterval(interval); // Ha másik chatre kattint, leállítja a régit
  }, [activeChatUser]);

  // Görgessen le automatikusan
// Görgessen le automatikusan, de CSAK HA ÚJ ÜZENET JÖTT!
  useEffect(() => {
  if (chatContainerRef.current) {
    // Sima, stabil görgetés az ablak aljára
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }
  }, [messages.length]); // <-- A varázslat itt van: .length

  // 3. ÜZENET KÜLDÉSE
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUser) return;

    const token = localStorage.getItem('token');
    setIsSending(true);

    try {
      const res = await fetch(`http://localhost:3000/api/messages/${activeChatUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newMessage })
      });

      if (res.ok) {
        setNewMessage('');
        // Manuális gyors frissítés a küldés után
        const refreshRes = await fetch(`http://localhost:3000/api/messages/${activeChatUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (refreshRes.ok) setMessages(await refreshRes.json());
      } else {
        toast.error("Hiba a küldés során.");
      }
    } catch (err) { toast.error("Szerver hiba."); } 
    finally { setIsSending(false); }
  };

  if (!myUser) return null;

  return (
    <div className="messages-layout-container">
      <div className="messages-wrapper">
        
        {/* === BAL OLDAL: ISMERŐSÖK LISTÁJA === */}
        <div className={`messages-sidebar ${activeChatUser ? 'hidden-on-mobile' : ''}`}>
          <div className="sidebar-header">
            <h2><FaEnvelope style={{color: '#00d2ff', marginRight: '10px'}}/> Üzenetek</h2>
          </div>
          <div className="friends-list">
            {friends.length === 0 ? (
              <div className="empty-friends">Még nincsenek ismerőseid. Kövessetek be egymást valakivel a csevegéshez!</div>
            ) : (
              friends.map(friend => (
                <div 
                  key={friend.id} 
                  className={`friend-item ${activeChatUser?.id === friend.id ? 'active' : ''}`}
                  onClick={() => setActiveChatUser(friend)}
                >
                  {friend.avatar_url && friend.avatar_url.includes('http') ? (
                    <img src={friend.avatar_url} alt="avatar" className="friend-avatar" />
                  ) : (
                    <FaUserCircle className="friend-avatar-placeholder" />
                  )}
                  <div className="friend-info">
                    <span className="friend-name">{friend.full_name || friend.username}</span>
                    <span className="friend-username">@{friend.username}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* === JOBB OLDAL: AKTÍV CHAT === */}
        <div className={`messages-chat-area ${!activeChatUser ? 'hidden-on-mobile' : ''}`}>
          {!activeChatUser ? (
            <div className="no-chat-selected">
              <FaEnvelope className="no-chat-icon" />
              <h3>Válaszd ki, kivel szeretnél beszélgetni!</h3>
              <p>Bal oldalon láthatod az ismerőseidet (kölcsönös követés).</p>
            </div>
          ) : (
            <div className="active-chat-container">
              
              {/* Cset Fejléc */}
              <div className="chat-header">
                <button className="mobile-back-btn" onClick={() => setActiveChatUser(null)}>
                  <FaChevronLeft /> Vissza
                </button>
                <div className="chat-header-user">
                  {activeChatUser.avatar_url && activeChatUser.avatar_url.includes('http') ? (
                    <img src={activeChatUser.avatar_url} alt="avatar" className="chat-header-avatar" />
                  ) : (
                    <FaUserCircle className="chat-header-avatar-placeholder" />
                  )}
                  <div>
                    <h3 style={{margin: 0}}>{activeChatUser.full_name || activeChatUser.username}</h3>
                    <span style={{fontSize: '0.8rem', color: '#2ecc71', fontWeight: 'bold'}}>Ismerős</span>
                  </div>
                </div>
              </div>

              {/* Üzenetek */}
              <div className="chat-messages" ref={chatContainerRef}>
                {messages.length === 0 ? (
                  <div className="chat-empty-state">Még nem váltottatok üzenetet. Írj neki először! 👋</div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === myUser.id;
                    return (
                      <div key={msg.id} className={`chat-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                        {!isMine && (
                          <img src={msg.sender_avatar || 'https://ui-avatars.com/api/?name=User'} alt="avatar" className="chat-bubble-avatar" />
                        )}
                        <div className={`chat-bubble ${isMine ? 'my-bubble' : 'their-bubble'}`}>
                          <p>{msg.content}</p>
                          <span className="chat-timestamp">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Beviteli mező */}
              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Írj egy üzenetet..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <button type="submit" disabled={!newMessage.trim() || isSending}>
                  <FaPaperPlane />
                </button>
              </form>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Messages;