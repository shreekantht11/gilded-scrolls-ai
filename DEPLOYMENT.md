# 🚀 Gilded Scrolls - Complete Deployment Guide

## Overview
This guide covers deploying both the **React frontend** (via Lovable/Vercel) and the **Express backend** (via Railway/Render/Heroku).

---

## 🎨 Frontend Deployment (Already Handled by Lovable)

The React frontend is automatically deployed through Lovable. Just click the **Publish** button in the top right.

**Custom Domain Setup:**
1. Go to Project Settings → Domains
2. Add your custom domain (requires paid plan)
3. Update DNS records as instructed

---

## ⚙️ Backend Deployment

### Prerequisites
- MongoDB Atlas account (free tier available)
- OpenAI API key
- Backend hosting platform account (Railway/Render/Heroku)

---

## 📊 Step 1: Set Up MongoDB Atlas

1. **Create Account:**
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose **FREE Shared Cluster**
   - Select region closest to your users
   - Cluster name: `gilded-scrolls`

3. **Create Database User:**
   - Database Access → Add New Database User
   - Username: `gildedscrolls`
   - Password: Generate secure password (save it!)
   - Database User Privileges: **Read and write to any database**

4. **Configure Network Access:**
   - Network Access → Add IP Address
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production, restrict to your server IPs

5. **Get Connection String:**
   - Clusters → Connect → Connect your application
   - Copy connection string:
   ```
   mongodb+srv://gildedscrolls:<password>@cluster.mongodb.net/gilded-scrolls?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password

---

## 🚂 Option 1: Deploy to Railway (Recommended)

### Why Railway?
- Free tier available ($5 credit/month)
- Automatic deployments from GitHub
- Built-in environment variables
- Easy to use

### Steps:

1. **Push Code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/gilded-scrolls.git
git push -u origin main
```

2. **Create Railway Account:**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

3. **Deploy Project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your `gilded-scrolls` repository
   - Railway auto-detects Node.js app

4. **Configure Environment Variables:**
   - Click your service → Variables tab
   - Add variables:
   ```
   MONGODB_URI=mongodb+srv://gildedscrolls:YOUR_PASSWORD@cluster.mongodb.net/gilded-scrolls
   OPENAI_API_KEY=sk-your-openai-key-here
   NODE_ENV=production
   FRONTEND_URL=https://your-lovable-app.lovable.app
   PORT=8000
   ```

5. **Configure Build Settings:**
   - Settings → Root Directory: `/backend`
   - Start Command: `npm start`
   - Build Command: `npm install`

6. **Deploy:**
   - Railway automatically deploys
   - Get your backend URL: `https://your-project.railway.app`

7. **Update Frontend:**
   - In Lovable, update `.env` or hardcode API URL:
   ```typescript
   const API_BASE_URL = 'https://your-project.railway.app';
   ```

---

## 🎨 Option 2: Deploy to Render

### Why Render?
- Free tier available
- Easy setup
- Auto-deploys from Git

### Steps:

1. **Create Render Account:**
   - Visit [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service:**
   - Dashboard → **New** → **Web Service**
   - Connect GitHub repository
   - Select `gilded-scrolls` repo

3. **Configure Service:**
   ```
   Name: gilded-scrolls-api
   Region: Choose closest
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Add Environment Variables:**
   - Scroll to Environment section
   - Add:
   ```
   MONGODB_URI=mongodb+srv://...
   OPENAI_API_KEY=sk-...
   NODE_ENV=production
   FRONTEND_URL=https://your-app.lovable.app
   PORT=8000
   ```

5. **Choose Plan:**
   - Select **Free tier**
   - Click **"Create Web Service"**

6. **Get Backend URL:**
   - Copy URL: `https://gilded-scrolls-api.onrender.com`

---

## 🟣 Option 3: Deploy to Heroku

### Why Heroku?
- Established platform
- Easy CLI deployment
- Good for production

### Steps:

1. **Install Heroku CLI:**
```bash
brew install heroku/brew/heroku  # macOS
# or download from heroku.com/cli
```

2. **Login to Heroku:**
```bash
heroku login
```

3. **Create Heroku App:**
```bash
cd backend
heroku create gilded-scrolls-api
```

4. **Set Environment Variables:**
```bash
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set OPENAI_API_KEY="sk-..."
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL="https://your-app.lovable.app"
```

5. **Create Procfile:**
```bash
echo "web: node server.js" > Procfile
```

6. **Deploy:**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

7. **Open App:**
```bash
heroku open
```

---

## 🔗 Step 2: Connect Frontend to Backend

### Update API URL in Frontend

In your Lovable project, update `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.railway.app';
```

Or create `.env` in Lovable:
```
VITE_API_URL=https://your-backend-url.railway.app
```

### Enable CORS in Backend

Make sure your backend `.env` has correct frontend URL:
```
FRONTEND_URL=https://your-app.lovable.app
```

---

## ✅ Step 3: Test Your Deployment

### 1. Test Backend Health:
```bash
curl https://your-backend-url/health
```

Expected response:
```json
{"status":"ok","message":"Gilded Scrolls API is running"}
```

### 2. Test Story Generation:
```bash
curl -X POST https://your-backend-url/api/story/generate \
  -H "Content-Type: application/json" \
  -d '{"player":{"name":"Test","class":"Warrior","gender":"male","level":1,"health":100,"maxHealth":100,"gold":0,"stats":{"strength":10}},"genre":"fantasy","previousEvents":[],"choice":"begin"}'
```

### 3. Test Frontend:
- Open your Lovable app
- Create a character
- Start an adventure
- Check browser console for API errors

---

## 🔍 Monitoring & Debugging

### View Backend Logs:

**Railway:**
```
Dashboard → Your Service → Logs tab
```

**Render:**
```
Dashboard → Your Service → Logs
```

**Heroku:**
```bash
heroku logs --tail
```

### Common Issues:

**CORS Errors:**
```
Solution: Verify FRONTEND_URL in backend .env matches your Lovable domain
```

**MongoDB Connection Failed:**
```
Solution: Check connection string, verify IP whitelist (0.0.0.0/0)
```

**OpenAI API Errors:**
```
Solution: Verify API key, check billing/quota at platform.openai.com
```

**500 Errors:**
```
Solution: Check backend logs for stack traces
```

---

## 💰 Cost Breakdown

### Free Tier Limits:

**MongoDB Atlas:** 512 MB storage (sufficient for testing)

**Railway:** $5 credit/month (~500 hours)

**Render:** 750 hours/month (sleeps after inactivity)

**Heroku:** 550-1000 dyno hours/month

**OpenAI:** Pay-per-use (~$0.002 per story generation with gpt-4o-mini)

**Lovable:** Free tier available, paid plans for custom domains

### Estimated Monthly Cost (Low Traffic):
- MongoDB: Free
- Backend Hosting: Free (Railway/Render/Heroku free tier)
- OpenAI: $5-20 (depending on usage)
- Lovable: Free or $20/month for Pro
- **Total: $5-40/month**

---

## 🔐 Security Checklist

- [ ] Never commit `.env` files
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting (already configured)
- [ ] Restrict MongoDB IP whitelist in production
- [ ] Use HTTPS only
- [ ] Validate all user inputs (already implemented)
- [ ] Set up error monitoring (Sentry/LogRocket)

---

## 🚀 Production Optimization

### Backend:
1. **Enable caching** for repeated AI requests
2. **Add Redis** for session management
3. **Use PM2** for process management
4. **Set up monitoring** (New Relic, Datadog)

### Frontend:
1. **Enable Lovable CDN** (automatic)
2. **Lazy load components** (already implemented)
3. **Add service worker** for offline support
4. **Optimize images** with WebP format

---

## 📞 Support

**Backend Issues:**
- Check logs first
- Verify environment variables
- Test API endpoints with curl/Postman

**Frontend Issues:**
- Use browser DevTools console
- Check Network tab for failed API calls
- Verify API_BASE_URL is correct

**Need Help?**
- MongoDB: docs.mongodb.com/atlas
- Railway: docs.railway.app
- OpenAI: platform.openai.com/docs
- Lovable: docs.lovable.dev

---

## 🎉 You're Live!

Your AI Dungeon Master is now deployed and ready for players! 

Share your game URL and start your adventure! 🎮✨
