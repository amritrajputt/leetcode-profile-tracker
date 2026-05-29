import { createServer } from 'node:http';
import dotenv from 'dotenv';
dotenv.config();
import { createApplication } from './app/server.js';
import { startWeeklyEmailCron } from './jobs/weeklyEmail.js';
import { startNightlyUpdateCron } from './jobs/nightlyUpdate.js';
const port = process.env.PORT || 4000;

async function main() {
    try {
        const server = createServer(createApplication());
        
        // Start background cron jobs
        startWeeklyEmailCron();
        startNightlyUpdateCron();

        server.listen(port, async () => {
            console.log(`Server running on port ${port}`);
        })
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();