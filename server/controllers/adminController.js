const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFile = path.join(__dirname, '../data/users.json');

const getUsers = () => {
    if (!fs.existsSync(usersFile)) return [];
    return JSON.parse(fs.readFileSync(usersFile));
};

const saveUsers = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

exports.getDashboard = (req, res) => {
    const users = getUsers();
    res.render('admin', {
        title: 'Admin Command | JokerHub',
        users,
        user: res.locals.user,
        page: 'admin'
    });
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const users = getUsers();

        if (users.find(u => u.email === email)) {
            // In a real app we'd pass an error message to a flash message or back to the view
            return res.redirect('/admin?error=Email+already+exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        };

        users.push(newUser);
        saveUsers(users);

        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin?error=Server+Error');
    }
};

exports.deleteUser = (req, res) => {
    try {
        const { userId } = req.body;
        let users = getUsers();

        // Prevent deleting yourself
        if (userId === req.session.userId) {
            return res.redirect('/admin?error=Cannot+delete+yourself');
        }

        users = users.filter(u => u.id !== userId);
        saveUsers(users);

        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};
