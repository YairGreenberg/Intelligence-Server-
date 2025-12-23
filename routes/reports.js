import express from 'express';
import { generateReport, getReportStatus } from '../utils/fileHandler.js';
import { authenticateUser } from '../middleware/auth.js';
import { read } from 'node:fs';
const router = express.Router();

const AGENTS_PATH = './data/agents.json';
const REPORTS_PATH = './data/reports.json';


router.post('/', authenticateUser, async (req, res) => {
    try {
        const { id, date, content, agentId} = req.body;
        const agents = await readDataFromFile(AGENTS_PATH);
        const reports = await readDataFromFile(REPORTS_PATH);
        const agentsIndex = agents.findIndex(agent => agent.id === agentId);
        if (agentsIndex === -1) {
            return res.status(400).json({ error: "Agent not found" });
        }
        if(reports.find(report => report.id === id)) {
            return res.status(409).json({ error: "Report with this ID already exists" });
        }
        reports.push({ id, date, content, agentId });
        agents[agentsIndex].reportsCount += 1;
        await writeDataToFile(REPORTS_PATH, reports);
        await writeDataToFile(AGENTS_PATH, agents);
        res.status(201).json({ message: "Report created successfully" });
    } catch (error) {
        console.error(`Error creating report: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const reportId = req.params.id; 
        let reports = await readDataFromFile(REPORTS_PATH);
        const agents = await readDataFromFile(AGENTS_PATH);
        const reportToDelete = reports.find(report => report.id === reportId);
        if (!reportToDelete) {
            return res.status(404).json({ error: "Report not found" });
        }
    const agentIndex = agents.findIndex(a => a.id === reportToDelete.agentId);
    if (agentIndex !== -1) {
        agents[agentIndex].reportsCount = Math.max(0, agents[agentIndex].reportsCount - 1);
    }

    reports = reports.filter(r => r.id !== reportId);

    await writeDataToFile(REPORTS_PATH, reports);
    await writeDataToFile(AGENTS_PATH, agents);

    res.json({ message: "Report deleted and agent count updated" });
    } catch (error) {
        console.error(`Error deleting report: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;