const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFile = path.join(__dirname, 'server/data/users.json');

// Ensure directory exists
const dataDir = path.dirname(usersFile);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

async function seed() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = [
        {
            id: "1",
            username: "Commander",
            email: "admin@jokerhub.online",
            password: hashedPassword,
            role: "admin"
        }
    ];

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log('Admin user seeded: admin@jokerhub.online / admin123');
}

seed();
