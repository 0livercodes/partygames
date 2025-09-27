# Render.com Deployment Guide

## 🚀 Deploy Ti-Albert Werewolf Game to Render.com

### Step 1: Deploy Backend (Web Service)
1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository: `https://github.com/0livercodes/partygames`
4. Configure:
   - **Name**: `ti-albert-backend`
   - **Region**: US East (or closest to users)
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Environment Variables** (optional):
   - `NODE_ENV`: `production`

### Step 2: Deploy Frontend (Static Site)
1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `ti-albert-frontend`
   - **Branch**: `master`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`

4. **Environment Variables**:
   - `REACT_APP_BACKEND_URL`: `https://ti-albert-backend.onrender.com`
   
   ⚠️ **Important**: Replace `ti-albert-backend` with your actual backend service name from Step 1

### Step 3: Update Backend URL
After your backend deploys, copy its URL and update the frontend environment variable:
- Go to your frontend service settings
- Update `REACT_APP_BACKEND_URL` to your backend's actual URL
- Redeploy the frontend

### 🌐 Your App Will Be Live At:
- **Frontend**: `https://ti-albert-frontend.onrender.com`
- **Backend API**: `https://ti-albert-backend.onrender.com`

### 📱 Features:
- ✅ Full-stack deployment
- ✅ Real-time WebSocket communication
- ✅ Responsive design for mobile/desktop
- ✅ QR code sharing for easy joining
- ✅ Modern UI with clean design
- ✅ Scalable for multiple games

### 🔧 Notes:
- Free tier services sleep after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up
- Consider upgrading to paid tier for production use