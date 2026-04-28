import cron from 'node-cron';
import { eq, and, inArray,desc } from "drizzle-orm";
import { db } from '../db/index.js';
import { studentsTable, dailySnapshots } from '../db/schema.js';
import { leetcodeScrapper, gfgScrapper } from '../utils/scrapper.js';

export function startNightlyJob() {
    // Run at 00:00 every day in IST timezone
    cron.schedule('0 0 * * *', async () => {
        console.log("Starting nightly student data update...");

        try {
            const students = await db.select().from(studentsTable);
            console.log(`Found ${students.length} students to process.`);

            // Get today's date in YYYY-MM-DD format
            
            const today = new Date().toISOString().split('T')[0] as string;


            for (const student of students) {
                console.log(`Processing student: ${student.name} (${student.rollNumber})`);
                
                let lcTotal = 0;
                let gfgTotal = 0;

                try {
                    if (student.leetcodeUserName) {
                        const lcResult = await leetcodeScrapper(student.leetcodeUserName);
                        lcTotal = lcResult.totalSolved || 0;
                    }

                    if (student.geeksforgeeksUserName) {
                        const gfgResult = await gfgScrapper(student.geeksforgeeksUserName);
                        gfgTotal = gfgResult.totalSolved || 0;
                    }

                    const todayDate = new Date();
                    const oneWeekAgo = new Date(todayDate); oneWeekAgo.setDate(todayDate.getDate() - 7);
                    const oneMonthAgo = new Date(todayDate); oneMonthAgo.setMonth(todayDate.getMonth() - 1);
                    const oneYearAgo = new Date(todayDate); oneYearAgo.setFullYear(todayDate.getFullYear() - 1);

                    const weekDateString = oneWeekAgo.toISOString().split('T')[0] as string;
                    const monthDateString = oneMonthAgo.toISOString().split('T')[0] as string;
                    const yearDateString = oneYearAgo.toISOString().split('T')[0] as string;

                    const pastSnapshots = await db.select().from(dailySnapshots).where(
                        and(
                            eq(dailySnapshots.studentId, student.id),
                            inArray(dailySnapshots.date, [weekDateString, monthDateString, yearDateString])
                        )
                    );

                    const weekSnapshot = pastSnapshots.find(s => s.date === weekDateString);
                    const monthSnapshot = pastSnapshots.find(s => s.date === monthDateString);
                    const yearSnapshot = pastSnapshots.find(s => s.date === yearDateString);

                    const lcWeekTotal = weekSnapshot ? lcTotal - weekSnapshot.lcTotal! : 0;
                    const lcMonthTotal = monthSnapshot ? lcTotal - monthSnapshot.lcTotal! : 0;
                    const lcYearTotal = yearSnapshot ? lcTotal - yearSnapshot.lcTotal! : 0;
                    const gfgWeekTotal = weekSnapshot ? gfgTotal - weekSnapshot.gfgTotal! : 0;
                    const gfgMonthTotal = monthSnapshot ? gfgTotal - monthSnapshot.gfgTotal! : 0;
                    const gfgYearTotal = yearSnapshot ? gfgTotal - yearSnapshot.gfgTotal! : 0;
                    

                    await db.insert(dailySnapshots).values({
                        studentId: student.id as string,
                        date: today,
                        lcTotal: lcTotal,
                        gfgTotal: gfgTotal,
                        lcWeekTotal: Math.max(0, lcWeekTotal), 
                        lcMonthTotal: Math.max(0, lcMonthTotal),
                        lcYearTotal: Math.max(0, lcYearTotal),
                        gfgWeekTotal: Math.max(0, gfgWeekTotal),
                        gfgMonthTotal: Math.max(0, gfgMonthTotal),
                        gfgYearTotal: Math.max(0, gfgYearTotal),
                    }).onConflictDoUpdate({
                        target: [dailySnapshots.studentId, dailySnapshots.date],
                        set: {
                            lcTotal: lcTotal,
                            gfgTotal: gfgTotal,
                            lcWeekTotal: Math.max(0, lcWeekTotal),
                            lcMonthTotal: Math.max(0, lcMonthTotal),
                            lcYearTotal: Math.max(0, lcYearTotal),
                            gfgWeekTotal: Math.max(0, gfgWeekTotal),
                            gfgMonthTotal: Math.max(0, gfgMonthTotal),
                            gfgYearTotal: Math.max(0, gfgYearTotal),
                        }
                    });


                    console.log(`Successfully updated ${student.rollNumber}`);

                } catch (err) {
                    // Crucial: Use try/catch inside the loop so one failed student doesn't crash the whole job
                    console.error(`Failed to process student ${student.rollNumber}:`, err);
                }

                // delay to prevent rate-limiting
                await new Promise(resolve => setTimeout(resolve, 2500));
            }

            console.log("Nightly update completed successfully.");

        } catch (error) {
            console.error("Critical error in nightly cron job:", error);
        }
    }, {
        timezone: "Asia/Kolkata"
    });

    console.log("Nightly job scheduled. It will run daily at midnight (IST).");
}
