const express = require('express');
const cors = require('cors');
require('dotenv').config();

const projectsRouter = require('./routes/projects');
const testCasesRouter = require('./routes/testCases');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api/projects/:pid/cases', testCasesRouter);
// Senaryo detayı için project-agnostic route
app.use('/api/cases', require('./routes/testCases'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server ${PORT} portunda calisiyor`));
