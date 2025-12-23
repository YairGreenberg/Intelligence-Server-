import express from 'express';
const router = express.Router();
import { readDataFromFile, writeDataToFile } from '../utils/fileHandler.js';
import authMiddleware from '../middleware/auth.js';

const USERS_PATH = './data/users.json';

router.use(authMiddleware);

router.get('/', async (req, res) => {
    const users = await readDataFromFile(USERS_PATH);
    // נחזיר את המשתמשים ללא הסיסמאות (שיקול אבטחה בסיסי)
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const users = await readDataFromFile(USERS_PATH);

    // בדיקת ייחודיות שם המשתמש (Conflict)
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ error: "Username already exists" });
    }

    users.push({ username, password });
    await writeDataToFile(USERS_PATH, users);

    res.status(201).json({ message: "User created successfully", username });
});

router.delete('/:username', async (req, res) => {
    const { username } = req.params;
    
    let users = await readDataFromFile(USERS_PATH);
    const originalLength = users.length;
    
    users = users.filter(u => u.username !== username);

    if (users.length === originalLength) {
        return res.status(404).json({ error: "User not found" });
    }

    await writeDataToFile(USERS_PATH, users);
    res.json({ message: `User ${username} deleted` });
});

export default router;