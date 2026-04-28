async function test() {
    const res = await fetch("http://localhost:8081/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "placement@aimt.edu.in", password: "admin@placementhead" })
    });
    const data = await res.json();
    console.log("Login Response:", data);
    
    if (data.success && data.data?.token) {
        const token = data.data.token;
        
        // Test add student (should fail if student already exists, but testing protection)
        const addRes = await fetch("http://localhost:8081/api/v1/tracker/add-student", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Test Student",
                rollNumber: "123456",
                batchYear: 2024,
                email: "test@example.com",
                course: "BTech",
                branch: "CSE",
                section: "A",
                leetcodeUserName: "test",
                geeksforgeeksUserName: "test"
            })
        });
        const addData = await addRes.json();
        console.log("Add Student Response:", addData);
        
        // Test Leaderboard
        const lbRes = await fetch("http://localhost:8081/api/v1/tracker/leaderboard", {
            headers: { "Authorization": "Bearer " + token }
        });
        const lbData = await lbRes.json();
        console.log("Leaderboard Data:", JSON.stringify(lbData).slice(0, 200) + "...");
    }
}
test().catch(console.error);
