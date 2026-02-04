const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const morgan = require('morgan');
const authController = require('./controllers/authController');

const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Security & Middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Config (reused for socket.io if needed later, but simple for now)
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'antigravity_secret_key_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
});
app.use(sessionMiddleware);

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// Middleware to check auth
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

app.use((req, res, next) => {
    res.locals.user = req.session.userId ? { id: req.session.userId, name: req.session.userName, role: req.session.userRole } : null;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'JokerHub | AntiGravity', page: 'home' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login | JokerHub', page: 'auth', error: null });
});

app.post('/login', authController.login);

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register | JokerHub', page: 'auth', error: null });
});

app.post('/register', authController.register);

app.get('/logout', authController.logout);

app.get('/intel', (req, res) => {
    res.render('intel', { title: 'Global Intel | JokerHub', page: 'intel' });
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { title: 'Dashboard | JokerHub', page: 'dashboard' });
});

const adminController = require('./controllers/adminController');

app.get('/chat', requireAuth, (req, res) => {
    res.render('chat', { title: 'Comms | JokerHub', page: 'chat', user: res.locals.user });
});

// Admin Middleware
const requireAdmin = (req, res, next) => {
    if (req.session.userId && req.session.userRole === 'admin') {
        return next();
    }
    // Simple 403 or redirect
    res.redirect('/dashboard');
};

// Admin Routes
app.get('/admin', requireAuth, requireAdmin, adminController.getDashboard);
app.post('/admin/users', requireAuth, requireAdmin, adminController.createUser);
app.post('/admin/users/delete', requireAuth, requireAdmin, adminController.deleteUser);


// 404
app.use((req, res) => {
    res.status(404).render('404', { title: '404 | Lost in Space' });
});

// Socket.io Logic
// Socket.io Middleware Wrapper
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

// Track online users: userId -> { socketId, username }
const onlineUsers = new Map();

io.on('connection', (socket) => {
    const session = socket.request.session;

    // Explicitly reload session to ensure we have latest data
    session.reload((err) => {
        if (err) {
            // console.log('Session reload error (ignorable if new session):', err);
        }

        if (session && session.userId) {
            const userId = session.userId;
            const username = session.userName;

            // Store user
            onlineUsers.set(userId, { socketId: socket.id, username });
            console.log(`User connected: ${username} (${userId})`);

            // Broadcast updated user list
            io.emit('userList', Array.from(onlineUsers.entries()).map(([id, data]) => ({ id, name: data.username })));

            // Join a private room for this user
            socket.join(userId);

            // Handle Private Message
            socket.on('privateMessage', ({ targetUserId, text }) => {
                if (!text) return;

                const msgData = {
                    fromId: userId,
                    fromName: username,
                    toId: targetUserId,
                    text: text,
                    time: new Date().toLocaleTimeString()
                };

                // Send to target
                io.to(targetUserId).emit('privateMessage', msgData);

                // Send back to sender (so they see it too)
                socket.emit('privateMessage', msgData);
            });

            // ... existing connection logic ...
            socket.on('disconnect', () => {
                onlineUsers.delete(userId);
                io.emit('userList', Array.from(onlineUsers.entries()).map(([id, data]) => ({ id, name: data.username })));
                console.log(`User disconnected: ${username}`);
            });
        } else {
            console.log('Unauthenticated connection. Session ID:', session ? session.id : 'none');
            socket.disconnect(true);
        }
    });
});

// --- Market Data Simulation Service ---
let marketStocks = [
    { sym: 'NIFTY 50', name: 'NSE Index', price: 21456.50, prevClose: 21300.00, type: 'index' },
    { sym: 'SENSEX', name: 'BSE Index', price: 71345.80, prevClose: 71000.00, type: 'index' },
    { sym: 'RELIANCE', name: 'Reliance Ind.', price: 2750.40, prevClose: 2740.00, type: 'stock' },
    { sym: 'TCS', name: 'Tata Consultancy', price: 3890.15, prevClose: 3910.00, type: 'stock' },
    { sym: 'HDFCBANK', name: 'HDFC Bank', price: 1680.50, prevClose: 1675.00, type: 'stock' },
    { sym: 'INFY', name: 'Infosys Ltd.', price: 1540.20, prevClose: 1550.00, type: 'stock' },
    { sym: 'TATAMOTORS', name: 'Tata Motors', price: 810.30, prevClose: 805.00, type: 'stock' }
];

// --- India Tech & Market News Simulation ---
let newsHeadlines = [
    { category: "Market", title: "Sensex crosses 72,000 mark amid IT rally", summary: "Indian benchmark indices hit all-time high led by TCS and Infosys buying, defying global trends." },
    { category: "Telecom", title: "Jio announces 6G testing in 4 metro cities", summary: "Reliance Jio aims to lead the next gen spectrum race with indigenous 6G tech stack by 2025." },
    { category: "Startup", title: "Zepto raises $100M, becomes first unicorn of 2026", summary: "Quick commerce giant doubles down on 10-minute delivery in Tier-2 cities." },
    { category: "Policy", title: "Govt approves new flexible battery policy for EVs", summary: "Ministry of Heavy Industries pushes for swappable batteries to boost electric scooter adoption." },
    { category: "Fintech", title: "UPI transactions hit record 15 Billion in January", summary: "NPCI confirms India's digital payment dominance continues with massive rural adoption." },
    { category: "Hardware", title: "Tata Electronics sends first iPhone batch to Apple", summary: "Made-in-India iPhones from the Hosur plant meet global quality standards." }
];

const freshNewsSource = [
    { category: "Crypto", title: "RBI expands e-Rupee pilot to offline payments", summary: "New feature allows digital transactions in villages with zero internet connectivity." },
    { category: "AI", title: "Ola Krutrim AI launches developer API", summary: "India's first AI unicorn opens its LLM for local developers to build distinct regional apps." },
    { category: "Space", title: "ISRO: Chandrayaan-4 sample return mission Approved", summary: "New mission aims to bring back lunar soil; launch scheduled for 2028." },
    { category: "Market", title: "HDFC Bank shares jump 4% on quarterly results", summary: "Banking giant beats street estimates with strong loan growth and reduced NPAs." },
    { category: "Auto", title: "Tata Motors reveals 'Curvv' EV final production model", summary: "The futuristic coupe-SUV promises 500km range and starts under ₹20 Lakhs." },
    { category: "IT", title: "Wipro wins massive $500M contract from US retailer", summary: "Tech major to overhaul digital infrastructure using generative AI platforms." },
    { category: "SemiCon", title: "Micron's Gujarat plant to start chip packaging soon", summary: "India's first major semiconductor assembly unit runs ahead of schedule." },
    { category: "Energy", title: "Adani Green commissions world's largest renewable park", summary: "Khavda renewable energy park in Gujarat begins supplying 1 GW to national grid." },
    { category: "CyberSec", title: "CERT-In issues high-severity warning for Chrome users", summary: "Government agency advises immediate update to fix critical zero-day vulnerability." },
    { category: "Gaming", title: "BGMI announces ₹2 Crore prize pool for India Series", summary: "Krafton doubles down on Indian eSports ecosystem with massive tournament." }
];

// Run market tick every 2 seconds
setInterval(() => {
    // 1. Randomize prices
    marketStocks = marketStocks.map(s => {
        const volatility = s.price * 0.0005; // 0.05% fluctuation per tick
        const change = (Math.random() * volatility * 2) - volatility;
        let newPrice = s.price + change;
        return { ...s, price: newPrice };
    });

    // 2. Broadcast to all clients
    io.emit('marketUpdate', {
        timestamp: new Date().toISOString(),
        stocks: marketStocks
    });
}, 2000);

// Run News Update every 8 seconds
setInterval(() => {
    // Rotate news: Move first to last, occasionally inject 'fresh' news
    const item = newsHeadlines.shift();

    // 20% chance to swap the item with a completely new one from source to simulate "Breaking News"
    if (Math.random() > 0.8) {
        const fresh = freshNewsSource[Math.floor(Math.random() * freshNewsSource.length)];
        // Modify title slightly to make it look unique if reused
        const uniqueTitle = fresh.title + (Math.random() > 0.5 ? " (Updated)" : "");
        newsHeadlines.push({ ...fresh, title: uniqueTitle });
    } else {
        newsHeadlines.push(item);
    }

    io.emit('newsUpdate', newsHeadlines);

}, 8000);

server.listen(PORT, () => {
    console.log(`🚀 JokerHub Control Center launched on http://localhost:${PORT}`);
});
