import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { jsPDF } from 'jspdf';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    socket.on('message', (message) => {
      setChat((prevChat) => [...prevChat, { role: 'ai', content: message }]);
    });
  }, []);

  const handleRegister = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/register`, { username, password });
      alert('Registration successful');
    } catch (error) {
      alert('Registration failed');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, { username, password });
      setToken(response.data.token);
      setCurrentUsername(response.data.username);
      setIsLoggedIn(true);
    } catch (error) {
      alert('Login failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    setIsLoggedIn(false);
    setCurrentUsername('');
    setChat([]);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setChat([...chat, userMessage]);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/chat`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMessage = { role: 'ai', content: response.data.reply };
      setChat([...chat, userMessage, aiMessage]);
      socket.emit('message', response.data.reply);
    } catch (error) {
      console.error(error);
    }

    setMessage('');
  };

  const exportChatAsPDF = () => {
    const doc = new jsPDF();
    doc.text('Chat History', 10, 10);
    chat.forEach((msg, index) => {
      doc.text(`${msg.role}: ${msg.content}`, 10, 20 + index * 10);
    });
    doc.save('chat_history.pdf');
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="auth">
          <h1 className="app-title">Chat Application</h1>
          <input
            type="text"
            className="input-field"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="auth-buttons">
            <button className="auth-button" onClick={handleRegister}>Register</button>
            <button className="auth-button" onClick={handleLogin}>Login</button>
          </div>
        </div>
      ) : (
        <div className="chat">
          <div className="header">
            <h2>Welcome, {currentUsername}!</h2>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
          <div className="chat-window">
            {chat.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              type="text"
              className="input-field"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
            />
            <button className="send-button" onClick={handleSendMessage}>Send</button>
          </div>
          <div className="export-buttons">
            <button className="export-button" onClick={exportChatAsPDF}>Download Chat as PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
