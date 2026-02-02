# 🎓 Classroom Chat Center

A real-time classroom chat application that allows teachers and students to create or join password-less "classrooms" using unique room codes. Built with simplicity, privacy, and respectful communication in mind.

![Classroom Chat Center](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Classroom+Chat+Center)

## ✨ Features

- 🚀 **No Account Required** - Start chatting instantly with just a name
- 🔐 **Secure Room Codes** - 10-character unique codes for privacy
- 💬 **Real-time Messaging** - Instant bidirectional communication
- 👥 **Live Presence** - See who's in the room in real-time
- 📱 **Mobile-Friendly** - Responsive design for all devices
- 🎨 **Modern UI** - Clean interface with shadcn/ui components
- ⚡ **Fast & Lightweight** - Optimized for performance

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v3+**
- **shadcn/ui** components
- **Socket.io-client** for real-time communication
- **Zustand** for state management
- **Zod** for validation

### Backend
- **Node.js 20+**
- **Express.js**
- **Socket.io 4+**
- **MongoDB** with Mongoose
- **nanoid** for secure room codes
- **Helmet** for security headers
- **CORS** for cross-origin requests

## 📁 Project Structure

```
classroom-chat-center/
├── client/                  # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Home / landing page
│   │   ├── create/
│   │   │   └── page.tsx     # Create room flow
│   │   ├── join/
│   │   │   └── page.tsx     # Join room by code
│   │   └── chat/
│   │       └── [code]/
│   │           └── page.tsx # Main chat interface
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities & helpers
│   └── public/
├── server/                  # Express + Socket.io backend
│   ├── src/
│   │   ├── index.ts         # Server entry point
│   │   ├── routes/          # REST API routes
│   │   ├── sockets/         # Socket.io handlers
│   │   ├── models/          # MongoDB models
│   │   └── config/          # Database config
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd forsyth-chats
   ```

2. **Set up the server**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Edit `server/.env` and add your MongoDB connection string:
   ```env
   MONGO_URI=mongodb://localhost:27017/classroom-chat
   PORT=4000
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

   Install dependencies:
   ```bash
   npm install
   ```

3. **Set up the client**
   ```bash
   cd ../client
   cp .env.example .env.local
   ```
   
   Edit `client/.env.local`:
   ```env
   NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

   Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

1. **Start the server** (in the `server` directory):
   ```bash
   npm run dev
   ```
   The server will start on http://localhost:4000

2. **Start the client** (in the `client` directory, in a new terminal):
   ```bash
   npm run dev
   ```
   The app will open on http://localhost:3000

3. **Optional: Run both simultaneously**
   
   Install concurrently at the root:
   ```bash
   npm install -g concurrently
   ```
   
   Then from the root directory:
   ```bash
   concurrently "cd server && npm run dev" "cd client && npm run dev"
   ```

## 📖 Usage Guide

### Creating a Classroom

1. Click **"Create a New Classroom"** on the home page
2. A unique 10-character room code will be generated
3. Copy the code and share it with your students
4. Enter your name and agree to the respectful communication policy
5. Start chatting!

### Joining a Classroom

1. Click **"Join an Existing Classroom"** on the home page
2. Enter the room code provided by your teacher
3. Enter your name and agree to the respectful communication policy
4. Join the conversation!

### Chat Features

- **Send messages**: Type in the input box and press Enter (or click Send)
- **New lines**: Press Shift+Enter for multi-line messages
- **See participants**: View all active participants in the sidebar
- **Message history**: Scroll up to see previous messages
- **Auto-scroll**: New messages automatically scroll into view

## 🔒 Security & Privacy

- **No accounts or personal data** - Only your chosen display name is stored
- **Secure room codes** - 36^10 possible combinations make rooms virtually unguessable
- **XSS protection** - All user input is sanitized
- **CORS protection** - Only authorized origins can connect
- **Security headers** - Helmet.js provides additional protection
- **Ephemeral by design** - Messages are tied to room sessions

## 🌐 Deployment

### Quick Deploy

**Production URLs:**
- 🌐 Frontend: https://forsyth-chats.vercel.app/
- 🔧 Backend: https://forsyth-chats.onrender.com/
- 💾 Database: MongoDB Atlas

**See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.**

### Frontend (Vercel - Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the root directory to `client`
4. Add environment variables:
   - `NEXT_PUBLIC_SOCKET_URL` - Your deployed backend URL
   - `NEXT_PUBLIC_API_URL` - Your deployed backend URL
5. Deploy!

### Backend (Render, Railway, or Fly.io)

**Render (Free Tier):**
1. Create a new Web Service
2. Connect your repository
3. Set root directory to `server`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `CLIENT_URL` - Your Vercel frontend URL
   - `PORT` - 4000 (or leave default)
   - `NODE_ENV` - production

**MongoDB Atlas:**
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your server IP (or 0.0.0.0/0 for development)
4. Get your connection string and add it to your backend environment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Real-time communication powered by [Socket.io](https://socket.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ for better classroom communication**
Forsyth County Schools Chat Room
