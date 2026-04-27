import { createServer } from 'node:http';
import 'dotenv/config';
import { createApplication } from './app/server.js';
import { startNightlyJob } from './jobs/nightlyUpdate.js';
const port = process.env.PORT || 8080;

async function main() {
    try {
        const server = createServer(createApplication());
        server.listen(port, async () => {
            console.log(`Server running on port ${port}`);
            await startNightlyJob();
        })
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();