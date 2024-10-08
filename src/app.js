import express from 'express';
import cors from 'cors';

import v1 from './routes/v1/index.js';
import { responses } from './middlewares/index.js';
import Cache from './config/cache.js';
import CONSTANTS from './config/constants.js';

await Cache.connect();
const app = express();
const PORT = CONSTANTS.SERVER_PORT || 3030;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use(responses);
app.get('/', (req, res) => res.send('PAJ API server!'));
app.use('/api/v1', v1);

app.listen(PORT, () => {
    console.log(`server started in http://localhost:${PORT}`)
});