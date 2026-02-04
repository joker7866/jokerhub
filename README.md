# 🃏 JokerHub Platform (Anti-Gravity Edition)

![JokerHub Banner](https://via.placeholder.com/1200x400/000000/00f3ff?text=JOKER+HUB+|+ANTI-GRAVITY)

**JokerHub** is a next-generation web platform featuring a futuristic **Anti-Gravity UI**, real-time secure communications, and live market intelligence. Built for performance and aesthetics.

## 🚀 Key Features

### 🌌 Anti-Gravity Interface
- **3D Particle Constellation**: A background that reacts to your mouse movements, creating a floating network of nodes.
- **Glassmorphism Design**: Frosted glass cards, neon accents, and deep space aesthetics.
- **Responsive Animations**: Smooth transitions, hover effects, and mobile-optimized layouts.

### 📡 Global Intel (Real-Time)
- **Live Tech Radar**: Breaking news feed focused on **India Tech & Stock Market**.
- **Real-Time Ticker**: Live simulation of NSE/BSE stock prices (NIFTY 50, SENSEX, etc.) via WebSockets.
- **Interactive Charts**: Dynamic charts that update live without page reloads.

### 💬 Secure Comms (Chat)
- **Compact Mobile UI**: Optimized chat experience for mobile devices with smart toggling.
- **Encrypted Feel**: Premium "Encrypted transmission" aesthetics.
- **Socket.io Powered**: Instant messaging with online status indicators.

## 🛠️ Technology Stack
- **Frontend**: HTML5, CSS3 (Custom Variables), EJS Templates, Vanilla JS
- **Backend**: Node.js, Express.js
- **Real-Time**: Socket.io
- **Server**: Ubuntu Linux (Systemd Service)
- **Deployment**: Automated PowerShell Scripts

## 🔧 Installation & Setup

### Local Development
1. **Clone the repo**
   ```bash
   git clone https://github.com/joker7866/jokerhub.git
   cd jokerhub
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Run Dev Server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

### ☁️ Deployment (Ubuntu Server)
We use a custom PowerShell script for one-click deployment.

1. **Configure** `deploy.ps1` with your server IP and Username.
2. **Run Deployment**:
   ```powershell
   .\deploy.ps1
   ```
   This will zip the project, transfer it via SCP, install dependencies, and restart the service automatically.

## 📂 Project Structure
```
jokerhub/
├── public/
│   ├── css/           # Global Styles & Anti-Gravity themes
│   ├── js/            # Client-side logic (Particles, Chart.js)
├── server/
│   ├── controllers/   # Auth & Admin logic
│   ├── server.js      # Main Express App & Socket.io logic
├── views/             # EJS Templates (Pages)
├── deploy.ps1         # Automated Deployment Script
└── README.md          # Project Documentation
```

## 🛡️ License
Proprietary - JokerHub Systems.
