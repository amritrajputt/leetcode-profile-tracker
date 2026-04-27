import { integer, pgTable, uuid, varchar, timestamp, date, serial, text, check, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const studentsTable = pgTable("students", {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 60 }).notNull(),
    rollNumber: varchar("roll_number", { length: 25 }).notNull().unique(),
    batchYear: integer("batch_year").notNull(),
    email: varchar({ length: 130 }).notNull().unique(),
    course: varchar("course", { length: 50 }).notNull(),
    branch: varchar("branch", { length: 50 }).notNull(),
    section: varchar("section", { length: 1 }).notNull(),
    leetcodeUserName: varchar("leetcode_username", { length: 120 }).unique(),
    geeksforgeeksUserName: varchar("geeksforgeeks_username", { length: 120 }).unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    profileCheck: check("at_least_one_profile_check", sql`${table.leetcodeUserName} IS NOT NULL OR ${table.geeksforgeeksUserName} IS NOT NULL`),
}));

export const dailySnapshots = pgTable("daily_snapshots", {
    id: uuid().primaryKey().defaultRandom(),
    studentId: uuid("student_id").notNull().references(() => studentsTable.id),
    date: date("date").notNull(),
    lcTotal: integer("lc_total").default(0),
    gfgTotal: integer("gfg_total").default(0),
    lcWeekTotal: integer("lc_week_total").default(0),
    lcMonthTotal: integer("lc_month_total").default(0),
    lcYearTotal: integer("lc_year_total").default(0),
    gfgWeekTotal: integer("gfg_week_total").default(0),
    gfgMonthTotal: integer("gfg_month_total").default(0),
    gfgYearTotal: integer("gfg_year_total").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    unqStudentDate: unique().on(table.studentId, table.date),
}));


export const facultyTable = pgTable("faculty", {
    id: uuid().primaryKey().defaultRandom(),
    email: varchar("email", { length: 130 }).notNull().unique(),
    password: text("password").notNull(),
    name: varchar("name", { length: 60 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});