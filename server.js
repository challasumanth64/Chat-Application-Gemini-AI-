// Backend: server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

// User Model
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

// Chat Model
const ChatSchema = new mongoose.Schema({
  user: String,
  message: String,
  response: String,
  timestamp: { type: Date, default: Date.now },
});
const Chat = mongoose.model('Chat', ChatSchema);

// Google Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  res.json({ message: 'Login successful', username: user.username });
});

app.post('/api/chat', async (req, res) => {
  const { username, message } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(message);
    const responseText = result.response.candidates[0].content.parts[0].text;
    const chat = new Chat({ user: username, message, response: responseText });
    await chat.save();
    res.json({ reply: responseText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Email Chat History
app.post('/api/email-chat', async (req, res) => {
  const { email, username } = req.body;
  try {
    const chatHistory = await Chat.find({ user: username }).sort({ timestamp: 1 });
    if (!chatHistory.length) {
      return res.status(400).json({ error: 'No chat history found.' });
    }
    let emailContent = "Your Chat History:\n\n";
    chatHistory.forEach(chat => {
      emailContent += `${chat.user}: ${chat.message}\nAI: ${chat.response}\n\n`;
    });
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Chat History',
      text: emailContent,
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Chat history emailed successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not send email.' });
  }
});

// WebSocket Server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});