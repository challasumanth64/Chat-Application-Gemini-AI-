# Chat-Application-Gemini-ai-

AI Chat Application (Gemini-Powered) 🚀
This AI-powered chat application is a real-time messaging platform that integrates Google Gemini AI to provide intelligent chatbot responses. Users can chat with AI, store conversations, export chat history as a PDF, and even email chat logs for later reference.

🌟 Features
✅ User Authentication – Register and log in securely.
✅ Real-time Chat – Powered by WebSockets for instant messaging.
✅ AI-Powered Responses – Uses Google Gemini AI to generate smart replies.
✅ Chat History Storage – Saves all conversations in MongoDB.
✅ Download Chat as PDF – Export chat history in one click.
✅ Email Chat History – Receive your chats via email using Nodemailer.
✅ Secure Environment Variables – .env file ensures API keys are protected.

🛠️ Tech Stack Used
Frontend (React)
React.js – Interactive UI
Axios – API calls
Socket.io-client – Real-time communication
jsPDF – PDF generation
CSS – Styled UI
Backend (Node.js + Express.js)
Express.js – Server framework
Google Gemini AI – AI-powered chatbot
MongoDB (Mongoose) – Database storage
Nodemailer – Email chat history
WebSockets (ws package) – Real-time messaging
Security & Deployment
Bcrypt.js – Password hashing
dotenv – Secures API keys
Git & GitHub – Version control
🚀 How It Works
1️⃣ User registers & logs in.
2️⃣ Sends messages to AI (powered by Gemini).
3️⃣ AI generates a response & stores it in MongoDB.
4️⃣ Users can download chat history as PDF or email it.
5️⃣ WebSockets ensure real-time chat updates.

bash
Copy
Edit
git clone https://github.com/your-username/AI-Chat-Application.git
cd AI-Chat-Application
2️⃣ Backend Setup

bash
Copy
Edit
cd backend
npm install
Create a .env file and add:
ini
Copy
Edit
MONGODB_URI=your-mongodb-uri
GEMINI_API_KEY=your-gemini-api-key
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
Start the backend server:
bash
Copy
Edit
node server.js
3️⃣ Frontend Setup

bash
Copy
Edit
cd frontend
npm install
npm start
Open http://localhost:3000/ in your browser.
