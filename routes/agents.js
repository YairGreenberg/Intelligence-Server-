import express from 'express';
import { readDataFromFile , writeDataToFile} from '../utils/fileHandler.js';
import { authenticateUser } from '../middleware/auth.js';
const router = express.Router();

const AGENTS_PATH = './data/agents.json';   
const REPORTS_PATH = './data/reports.json';

router.get('/', async (req, res) => {
    try {
        const agents = await readDataFromFile(AGENTS_PATH);
        res.json(agents);
    } catch (error) {
        console.error(`Error fetching agents: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }   
});

router.post('/', authenticateUser, async (req, res) => {
    try {
        const {id,name,nickname} = req.body;
        if (!id || !name || !nickname) {
            return  res.status(400).json({ error: "Bad Request: Missing required fields" });
        }
        const agents = await readDataFromFile(AGENTS_PATH);
        if (agents.find(agent => agent.id === id)) {
            return res.status(409).json({ error: "Conflict: Agent with this ID already exists" });
        }
        const newAgent = { id, name, nickname ,reportCount:0};
        agents.push(newAgent);
        await writeDataToFile(AGENTS_PATH, agents);
        res.status(201).json(newAgent);
    } catch (error) {
        console.error(`Error adding agent: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }   
});

router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const agentId = req.params.id;
        let agents = await readDataFromFile(AGENTS_PATH);
        let reports = await readDataFromFile(REPORTS_PATH);
        const hasReports = reports.some(report => report.agentId === agentId);
        if (hasReports) {
            return res.status(400).json({ error: "Bad Request: Cannot delete agent with associated reports" });
        }
        const updatedAgents = agents.filter(agent => agent.id !== agentId);
        if (updatedAgents.length === agents.length) {
            return res.status(404).json({ error: "Not Found: Agent does not exist" });
        }
        await writeDataToFile(AGENTS_PATH, updatedAgents);
        res.json({ message: "Agent deleted" });
    } catch (error) {
        console.error(`Error deleting agent: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }   
});
export default router;
