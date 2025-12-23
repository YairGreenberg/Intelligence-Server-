import express from 'express';
import agentsRouter from './routes/agents.js';
import reportsRouter from './routes/reports.js';

const app = express();
app.use(express.json());

app.use('/agents', agentsRouter);
app.use('/reports', reportsRouter);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});