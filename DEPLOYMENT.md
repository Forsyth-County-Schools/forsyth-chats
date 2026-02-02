# Deployment Guide - Classroom Chat Center

## ✅ Build Status

Both server and client build successfully!

- ✅ **Server**: TypeScript compiles without errors
- ✅ **Client**: Next.js builds successfully with all optimizations
- ✅ **Vercel Analytics**: Installed and configured

---

## 🌐 Production URLs

- **Frontend**: https://forsyth-chats.vercel.app/
- **Backend**: https://forsyth-chats.onrender.com/
- **MongoDB**: MongoDB Atlas (configured)

---

## 🚀 Deployment Steps

### Backend Deployment (Render)

1. **Push your code to GitHub** (if not already done)

2. **Option A: Deploy with render.yaml (Recommended)**
   - The `server/render.yaml` file is already configured
   - Go to https://render.com/dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository
   - Render will automatically detect `render.yaml` and configure everything
   - Add these secret environment variables in the dashboard:
     - `MONGO_URI`: Your MongoDB connection string
     - `CLIENT_URL`: `https://forsyth-chats.vercel.app`

2. **Option B: Manual Web Service Creation**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: forsyth-chats
     - **Region**: Choose closest to your users
     - **Branch**: main
     - **Root Directory**: `server`
     - **Runtime**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `node dist/index.js`

3. **Add Environment Variables** in Render dashboard:
   ```
   MONGO_URI=mongodb+srv://blakeflyz1_db_user:ErX0cMjAItvvq4rx@forsythcountychat.0rcvols.mongodb.net/?appName=ForsythCountyChat
   PORT=4000
   CLIENT_URL=https://forsyth-chats.vercel.app
   NODE_ENV=production
   ```

4. **Deploy**: Render will automatically deploy your backend

5. **Verify**: Visit https://forsyth-chats.onrender.com/api/health
   - You should see: `{"success":true,"message":"Server is running","timestamp":"..."}`

---

### Frontend Deployment (Vercel)

1. **Push your code to GitHub** (if not already done)

2. **Option A: Deploy with vercel.json (Recommended)**
   - The `client/vercel.json` file is already configured
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and the configuration
   - Set **Root Directory** to `client`
   - Add environment variables (see below)

2. **Option B: Manual Import**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: Leave default (.next)

3. **Add Environment Variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://forsyth-chats.onrender.com
   NEXT_PUBLIC_API_URL=https://forsyth-chats.onrender.com
   ```

4. **Deploy**: Vercel will automatically deploy your frontend

5. **Verify**: Visit https://forsyth-chats.vercel.app
   - You should see the home page with "Create" and "Join" options

---

## 🔍 Post-Deployment Checklist

### Test Backend
- [ ] Health check: https://forsyth-chats.onrender.com/api/health
- [ ] MongoDB connection is working (check Render logs)
- [ ] CORS is configured for your frontend URL

### Test Frontend
- [ ] Home page loads: https://forsyth-chats.vercel.app
- [ ] Can create a new classroom
- [ ] Room code is generated successfully
- [ ] Can copy room code to clipboard

### Test Full Flow
- [ ] Create a classroom
- [ ] Copy the room code
- [ ] Open in a new incognito window
- [ ] Join with the room code
- [ ] Send messages between both windows
- [ ] Messages appear in real-time
- [ ] Participant list updates
- [ ] Typing indicators work
- [ ] Connection status shows "Connected"

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Server won't start
- **Solution**: Check Render logs for errors
- Verify MongoDB URI is correct
- Ensure all dependencies are installed

**Problem**: CORS errors in browser console
- **Solution**: Update `CLIENT_URL` in Render environment variables
- Should match your Vercel deployment URL exactly

**Problem**: Database connection fails
- **Solution**: 
  - Check MongoDB Atlas whitelist (should allow 0.0.0.0/0 or Render's IPs)
  - Verify credentials in connection string
  - Check if database user has read/write permissions

### Frontend Issues

**Problem**: Can't connect to backend
- **Solution**: 
  - Verify `NEXT_PUBLIC_SOCKET_URL` and `NEXT_PUBLIC_API_URL` in Vercel
  - Check that backend is running (visit health endpoint)
  - Check browser console for detailed errors

**Problem**: "Room not found" errors
- **Solution**:
  - Backend might not be running
  - MongoDB might not be connected
  - Check Render backend logs

**Problem**: Messages not appearing in real-time
- **Solution**:
  - Socket.io connection might be failing
  - Check browser console for WebSocket errors
  - Verify backend Socket.io is running (check Render logs)

---

## 📊 Monitoring

### Vercel Analytics
- Analytics is already integrated via `@vercel/analytics`
- View analytics in Vercel dashboard after deployment

### Render Metrics
- View server metrics in Render dashboard
- Monitor CPU, memory, and request metrics

### MongoDB Atlas
- Monitor database metrics in Atlas dashboard
- View connection count, operations, and storage

---

## 🔧 Local Development

To run locally for testing:

### Server
```bash
cd server
npm install
# Create .env file with local MongoDB
echo "MONGO_URI=mongodb://localhost:27017/classroom-chat
PORT=4000
CLIENT_URL=http://localhost:3000
NODE_ENV=development" > .env
npm run dev
```

### Client
```bash
cd client
npm install
# Create .env.local file
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm run dev
```

---

## 🔒 Security Notes

1. **Environment Variables**: Never commit `.env` files to Git
2. **MongoDB**: Your credentials are exposed in this guide - consider rotating them
3. **CORS**: Only your frontend URL is allowed to connect
4. **Room Codes**: 10-character codes provide good security (36^10 combinations)
5. **TTL**: Rooms auto-delete after 24 hours

---

## 📝 Next Steps

1. **Update MongoDB Password**: Change the database password and update the connection string
2. **Add Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **Add Monitoring**: Set up error tracking with Sentry or similar
4. **Custom Domain**: Add a custom domain in Vercel settings
5. **SSL**: Both Vercel and Render provide SSL by default

---

## 🎉 You're Ready!

Your Classroom Chat Center is production-ready and deployed!

- Frontend: https://forsyth-chats.vercel.app/
- Backend: https://forsyth-chats.onrender.com/

Share the URL with your users and start chatting! 🚀
