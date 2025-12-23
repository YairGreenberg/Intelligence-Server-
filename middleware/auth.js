import { readDataFromFile } from "../utils/fileHandler.js";
const USERS_PATH = './data/users.json';

export async function authenticateUser(req, res, next) {
    try {
        const username = req.headers['x-username'];
        const password = req.headers['x-password'];
        if (!username || !password) {
            return res.status(401).json({ error: "Unauthorized: Missing credentials" });
        }
        const users = await readDataFromFile(USERS_PATH);
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized: Invalid credentials" });
        }
        next();
    } catch (error) {
        console.error(`Authentication error: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }   
}