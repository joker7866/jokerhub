const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'));
}
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([]));
}

const getUsers = () => JSON.parse(fs.readFileSync(usersFile));
const saveUsers = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const users = getUsers();

        if (users.find(u => u.email === email)) {
            return res.render('register', { title: 'Register', page: 'auth', error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: Date.now().toString(), username, email, password: hashedPassword, role: 'user' };

        users.push(newUser);
        saveUsers(users);

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.redirect('/register');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = getUsers();
        const user = users.find(u => u.email === email);

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.userRole = user.role;
            req.session.userName = user.username;
            return res.redirect('/dashboard');
        }

        res.render('login', { title: 'Login', page: 'auth', error: 'Invalid credentials' });
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
