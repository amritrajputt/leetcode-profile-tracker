import { db } from "../db/index.js";
import { facultyTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

async function testLogin() {
    const email = "placement@aimt.edu.in";
    const password = "admin@placementhead";

    console.log("Checking faculty...");
    const faculty = await db.select().from(facultyTable).where(eq(facultyTable.email, email)).limit(1);

    if (faculty.length === 0) {
        console.log("Faculty not found");
        return;
    }

    console.log("Faculty found:", faculty[0]!.email);
    console.log("Comparing password...");
    const isMatch = await bcryptjs.compare(password, faculty[0]!.password);
    console.log("Password match:", isMatch);
}

testLogin().then(() => process.exit(0)).catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
