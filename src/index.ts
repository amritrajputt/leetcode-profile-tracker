import { createServer } from 'node:http';
import dotenv from 'dotenv';
dotenv.config();
import { createApplication } from './app/server.js';
const port = process.env.PORT || 4000;

async function main() {
    try {
        const server = createServer(createApplication());
        server.listen(port, async () => {
            console.log(`Server running on port ${port}`);
        })
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();