# 🎓 Classroom Chat Center - Quick Reference

## 📊 Build Status

✅ **Server Build**: Success  
✅ **Client Build**: Success  
✅ **Vercel Analytics**: Enabled

---

## 🔗 URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://forsyth-chats.vercel.app/ |
| **Backend** | https://forsyth-chats.onrender.com/ |
| **API Health** | https://forsyth-chats.onrender.com/api/health |
| **Database** | MongoDB Atlas (forsythcountychat) |

---

## 🔧 Environment Variables

### Server (Render)
```env
MONGO_URI=mongodb+srv://blakeflyz1_db_user:ErX0cMjAItvvq4rx@forsythcountychat.0rcvols.mongodb.net/?appName=ForsythCountyChat
PORT=4000
CLIENT_URL=https://forsyth-chats.vercel.app
NODE_ENV=production
```

### Client (Vercel)
```env
NEXT_PUBLIC_SOCKET_URL=https://forsyth-chats.onrender.com
NEXT_PUBLIC_API_URL=https://forsyth-chats.onrender.com
```

---

## 📦 Tech Stack

### Backend
- Node.js 20+
- Express.js
- Socket.io 4+
- MongoDB with Mongoose
- TypeScript

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand (state)
- Socket.io-client

---

## 🚀 Local Development

```bash
# Server
cd server
npm install
npm run dev    # Runs on :4000

# Client (new terminal)
cd client
npm install
npm run dev    # Runs on :3000
```

**Note**: Update `.env` files with local MongoDB for development

---

## 📱 Features

✅ Real-time messaging  
✅ Participant presence tracking  
✅ Typing indicators  
✅ Mobile responsive  
✅ No accounts required  
✅ Secure 10-char room codes  
✅ Auto-delete rooms after 24hrs  
✅ XSS protection  
✅ Analytics tracking  

---

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/create-room` | Create new room |
| GET | `/api/room/:code` | Check if room exists |
| GET | `/api/health` | Health check |

---

## 🔌 Socket.io Events

### Client → Server
- `join-room` - Join a room
- `send-message` - Send a message
- `typing` - User is typing
- `stop-typing` - User stopped typing

### Server → Client
- `chat-history` - Initial message history
- `new-message` - New message received
- `participants-update` - Participant list updated
- `user-joined` - Someone joined
- `user-left` - Someone left
- `user-typing` - Typing indicator
- `error` - Error occurred

---

## 📂 Project Structure

```
forsyth-chats/
├── server/           # Express + Socket.io backend
│   ├── src/
│   │   ├── index.ts
│   │   ├── models/
│   │   ├── routes/
│   │   └── sockets/
│   └── package.json
│
├── client/           # Next.js frontend
│   ├── app/
│   │   ├── page.tsx
│   │   ├── create/
│   │   ├── join/
│   │   └── chat/
│   ├── components/
│   └── lib/
│
├── README.md
├── DEPLOYMENT.md
└── QUICKREF.md (this file)
```

---

## 🐛 Common Issues

### "Room not found"
- Backend might be down
- Check: https://forsyth-chats.onrender.com/api/health

### Messages not sending
- Check Socket.io connection in browser console
- Verify backend WebSocket is working

### CORS errors
- Ensure CLIENT_URL in backend matches frontend URL exactly
- No trailing slash

---

## 📞 Support

For issues, check:
1. Browser console for frontend errors
2. Render logs for backend errors
3. MongoDB Atlas for database issues

---

## 🎉 Quick Test

1. Visit: https://forsyth-chats.vercel.app/
2. Click "Create a New Classroom"
3. Copy the room code
4. Open incognito window
5. Join with the code
6. Send messages between windows

Should work perfectly! ✨
