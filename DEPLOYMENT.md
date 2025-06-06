# 🚀 Deployment Guide - Video Subtitle Generator

## 📋 **Option 1: Vercel + Railway (Recommended)**

### **Cost**: ~$5-20/month
### **Difficulty**: Easy
### **Best for**: Production apps with moderate traffic

---

## 🎯 **Step 1: Deploy Backend to Railway**

### 1. **Create Railway Account**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Connect your GitHub account

### 2. **Deploy Backend**
```bash
# 1. Push your code to GitHub first
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/video-subtitle-generator.git
git push -u origin main
```

### 3. **Railway Setup**
- Click "New Project" → "Deploy from GitHub repo"
- Select your repository
- Choose the `backend` folder as root directory
- Railway will auto-detect Python and deploy

### 4. **Environment Variables on Railway**
Add these in Railway dashboard:
```
DEEPL_API_KEY=your_deepl_api_key
GOOGLE_TRANSLATE_API_KEY=your_google_api_key (optional)
```

### 5. **Get Backend URL**
- Railway will give you a URL like: `https://your-app-name.railway.app`
- Copy this URL for frontend deployment

---

## 🎯 **Step 2: Deploy Frontend to Vercel**

### 1. **Vercel Setup**
```bash
# Login to Vercel
vercel login

# Deploy from project root
vercel
```

### 2. **Follow Vercel Prompts**
```
? Set up and deploy "~/Desktop/vid"? [Y/n] y
? Which scope do you want to deploy to? Your Name
? Link to existing project? [y/N] n
? What's your project's name? video-subtitle-generator
? In which directory is your code located? ./
```

### 3. **Environment Variables on Vercel**
In Vercel dashboard, add:
```
BACKEND_URL=https://your-railway-app.railway.app
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

### 4. **Redeploy**
```bash
vercel --prod
```

---

## 📋 **Option 2: All-in-One Platforms**

### **A. Render (Free Tier Available)**

#### **Backend on Render**
1. Go to [render.com](https://render.com)
2. Connect GitHub
3. Create "Web Service"
4. Select your repo, choose `backend` folder
5. Settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`
   - **Environment**: Python 3.9

#### **Frontend on Render**
1. Create "Static Site"
2. Settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `out`

### **B. Heroku (Paid)**
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Backend
cd backend
heroku create your-app-backend
git subtree push --prefix backend heroku main

# Frontend  
cd ..
heroku create your-app-frontend
heroku buildpacks:set heroku/nodejs
git push heroku main
```

---

## 📋 **Option 3: Self-Hosted (Advanced)**

### **VPS Deployment (DigitalOcean, Linode, etc.)**

#### **1. Server Setup**
```bash
# Ubuntu 20.04+ server
sudo apt update
sudo apt install nginx python3 python3-pip nodejs npm ffmpeg

# Install PM2 for process management
npm install -g pm2
```

#### **2. Backend Setup**
```bash
cd /var/www/video-subtitle-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start with PM2
pm2 start main.py --name subtitle-backend --interpreter python3
```

#### **3. Frontend Setup**
```bash
cd /var/www/video-subtitle-frontend
npm install
npm run build
pm2 start npm --name subtitle-frontend -- start
```

#### **4. Nginx Configuration**
```nginx
# /etc/nginx/sites-available/subtitle-generator
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔧 **Environment Variables Needed**

### **Backend (.env)**
```
DEEPL_API_KEY=your_deepl_api_key
GOOGLE_TRANSLATE_API_KEY=your_google_api_key (optional)
```

### **Frontend (.env.local)**
```
BACKEND_URL=https://your-backend-url.com
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## 💰 **Cost Breakdown**

| Platform | Frontend | Backend | Total/Month |
|----------|----------|---------|-------------|
| **Vercel + Railway** | Free | $5-20 | $5-20 |
| **Render** | Free | $7-25 | $7-25 |
| **Heroku** | $7 | $7 | $14 |
| **VPS (DigitalOcean)** | - | $5-10 | $5-10 |

---

## 🚀 **Quick Start (Recommended)**

1. **Push to GitHub**
2. **Deploy Backend to Railway** (5 minutes)
3. **Deploy Frontend to Vercel** (5 minutes)
4. **Add Environment Variables**
5. **Test Your Live App!**

Your app will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`

---

## 🔍 **Troubleshooting**

### **Common Issues:**
1. **CORS Errors**: Add your frontend domain to backend CORS settings
2. **API Not Found**: Check environment variables are set correctly
3. **Build Failures**: Ensure all dependencies are in package.json/requirements.txt
4. **Memory Issues**: Upgrade to paid tier if using large AI models

### **Monitoring:**
- **Railway**: Built-in logs and metrics
- **Vercel**: Analytics dashboard
- **Uptime**: Use UptimeRobot for monitoring

---

## 📞 **Support**

If you need help with deployment:
1. Check platform documentation
2. Review error logs in platform dashboards
3. Test locally first to ensure everything works 