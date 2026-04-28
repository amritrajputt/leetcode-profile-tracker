import { db } from "../db/index.js";
import { facultyTable } from "../db/schema.js";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

async function seed() {
    try {
       
        const email:string = process.env.email!;
        const password:string = process.env.password!;
        
        const hashedPassword = await bcryptjs.hash(password, 10);
        
        await db.insert(facultyTable).values({
            name: "Placement Head",
            email,
            password: hashedPassword,
        }).onConflictDoNothing({ target: facultyTable.email });
        
        console.log(`Faculty seeded successfully! Email: ${email}, Password: ${password}`);
    } catch (error) {
        console.error("Error seeding faculty:", error);
    } finally {
        process.exit(0);
    }
}

seed();
