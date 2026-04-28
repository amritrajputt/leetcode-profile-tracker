import type { Request, Response } from "express";
import { AddStudentDto } from "./dto/addStudent.dto.js";
import { ApiError } from "../../common/errors/error.js";
import { db } from "../../../db/index.js";
import { studentsTable, dailySnapshots } from "../../../db/schema.js";
import { eq, desc, sql, and } from "drizzle-orm";
import ExcelJS from "exceljs";
import { ApiResponse } from "../../common/response/response.js";
import { leetcodeScrapper, gfgScrapper } from "../../../utils/scrapper.js";

export class trackController {
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

        res.status(201).json(ApiResponse.created("Student added successfully", student[0]));
    }
    public async leaderBoard(req: Request, res: Response) {
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
            .orderBy(desc(sql`total_solved`));

        res.status(200).json(ApiResponse.success("Leaderboard fetched successfully", 200, leaderboardData));
    }

    public async exportLeaderboard(req: Request, res: Response) {
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
}