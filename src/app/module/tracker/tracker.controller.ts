import type { Request, Response } from "express";
import { AddStudentDto } from "./dto/addStudent.dto.js";
import { ApiError } from "../../common/errors/error.js";
import { db } from "../../../db/index.js";
import { studentsTable, dailySnapshots } from "../../../db/schema.js";
import { eq, desc, sql, and } from "drizzle-orm";
import ExcelJS from "exceljs";
import { ApiResponse } from "../../common/response/response.js";
import { leetcodeScrapper, gfgScrapper } from "../../../utils/scrapper.js";
import { runDataSync } from "../../../jobs/nightlyUpdate.js";
import NodeCache from "node-cache";

// Initialize in-memory cache with 5 minutes TTL (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

export class trackController {
    public async triggerUpdate(req: Request, res: Response) {
        // We secure this endpoint with a simple secret key in headers
        const cronSecret = req.headers['x-cron-secret'];
        const envSecret = process.env.CRON_SECRET || "default_super_secret_key";
        
        if (cronSecret !== envSecret) {
            throw ApiError.unAuthorized("Invalid or missing cron secret key");
        }

        // Run the sync asynchronously in the background so Render doesn't timeout the HTTP connection.
        // This is important because 100 students taking 2.5s each = 250s, which exceeds most timeout limits.
        runDataSync().catch(err => console.error("Error in async background sync:", err));

        // Immediately respond 202 Accepted to the cron service
        res.status(202).json(ApiResponse.success("Sync process started in the background", 202, null));
    }
    public async addStudent(req: Request, res: Response) {
        const { name, rollNumber, batchYear, email, course, branch, section, leetcodeUserName, geeksforgeeksUserName } = req.body;

        const isExist = await db.select().from(studentsTable).where(eq(studentsTable.rollNumber, rollNumber));
        if (isExist.length > 0) {
            throw ApiError.badRequest("Student already exists");
        }

        const student = await db.insert(studentsTable).values({
            name,
            rollNumber,
            batchYear,
            email,
            course,
            branch,
            section,
            leetcodeUserName,
            geeksforgeeksUserName,
        }).returning({
            name: studentsTable.name,
            rollNumber: studentsTable.rollNumber,
        });

        // Clear cache so the new student appears on the leaderboard instantly
        cache.flushAll();

        res.status(201).json(ApiResponse.created("Student added successfully", student[0]));
    }
    public async leaderBoard(req: Request, res: Response) {
        const { batch } = req.query;
        const cacheKey = `leaderboard_${batch || 'all'}`;

        // 1. Check Cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(ApiResponse.success("Leaderboard fetched successfully", 200, cachedData));
        }

        //latest snapshot date for each student
        const latestSnapshots = db
            .select({
                studentId: dailySnapshots.studentId,
                maxDate: sql<string>`MAX(${dailySnapshots.date})`.as("max_date")
            })
            .from(dailySnapshots)
            .groupBy(dailySnapshots.studentId)
            .as("latest_snapshots");

        // Fetch all students, join their latest snapshot, and sort by total solved
        const leaderboardData = await db
            .select({
                id: studentsTable.id,
                name: studentsTable.name,
                rollNumber: studentsTable.rollNumber,
                branch: studentsTable.branch,
                batchYear: studentsTable.batchYear,
                lcTotal: sql<number>`COALESCE(${dailySnapshots.lcTotal}, 0)`.as("lc_total"),
                gfgTotal: sql<number>`COALESCE(${dailySnapshots.gfgTotal}, 0)`.as("gfg_total"),
                totalSolved: sql<number>`COALESCE(${dailySnapshots.lcTotal}, 0) + COALESCE(${dailySnapshots.gfgTotal}, 0)`.as("total_solved"),
            })
            .from(studentsTable)
            .leftJoin(latestSnapshots, eq(studentsTable.id, latestSnapshots.studentId))
            .leftJoin(
                dailySnapshots,
                and(
                    eq(dailySnapshots.studentId, studentsTable.id),
                    eq(dailySnapshots.date, sql`CAST(${latestSnapshots.maxDate} AS DATE)`)
                )
            )
            .where(batch ? eq(studentsTable.batchYear, Number(batch)) : undefined)
            .orderBy(desc(sql`total_solved`));

        // 2. Save to Cache
        cache.set(cacheKey, leaderboardData);

        res.status(200).json(ApiResponse.success("Leaderboard fetched successfully", 200, leaderboardData));
    }

    public async exportLeaderboard(req: Request, res: Response) {
        const { batch } = req.query;

        // 1. Fetch exact same data as leaderboard
        const latestSnapshots = db
            .select({
                studentId: dailySnapshots.studentId,
                maxDate: sql<string>`MAX(${dailySnapshots.date})`.as("max_date")
            })
            .from(dailySnapshots)
            .groupBy(dailySnapshots.studentId)
            .as("latest_snapshots");

        const leaderboardData = await db
            .select({
                name: studentsTable.name,
                rollNumber: studentsTable.rollNumber,
                branch: studentsTable.branch,
                batchYear: studentsTable.batchYear,
                lcTotal: sql<number>`COALESCE(${dailySnapshots.lcTotal}, 0)`.as("lc_total"),
                gfgTotal: sql<number>`COALESCE(${dailySnapshots.gfgTotal}, 0)`.as("gfg_total"),
                totalSolved: sql<number>`COALESCE(${dailySnapshots.lcTotal}, 0) + COALESCE(${dailySnapshots.gfgTotal}, 0)`.as("total_solved"),
            })
            .from(studentsTable)
            .leftJoin(latestSnapshots, eq(studentsTable.id, latestSnapshots.studentId))
            .leftJoin(
                dailySnapshots,
                and(
                    eq(dailySnapshots.studentId, studentsTable.id),
                    eq(dailySnapshots.date, sql`CAST(${latestSnapshots.maxDate} AS DATE)`)
                )
            )
            .where(batch ? eq(studentsTable.batchYear, Number(batch)) : undefined)
            .orderBy(desc(sql`total_solved`));

        // 2. Create Excel Workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Leaderboard');

        // 3. Define columns
        worksheet.columns = [
            { header: 'Rank', key: 'rank', width: 10 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Roll Number', key: 'rollNumber', width: 20 },
            { header: 'Branch', key: 'branch', width: 15 },
            { header: 'Batch', key: 'batchYear', width: 15 },
            { header: 'LeetCode Solved', key: 'lcTotal', width: 20 },
            { header: 'GFG Solved', key: 'gfgTotal', width: 20 },
            { header: 'Total Solved', key: 'totalSolved', width: 20 },
        ];

        // 4. Add rows from our data
        leaderboardData.forEach((student, index) => {
            worksheet.addRow({
                rank: index + 1,
                name: student.name,
                rollNumber: student.rollNumber,
                branch: student.branch,
                batchYear: student.batchYear,
                lcTotal: student.lcTotal,
                gfgTotal: student.gfgTotal,
                totalSolved: student.totalSolved
            });
        });

        // Make header row bold
        worksheet.getRow(1).font = { bold: true };

        // 5. Send file directly to the client browser
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=leaderboard.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    }

    public async getStudentHistory(req: Request, res: Response) {
        const { id } = req.params;
        
        const history = await db
            .select({
                date: dailySnapshots.date,
                lcTotal: dailySnapshots.lcTotal,
                gfgTotal: dailySnapshots.gfgTotal,
                totalSolved: sql<number>`COALESCE(${dailySnapshots.lcTotal}, 0) + COALESCE(${dailySnapshots.gfgTotal}, 0)`.as('total_solved')
            })
            .from(dailySnapshots)
            .where(eq(dailySnapshots.studentId, id as string))
            .orderBy(sql`${dailySnapshots.date} ASC`);

        res.status(200).json(ApiResponse.success("History fetched successfully", 200, history));
    }
}