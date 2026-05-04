import dotenv from 'dotenv';
dotenv.config();

import { db } from '../db/index.js';
import { dailySnapshots, studentsTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

async function checkData() {
    console.log("Fetching some historical data...");
    
    // Fetch a few snapshots and their associated student names
    const data = await db
        .select({
            name: studentsTable.name,
            date: dailySnapshots.date,
            lcTotal: dailySnapshots.lcTotal,
            gfgTotal: dailySnapshots.gfgTotal
        })
        .from(dailySnapshots)
        .innerJoin(studentsTable, eq(dailySnapshots.studentId, studentsTable.id))
        .limit(10);
        
    console.log(`Found ${data.length} snapshots in the database.`);
    console.table(data);
    process.exit(0);
}

checkData();
